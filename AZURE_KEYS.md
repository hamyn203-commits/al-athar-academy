# Azure Integration Secrets & Configuration Reference

This document details the configuration parameters and API integration secrets required by the Al-Athar Academy production deployment on Azure App Service (`al-athar-api`).

> [!WARNING]
> Keep all actual values secure. Do not commit actual production keys to this repository. This file serves strictly as a format and variable structural reference.

---

## 1. Core Platform Configurations

| Environment Variable | Required | Description | Example / Format |
|----------------------|----------|-------------|------------------|
| `NODE_ENV` | Yes | Defines execution environment | `production` |
| `PORT` | Yes | Port internal app service routes through | `8080` or `80` |
| `WEBSITES_PORT` | Yes | Custom port mapping for Azure App Service | `8080` |
| `FRONTEND_URL` | Yes | Public frontend domain URL | `https://al-athar-academy.vercel.app` |
| `SITE_URL` | Yes | SEO and meta-tags base site URL | `https://al-athar-academy.vercel.app` |
| `API_PUBLIC_URL` | Yes | Public endpoint URL for the API backend | `https://al-athar-api.azurewebsites.net` |
| `ALLOWED_ORIGINS` | Yes | CORS allowed origins (comma-separated) | `https://al-athar-academy.vercel.app,http://localhost:5173` |

---

## 2. Authentication & Database Secrets

| Environment Variable | Required | Description | Example / Format |
|----------------------|----------|-------------|------------------|
| `MONGODB_URI` | Yes | Database connection string | `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<db>` |
| `JWT_SECRET` | Yes | Symmetric key for signing auth tokens | High-entropy random hex or string (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | Symmetric key for signing refresh tokens | High-entropy random hex or string (min 32 chars) |
| `JWT_EXPIRES_IN` | Yes | Authentication token lifetime | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Yes | Refresh token lifetime | `7d` |
| `SEED_SECRET` | Yes | Password for authorizing system db seeds | Secure secret string used to hit `/api/system/bootstrap` |

---

## 3. Artificial Intelligence Integrations

| Environment Variable | Required | Description | Example / Format |
|----------------------|----------|-------------|------------------|
| `AWS_BEARER_TOKEN_BEDROCK` | Yes | Custom integration token for Bedrock endpoints | Bearer authorization string for Anthropic Claude |
| `AWS_REGION` | Yes | Target datacenter region for AWS Bedrock | `us-east-1` |
| `BEDROCK_MODEL` | Yes | Anthropic Claude model ID | `global.anthropic.claude-sonnet-4-5-20250929-v1:0` |
| `OPENAI_API_KEY` | No | Backup AI key (OpenAI chain fallback) | `sk-proj-...` |
| `OPENAI_MODEL` | No | OpenAI model configuration | `gpt-4o-mini` |
| `GEMINI_API_KEY` | No | Backup AI key (Gemini chain fallback) | `AIzaSy...` |
| `GEMINI_MODEL` | No | Gemini model configuration | `gemini-2.0-flash` |

---

## 4. Real-Time Video Meetings (LiveKit)

| Environment Variable | Required | Description | Example / Format |
|----------------------|----------|-------------|------------------|
| `DEFAULT_MEETING_PROVIDER` | Yes | Primary interactive classroom provider | `livekit` or `jitsi` |
| `LIVEKIT_URL` | Yes | LiveKit server endpoint URL | `wss://<project>.livekit.cloud` |
| `LIVEKIT_API_KEY` | Yes | Project key generated in LiveKit console | `API...` |
| `LIVEKIT_API_SECRET` | Yes | Private key generated in LiveKit console | secure token (keep confidential) |

---

## 5. Communications & Notification Systems

| Environment Variable | Required | Description | Example / Format |
|----------------------|----------|-------------|------------------|
| `RESEND_API_KEY` | Yes | API access key for email sending provider | `re_...` |
| `EMAIL_FROM` | Yes | Sender identity displayed on system emails | `Al-Athar <noreply@alathar.edu>` |
| `TWILIO_ACCOUNT_SID` | Yes | Identifier for Twilio SMS backend | `AC...` |
| `TWILIO_AUTH_TOKEN` | Yes | Private token for SMS integration | Secure token (keep confidential) |
| `TELEGRAM_BOT_TOKEN` | Yes | Bot token for growth stats and alerts | `<bot_id>:<token>` |
