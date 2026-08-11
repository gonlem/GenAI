# Generative AI Tools — README

This repository is a small Vue.js frontend for experimenting with GPT and Google Gemini text and image generation. It does not include a secure backend for storing API keys — calling the OpenAI or Gemini APIs directly from client-side code will expose your keys. The sections below show recommended environment variables and an example minimal server proxy you can run to keep credentials secret.

## Required environment variables

Choose one of the following approaches for each provider.

OpenAI (recommended)
- OPENAI_API_KEY — your OpenAI API key (string)

Google Gemini (recommended)
Option A — Service account (recommended for server use)
- GOOGLE_APPLICATION_CREDENTIALS — path to a service account JSON file on the server (e.g. `/home/deploy/keys/gemini-sa.json`). The Google SDKs will use this file for authentication.

Option B — API key (if available / limited)
- GEMINI_API_KEY — (less recommended) an API key for the Google Generative AI service if your project supports key-based access.

Optional
- PORT — port number for the example proxy server (default: 3000)


## Example .env (server)

Create a file named `.env` in your proxy server directory (never commit this file):

```
OPENAI_API_KEY=sk-REPLACE_WITH_YOUR_OPENAI_KEY
# Either use service account JSON (preferred) or an API key for Gemini
GOOGLE_APPLICATION_CREDENTIALS=/path/to/gemini-service-account.json
# or
GEMINI_API_KEY=REPLACE_WITH_YOUR_GEMINI_API_KEY
PORT=3000
```

## Minimal example server proxy (Node + Express)

This small server forwards requests from the frontend to the provider SDKs/endpoints. It keeps API keys on the server so they are not exposed to the browser. This is a minimal example — adapt and harden for production (rate limits, auth, input validation, logging, error handling).

Install dependencies (example):

```
npm init -y
npm install express dotenv node-fetch
# or, if you prefer to use SDKs:
# npm install openai @google/gemai
```

server/index.js

```javascript
// name: server/index.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());

// Serve built frontend (optional)
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

// Example: Proxy to OpenAI (text completion/generation)
app.post('/api/openai/generate', async (req, res) => {
  try {
    const body = req.body; // { model, prompt, ... }
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI proxy error' });
  }
});

// Example: Proxy to OpenAI image generation
app.post('/api/openai/images', async (req, res) => {
  try {
    const body = req.body; // { prompt, n, size }
    const resp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI images proxy error' });
  }
});

// Example: Proxy to Google Gemini (conceptual)
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const body = req.body; // { model, prompt, ... }

    // Option A: If you install and use the @google/gemai SDK, initialize the client
    // using the GOOGLE_APPLICATION_CREDENTIALS env var. See Google GenAI docs for exact SDK usage.

    // Option B: If you must call a REST endpoint with an API key:
    if (process.env.GEMINI_API_KEY) {
      // Replace this URL with the official Google GenAI endpoint for your model
      const url = 'https://generative.googleapis.com/v1/models/YOUR_MODEL:generate?key=' + process.env.GEMINI_API_KEY;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      return res.status(resp.status).json(data);
    }

    // If using GOOGLE_APPLICATION_CREDENTIALS and the SDK, you would use the SDK client here.
    return res.status(501).json({ error: 'Gemini proxy not implemented — configure SDK or API key' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gemini proxy error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server listening on ${PORT}`));
```

How the frontend should call the proxy

```javascript
// Example from the frontend to ask the server to generate text
const response = await fetch('/api/openai/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: 'Hello' }] }),
});
const data = await response.json();
```

Security notes and next steps

- Never check your `.env` or service account JSON into source control.
- Enforce authentication on the proxy in production (e.g., session, JWT, API key) so that only authorized clients can use your quota.
- Add rate limiting and request validation to avoid abuse and accidental cost spikes.
- Consider using serverless functions (Vercel, Cloud Functions, Cloud Run) to host the proxy if you prefer managed infra.


---

If you want, I can also add the example server/index.js file to the repository and a short README section showing how to build the frontend (`npm run build` in the frontend) and serve it from the proxy. Should I commit the server code as well?