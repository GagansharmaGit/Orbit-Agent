# Orbit - AI Powered Personal Assistant

Orbit is an intelligent, secure, and unified personal assistant built to streamline your daily workflow. Powered by Next.js, OpenAI, and the Model Context Protocol (MCP), Orbit securely connects to your Gmail and Google Calendar. It allows you to read, draft, send emails, and manage your schedule seamlessly—all through an intuitive chat interface.

![Orbit App](https://orbit-app-9y4r.onrender.com/icon.jpg)

## Features

- **Unified Dashboard**: View your upcoming events and recent emails in a single glance.
- **AI Agent Interface**: Chat naturally with your assistant to manage your schedule. Ask it to "Send an email to John about our meeting tomorrow" or "What does my schedule look like today?".
- **Deep Integrations**: Fully integrated with Google Calendar and Gmail APIs via the Corsair MCP tool.
- **Semantic Routing Guardrails**: Built-in security to ensure the AI remains focused strictly on email and calendar management, preventing prompt injections or unauthorized tasks.
- **Multi-tenant Architecture**: Secure data separation ensuring users can only access their own integrated accounts.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js Server Actions & API Routes, tRPC
- **Database**: PostgreSQL (Neon Serverless), Drizzle ORM
- **AI / LLM**: Vercel AI SDK, OpenAI (gpt-4o-mini)
- **Integrations**: Corsair MCP (`@corsair-dev/gmail`, `@corsair-dev/googlecalendar`)
- **Authentication**: Auth.js (NextAuth), OAuth 2.0
- **Deployment**: Render

## Getting Started

### Prerequisites

You will need the following environment variables set up in your `.env` file:

\`\`\`env
# Database
DATABASE_URL="postgresql://user:password@host/db"

# Authentication
AUTH_SECRET="your_auth_secret"
GOOGLE_CLIENT_ID="your_google_oauth_client_id"
GOOGLE_CLIENT_SECRET="your_google_oauth_client_secret"

# Corsair Integrations
CORSAIR_KEK="your_32_byte_base64_encryption_key"

# AI
OPENAI_API_KEY="your_openai_api_key"
\`\`\`

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/GagansharmaGit/Orbit-Agent.git
cd orbit
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Push the database schema:
\`\`\`bash
npm run db:push
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture

Orbit leverages the **Model Context Protocol (MCP)** to provide secure, structured access to external APIs for the LLM. Rather than manually writing rigid API wrapper functions, Orbit uses Corsair's MCP SDK to dynamically inject Gmail and Google Calendar tools directly into the Vercel AI SDK. This allows the AI to autonomously determine the best API endpoints (like `messages.send` or `events.getMany`) based on the user's natural language request.
