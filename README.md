# Pastebin-Lite

A small Pastebin-like application built with Node.js and Express.

## Features

- Create text pastes
- Shareable URLs
- Optional TTL and view-count limits
- JSON API + HTML view
- Deterministic expiry testing

## Persistence Layer

Uses **Upstash Redis** for persistent, serverless-safe storage.

## Running Locally

```bash
npm install
npm start
```
