# Vita Zen – Colissimo Orders Dashboard

A full-stack dashboard for viewing Colissimo orders (colis), filtering by status, and searching by code. The backend calls the official SOAP API and the frontend consumes a clean JSON API.

## Features

- SOAP-backed Node.js + Express API (`GET /api/colis?page=1`)
- 2-minute caching per page to reduce SOAP calls
- React dashboard with status filter, search, pagination, and refresh
- Secure credential handling via environment variables (never exposed in the frontend)

## Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file (or export variables in your shell) with:

```bash
COLISSIMO_USER=your_colissimo_username
COLISSIMO_PASS=your_colissimo_password
PORT=3001
```

### 3) Run the app

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## API Response Shape

`GET /api/colis?page=1`

```json
{
  "page": 1,
  "pageSize": 100,
  "items": [
    {
      "code": "...",
      "etat": "...",
      "client": "...",
      "tel": "...",
      "adresse": "...",
      "montant": 0,
      "poids": 0,
      "extra": {
        "OTHER_FIELD": "..."
      }
    }
  ]
}
```

## Notes

- The API automatically maps known fields and preserves all other SOAP fields under `extra` so the UI can display everything available.
- If authentication fails or the SOAP service errors, the API responds with a clear 401/500 message.
