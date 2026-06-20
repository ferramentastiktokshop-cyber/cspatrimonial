# Steve — Roteirista Viral 🎬

App de chat que gera roteiros virais de Reels no nicho de **Segurança Patrimonial e Facilities para condomínios e empresas**, com a persona do **Steve** (parceiro de viralização) e o **Blueprint de Roteiro Viral v2.0** embutidos.

Construído em **Next.js 14** + **API da Anthropic** (Claude), com streaming em tempo real. Pronto pra subir na **Vercel**.

---

## O que ele faz

- Roda o **Steve** com a persona completa (tom, regras, protocolo de briefing) + o blueprint inteiro como conhecimento base.
- Faz o **briefing antes de escrever** qualquer roteiro, igual definido nas instruções.
- Entrega roteiro completo no formato padrão (briefing confirmado → fórmula → roteiro → diagnóstico → variações de hook).
- Sua **API key fica protegida no servidor** — nunca vai pro navegador.
- **Portão de senha opcional** pra não deixar o app aberto na web.

---

## Subir na Vercel (passo a passo)

### 1. Suba o código pro GitHub

```bash
cd steve-bot
git init
git add .
git commit -m "Steve Bot inicial"
# crie um repo vazio no GitHub e cole a URL abaixo:
git remote add origin https://github.com/SEU_USUARIO/steve-bot.git
git push -u origin main
```

### 2. Importe na Vercel

1. Entra em [vercel.com](https://vercel.com) → **Add New → Project**.
2. Importa o repositório `steve-bot`.
3. A Vercel detecta Next.js sozinha — **não muda nada** nas configs de build.

### 3. Configure as variáveis de ambiente

Em **Settings → Environment Variables**, adiciona:

| Nome | Valor | Obrigatória? |
|---|---|---|
| `ANTHROPIC_API_KEY` | sua chave (`sk-ant-...`) — pega em [console.anthropic.com](https://console.anthropic.com/settings/keys) | **Sim** |
| `STEVE_MODEL` | `claude-sonnet-4-6` (padrão) ou `claude-opus-4-8` (mais qualidade) | Não |
| `STEVE_PASSWORD` | uma senha pra travar o acesso (ex: `wahana2026`). Deixe em branco pra acesso livre | Recomendada |

### 4. Deploy

Clica em **Deploy**. Em ~1 minuto tá no ar numa URL tipo `steve-bot.vercel.app`.

> Sempre que der `git push`, a Vercel re-deploya sozinha.

---

## Rodar localmente (opcional)

```bash
cp .env.example .env.local   # preencha ANTHROPIC_API_KEY
npm install
npm run dev                  # http://localhost:3000
```

---

## Como mudar o cérebro do Steve

O conhecimento dele vive em dois arquivos:

- `lib/knowledge/persona.md` → quem é o Steve (tom, regras, briefing, formato de entrega)
- `lib/knowledge/blueprint.md` → o manual técnico (hooks, fórmulas, gatilhos, CTA)

Editou algum deles? Regenera o prompt:

```bash
npm run build:prompt
```

Isso reescreve `lib/system-prompt.ts`, que é o que o app usa em produção.

---

## Trocar o modelo

Padrão é `claude-sonnet-4-6` — rápido, barato e excelente em copy, ideal pra geração de roteiro em volume. Se quiser o máximo de capricho, troca a env `STEVE_MODEL` pra `claude-opus-4-8`.

---

## Estrutura

```
steve-bot/
├── app/
│   ├── api/chat/route.ts   # chama o Claude (server-side, streaming)
│   ├── globals.css         # identidade visual
│   ├── layout.tsx
│   └── page.tsx            # interface de chat
├── lib/
│   ├── knowledge/          # persona.md + blueprint.md (o cérebro)
│   └── system-prompt.ts    # gerado a partir dos .md
├── scripts/build-prompt.js # regenera o system prompt
├── .env.example
└── package.json
```

---

## Custo

Você paga só o uso da API da Anthropic (por token). Roteiro curto custa centavos com o Sonnet. A hospedagem na Vercel é gratuita no plano Hobby.
