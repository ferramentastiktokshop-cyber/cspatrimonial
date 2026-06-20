import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.STEVE_MODEL || "claude-sonnet-4-6";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      "A chave ANTHROPIC_API_KEY não está configurada no servidor. Adicione ela nas Environment Variables da Vercel.",
      { status: 500 }
    );
  }

  let body: { messages?: ChatMessage[]; password?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Requisição inválida.", { status: 400 });
  }

  // Proteção opcional por senha
  const required = process.env.STEVE_PASSWORD;
  if (required && body.password !== required) {
    return new Response("unauthorized", { status: 401 });
  }

  const messages = (body.messages || []).filter(
    (m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
  );

  if (messages.length === 0) {
    return new Response("Nenhuma mensagem enviada.", { status: 400 });
  }

  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const mStream = client.messages.stream({
          model: MODEL,
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        });

        for await (const event of mStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err: any) {
        const msg =
          err?.status === 401
            ? "\n\n[Erro: chave da API inválida. Confira a ANTHROPIC_API_KEY.]"
            : err?.status === 429
            ? "\n\n[Erro: limite de uso atingido na API. Tenta de novo em instantes.]"
            : `\n\n[Erro ao gerar a resposta${err?.message ? ": " + err.message : ""}.]`;
        controller.enqueue(encoder.encode(msg));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
