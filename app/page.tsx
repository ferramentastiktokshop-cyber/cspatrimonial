"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Msg = { role: "user" | "assistant"; content: string };

const INTRO = `E aí! Sou o **Steve**, teu parceiro de viralização haha. 🎬

Me fala o tema e a gente monta um roteiro que vai **parar o scroll**. Mas antes de escrever qualquer coisa, preciso de algumas infos pra acertar na mosca — me responde aí (pode mandar tudo de uma vez, no teu ritmo):

1. **Tema** — qual o assunto do Reel? Quanto mais específico, melhor (ex: "5 motivos pra ter ronda no teu condomínio").
2. **Objetivo** — o que você quer que aconteça depois? Seguidor novo? Comentário com palavra-chave? Clique no link? Salvar?
3. **CTA** — vai ter palavra-chave de comentário? Qual? Vai ter CTA de seguidor? Os dois?
4. **Público** — quem vai ver? Síndico, gerente, supervisor, empreendedor? Qual o nível técnico deles?
5. **Tom** — mais provocador, mais didático ("vou te ensinar") ou mais noticioso ("acabou de sair")?
6. **Resultado visual** — tem o que mostrar na tela? Imagem da equipe/ronda, antes vs depois, print, gravação?
7. **Duração** — tá mirando em quantos segundos? 30 / 45 / 60?

bora pra cima 🚀`;

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [password, setPassword] = useState("");
  const [gated, setGated] = useState(false);
  const [gateInput, setGateInput] = useState("");
  const [gateError, setGateError] = useState("");

  const threadRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("steve_pw");
    if (saved) setPassword(saved);
  }, []);

  useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  function autosize() {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }

  async function send(text: string, pw: string, history: Msg[]) {
    const userMsg: Msg = { role: "user", content: text };
    const nextHistory = [...history, userMsg];
    setMessages([...nextHistory, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory, password: pw }),
      });

      if (res.status === 401) {
        setStreaming(false);
        setMessages(history); // rollback
        setGated(true);
        setGateError(pw ? "Senha incorreta. Tenta de novo." : "");
        // re-stash the message the user was trying to send
        setPendingText(text);
        return;
      }

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "Erro inesperado.");
        setMessages([
          ...nextHistory,
          { role: "assistant", content: `[${errText}]` },
        ]);
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...nextHistory, { role: "assistant", content: acc }]);
      }
    } catch {
      setMessages([
        ...nextHistory,
        {
          role: "assistant",
          content:
            "[Não consegui falar com o servidor. Confere tua conexão e tenta de novo.]",
        },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  const [pendingText, setPendingText] = useState("");

  function handleSend() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    requestAnimationFrame(autosize);
    send(text, password, messages);
  }

  function handleGateSubmit() {
    const pw = gateInput.trim();
    if (!pw) return;
    sessionStorage.setItem("steve_pw", pw);
    setPassword(pw);
    setGated(false);
    setGateError("");
    setGateInput("");
    if (pendingText) {
      const t = pendingText;
      setPendingText("");
      send(t, pw, messages);
    }
  }

  function handleReset() {
    setMessages([]);
    setInput("");
    requestAnimationFrame(autosize);
  }

  if (gated) {
    return (
      <div className="gate">
        <div className="gate-card">
          <h1 className="wordmark">
            Steve<span className="dot">.</span>
          </h1>
          <p>Esse estúdio é privado. Digita a senha pra entrar.</p>
          <input
            type="password"
            value={gateInput}
            onChange={(e) => setGateInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGateSubmit()}
            placeholder="Senha"
            autoFocus
          />
          <div className="gate-error">{gateError}</div>
          <button onClick={handleGateSubmit}>Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="eyebrow">// roteirista viral</span>
          <h1 className="wordmark">
            Steve<span className="dot">.</span>
          </h1>
          <p className="tagline">
            Roteiros de Reels que param o scroll — segurança patrimonial e
            facilities pra condomínios e empresas.
          </p>
        </div>
        <div className="header-actions">
          <span className="bordao">
            bora pra cima <span className="arrow">↑</span>
          </span>
          {messages.length > 0 && (
            <button className="reset-btn" onClick={handleReset}>
              novo roteiro
            </button>
          )}
        </div>
      </header>

      <div className="thread" ref={threadRef}>
        <div className="msg assistant">
          <span className="msg-label">Steve</span>
          <div className="bubble-steve">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{INTRO}</ReactMarkdown>
          </div>
        </div>

        {messages.map((m, i) => {
          const isLast = i === messages.length - 1;
          if (m.role === "user") {
            return (
              <div className="msg user" key={i}>
                <span className="msg-label">Você</span>
                <div className="bubble-user">{m.content}</div>
              </div>
            );
          }
          return (
            <div className="msg assistant" key={i}>
              <span className="msg-label">Steve</span>
              <div className="bubble-steve">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content || ""}
                </ReactMarkdown>
                {isLast && streaming && <span className="cursor" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="composer">
        <div className="composer-inner">
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              autosize();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Manda o tema do Reel ou responde o briefing…"
            rows={1}
            disabled={streaming}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={streaming || !input.trim()}
            aria-label="Enviar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <p className="hint">
          Enter envia · Shift+Enter quebra linha · Steve faz o briefing antes de
          escrever
        </p>
      </div>
    </div>
  );
}
