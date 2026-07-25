<div align="center">
  <img src="./public/logo.svg" alt="RAGify logo" height="64" />

# RAGify

_Chat with your documents, together._

[![Next.js](https://img.shields.io/badge/Next.js_19-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
[![Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![Liveblocks](https://img.shields.io/badge/Liveblocks-FFE01B?style=flat-square&logo=liveblocks&logoColor=black)](https://liveblocks.io)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev)
<br />
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![npm test](https://img.shields.io/github/actions/workflow/status/suhailahmed/ragify/ci.yml?style=flat-square&label=tests)](https://github.com/suhailahmed/ragify/actions)

[Features](#features) • [Quick start](#quick-start) • [Usage](#usage) • [Project structure](#project-structure) • [FAQ](#faq)

</div>

RAGify is a full-stack SaaS application that combines RAG-powered document Q&A with real-time collaborative chat rooms. Upload a PDF, get answers grounded in your content via Gemini, and share a live chat room — no account required for guests.

> [!TIP]
> Try it live at [ragify.vercel.app](https://ragify-beta.vercel.app/) — no installation needed.

## Features

- **RAG pipeline** — documents are chunked and embedded with `gemini-embedding-2`. Every question runs semantic search against the top-4 chunks, then streams a response from Gemini 2.0 Flash. Answers are grounded in your document, not generic LLM output.
- **Cross-document chat rooms** — link multiple documents to a single chat room. Questions run RAG across all linked documents, surfacing the most relevant chunks from each source.
- **Real-time collaboration** — built on Liveblocks for presence avatars, live cursors, and message broadcasting. A 4-second polling fallback ensures no messages are missed when connections drop.
- **Guest access** — share an invite link. Anyone with the link can join a chat room and ask questions without signing up or seeing the dashboard.
- **Document insights panel** — click any document to open a slide-over with word count, estimated reading time, file size, processing progress, and linked chat rooms.
- **Slash command palette** — type `/` in the chat input to open a menu of 17 predefined prompts including multi-document commands like Compare, Synthesize, Common Themes, and Contradictions.
- **Onboarding tour** — a 6-step walkthrough on first login with spotlight overlay and skip support.
- **Chat management** — rename chats inline from the list view, delete with a confirmation dialog.
- **Dark / light theme** — persisted to localStorage, toggle from the user menu.

## Quick start

### Prerequisites

- Node.js 20+
- PostgreSQL database (Supabase free tier works)
- Google OAuth credentials — [console.cloud.google.com](https://console.cloud.google.com)
- Google AI Studio API key — [aistudio.google.com](https://aistudio.google.com)
- Uploadthing account — [uploadthing.com](https://uploadthing.com)
- Liveblocks secret key — [liveblocks.io](https://liveblocks.io)

### Setup

```bash
# Clone the repository
git clone https://github.com/suhailahmed/ragify
cd ragify

# Install dependencies
npm install

# Copy environment variables
cp env.example/.env.local .env.local
# Then edit .env.local with your credentials

# Sync the database schema
npx prisma db push

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google, upload a PDF, and start asking questions.

### Environment variables

| Variable                | Required | Description                                  |
| ----------------------- | -------- | -------------------------------------------- |
| `DATABASE_URL`          | Yes      | Supabase PostgreSQL pooler connection string |
| `DIRECT_URL`            | Yes      | Direct connection for Prisma migrations      |
| `GOOGLE_CLIENT_ID`      | Yes      | Google OAuth client ID                       |
| `GOOGLE_CLIENT_SECRET`  | Yes      | Google OAuth client secret                   |
| `BETTER_AUTH_URL`       | Yes      | `http://localhost:3000` (development)        |
| `BETTER_AUTH_SECRET`    | Yes      | Run `openssl rand -base64 32` to generate    |
| `UPLOADTHING_TOKEN`     | Yes      | Uploadthing v7 API token                     |
| `GEMINI_API_KEY`        | Yes      | Google AI Studio API key                     |
| `LIVEBLOCKS_SECRET_KEY` | Yes      | Liveblocks secret key                        |

## Usage

### Upload a document

Open the dashboard and click **Upload PDF**. Drop a file (up to 32 MB) or click to browse. The document is chunked and embedded automatically — you'll see a "Processing" status update as chunks are indexed.

### Ask questions

Open a chat room and type a question or use `/` to open the command palette:

| Command           | Prompt                                    |
| ----------------- | ----------------------------------------- |
| `/summary`        | Concise document summary                  |
| `/tldr`           | One-paragraph overview                    |
| `/key-findings`   | Extract conclusions                       |
| `/explain`        | Simplify complex concepts                 |
| `/bullets`        | Bullet-point summary                      |
| `/outline`        | Section-by-section structure              |
| `/action-items`   | List next steps and recommendations       |
| `/data`           | Extract statistics and metrics            |
| `/quotes`         | Find important passages                   |
| `/pros-cons`      | Compare approaches                        |
| `/define`         | Define key terminology                    |
| `/questions`      | Surface unanswered questions              |
| `/readme`         | Insert a README template                  |
| `/compare`        | Compare across linked documents           |
| `/synthesize`     | Synthesize insights from multiple sources |
| `/common-themes`  | Identify common themes across documents   |
| `/contradictions` | Surface contradictions between documents  |

### Cross-document chat

When creating a new chat, select multiple documents from the modal. The RAG pipeline queries chunks across all selected documents and streams a combined response.

### Invite collaborators

Click **Copy room link** in any chat room header. Share the link. Participants see messages in real time and can ask their own questions without signing up. Guests see a read-only chat interface with a "GUEST" badge; authenticated users see full dashboard controls.

### Rename a chat

Hover a chat in the chat list, click the pencil icon, type the new name, and press Enter. Changes save automatically.

### View document insights

Click any document row on the dashboard to open the insights panel. It shows word count, estimated reading time, file size, processing progress, and a list of linked chat rooms.

### Run tests

```bash
npm test
```

| Layer      | Tool                     | What's tested                                     |
| ---------- | ------------------------ | ------------------------------------------------- |
| Utilities  | Vitest                   | `cn()` class merge logic                          |
| API routes | Vitest + mocks           | Auth, validation, error codes, multi-doc creation |
| Components | Vitest + Testing Library | FAQ accordion toggle, slash command structure     |

## Architecture

```
Client (Next.js 19 App Router)
  │
  ├── Landing page        → / (public)
  ├── Sign-in             → /login (Google OAuth)
  ├── Dashboard           → /app (documents, upload, onboarding)
  ├── Chat list           → /app/chat (rename, delete)
  └── Chat room           → /app/chat/[id] (RAG + real-time)
        │
        ▼
API Routes
  ├── /api/auth/*              → better-auth handler
  ├── /api/documents           → CRUD + insights (word count, file size)
  ├── /api/documents/[id]      → document metadata + linked chat rooms
  ├── /api/chats               → CRUD (accepts `documentIds[]` for multi-doc)
  ├── /api/chats/[id]/documents→ linked documents for a room
  └── /api/chats/[id]/messages → RAG pipeline:
       user text → embed → cosine similarity search →
       top-4 chunks → Gemini stream → Liveblocks broadcast
        │
        ▼
Database (PostgreSQL + Prisma)
  ├── User / Session / Account
  ├── Document / DocumentChunk (wordCount, estimatedReadingTime, fileSize)
  ├── ChatRoom / ChatMessage (optional guestId)
  └── ChatRoomDocument (many-to-many join table)
```

## Project structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── not-found.tsx               # 404 page
│   ├── layout.tsx                  # Root layout (fonts, metadata, OG)
│   ├── sitemap.ts                  # /sitemap.xml
│   ├── login/                      # Sign-in page + error boundary
│   └── app/                        # Auth-gated application shell
│       ├── layout.tsx              # Auth guard + ThemeProvider + Liveblocks
│       ├── page.tsx                # Dashboard (document list, upload, onboarding)
│       └── chat/                   # Chat list + room + error boundaries
├── components/
│   ├── AppNav.tsx                  # In-app navigation (user menu, theme toggle)
│   ├── Header.tsx                  # Landing header (scroll-aware, mobile menu)
│   ├── Hero.tsx / Features.tsx / HowItWorks.tsx / FAQ.tsx / Footer.tsx
│   ├── DocumentInsightsPanel.tsx   # Slide-over with stats, progress, linked rooms
│   ├── NewChatModal.tsx            # Multi-select document picker for cross-doc rooms
│   ├── Tour.tsx                    # 6-step onboarding walkthrough with spotlight
│   ├── UploadZone.tsx              # Drag-and-drop PDF upload
│   ├── ThemeProvider.tsx           # Dark/light context
│   ├── SlashCommandMenu.tsx        # 17 /-commands, max-h-72 scrollable menu
│   ├── LiveblocksProvider.tsx
│   ├── ai-elements/                # PromptInput, Message, Conversation, Sources
│   └── ui/                         # Button, Dialog, Command, InputGroup, etc.
└── lib/
    ├── auth.ts / auth-client.ts    # better-auth config
    ├── prisma.ts                   # Prisma singleton
    ├── utils.ts                    # Tailwind class merge
    ├── uploadthing.ts              # Typed upload helpers
    ├── process-pdf.ts              # PDF chunking + embedding + word-count pipeline
    └── liveblocks-types.ts         # Presence, UserMeta, broadcast types
```

## FAQ

### What file types are supported?

PDF, DOCX, TXT, and Markdown. More formats coming.

### How accurate are the answers?

RAG grounds every answer in your document's content. The model searches your chunks via cosine similarity, injects the top matches into the prompt, and responds with citations from the source material.

### Can multiple people chat at the same time?

Yes. Share a room link. All participants see messages in real time through Liveblocks broadcasting. Guests can join without an account.

### Is my data used for training?

No. Documents are encrypted at rest and in transit. No content is used for model training. You control document access per chat room.

### Do I need an account to view a shared chat?

No. Only document uploaders need to sign in. Guests who receive a room link can join and ask questions immediately.

### Can I chat across multiple documents at once?

Yes. When creating a new chat, select multiple documents from the modal. The RAG pipeline searches across all linked documents. Use `/compare`, `/synthesize`, `/common-themes`, or `/contradictions` for multi-document analysis.

### What information does the insights panel show?

Word count, estimated reading time, file size, processing progress, and all chat rooms linked to the document.

## Tech stack

| Category     | Choice                                    |
| ------------ | ----------------------------------------- |
| Framework    | Next.js 19 (App Router, Turbopack)        |
| Language     | TypeScript                                |
| Database     | PostgreSQL + Prisma 7 (Supabase)          |
| Auth         | better-auth (Google OAuth)                |
| File storage | Uploadthing                               |
| Embeddings   | Gemini `gemini-embedding-2`               |
| Chat model   | Gemini 2.0 Flash                          |
| Real-time    | Liveblocks (presence, cursors, broadcast) |
| Styling      | Tailwind CSS v4                           |
| Testing      | Vitest + Testing Library                  |
| Deployment   | Vercel                                    |

## Contributing

Contributions are welcome. Open an issue or pull request on [GitHub](https://github.com/suho34/ragify).

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-change`)
3. Commit your changes (`git commit -m 'feat: add something'`)
4. Push to the branch (`git push origin feat/my-change`)
5. Open a pull request

Run `npm test` and `npx tsc --noEmit` before submitting to confirm nothing is broken.

## License

MIT &mdash; see [LICENSE](LICENSE) for details.
