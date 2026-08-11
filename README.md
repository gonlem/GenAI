# Generative AI Tools — README

This repository is a small Vue.js frontend for experimenting with GPT and Google Gemini text and image generation. It does not include a secure backend for storing API keys — calling the OpenAI or Gemini APIs directly from client-side code will expose your keys.

## Example .env file

Create a file named `.env` in the 'frontend' directory (never commit this file):

```
OPENAI_API_KEY=sk-REPLACE_WITH_YOUR_OPENAI_KEY
GEMINI_API_KEY=REPLACE_WITH_YOUR_GEMINI_API_KEY
```
