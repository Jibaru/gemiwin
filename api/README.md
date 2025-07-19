<!-- README for Gemiwin API backend -->
<p align="center">
  <h1 align="center">gemiwin&nbsp;API</h1>
</p>

A lightweight REST API that lets you converse with Google Gemini models from any client application. Written in **Go**, powered by **Gin**, and packaged as a single self-contained binary for macOS, Windows and Linux.

---

## ✨ Features

- 💬 **Multi-chat sessions** – create, list, update and delete independent conversations.
- 🔧 **Per-chat model switcher** – toggle between `gemini-2.5-pro` and `gemini-2.5-flash` on demand.
- 📎 **File uploads** – attach Markdown, PDF or source-code files (≤ 1 MB) and the text is automatically extracted for extra context.
- 📝 **Persistent history** – every chat is stored as a JSON file under `data/chats/` so nothing gets lost between restarts.
- 🗂️ **Static file hosting** – uploaded documents are served back under `/files/{id}`.
- 🌐 **CORS-enabled** – ready to be consumed from your Electron/React frontend.
- 🚀 **Cross-platform binaries** built via `build.sh` (Linux, macOS, Windows; 32/64-bit).
- 🔐 **Secure & local** – your Gemini API key is persisted only in `data/app_config.json` on your machine.

---

## ⚙️ Getting Started

### Prerequisites

- **Go** ≥ 1.24.
- The [**gemini-cli**](https://github.com/GoogleCloudPlatform/gemini-cli) installed and in your `$PATH`.

> gemiwin-api is just a thin wrapper around `gemini-cli`; make sure it works from your terminal first:
>
> ```bash
> $ gemini -p "Hello!" # should print a response
> ```

### Installation (source)

```bash
# Clone repository
$ git clone https://github.com/<your-username>/gemiwin.git
$ cd gemiwin/api

# Run in development mode
$ go run ./cmd/app           # server starts on http://localhost:8080
```

### Building standalone binaries

```bash
$ ./build.sh                 # outputs gemiwinapi-{os}-{arch} into ./build/
```

---

## 🔑 Configuration

The server maintains a single JSON file at `data/app_config.json` that currently holds the **Gemini API key** that is optional:

```json
{
  "gemini_api_key": "YOUR_KEY_HERE"
}
```

You can set or update it at runtime through the API:

```bash
# Save / replace API key
curl -X PUT http://localhost:8080/config \
     -H "Content-Type: application/json" \
     -d '{"gemini_api_key":"sk-..."}'
```

If omitted, the backend will fall back to the default quota shipped with `gemini-cli`.

---

## 🏃‍♂️ Quick Demo

```bash
# 1. Start the server (default :8080)
$ go run ./cmd/app

# 2. Create a new chat
curl -X POST http://localhost:8080/chats \
     -H "Content-Type: application/json" \
     -d '{"content":"Hello, who are you?"}'

# 3. Continue the conversation
curl -X POST http://localhost:8080/chats/<CHAT_ID>/messages \
     -H "Content-Type: application/json" \
     -d '{"content":"Tell me a joke."}'
```

---

## 🛠️ Project Structure

```
api/
├── cmd/              # main entrypoint (server bootstrap)
├── internal/
│   ├── domain/       # core business models
│   ├── handlers/     # HTTP handlers (Gin)
│   ├── middlewares/  # cross-cutting concerns (CORS)
│   ├── persistence/  # simple JSON-file repositories
│   └── services/     # application logic & Gemini integration
├── data/             # chats, files & app_config.json are stored here
├── build.sh          # cross-platform compilation helper
└── apidoc.json       # OpenAPI 3.0 specification
```
