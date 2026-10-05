# Vercel backend cutover checklist

This project is deployed in parallel with the existing backend. Do not point the
frontend to it until all required production variables are present and the
functional smoke tests pass.

Required before cutover:
- MONGODB_URI
- JWT_SECRET
- JWT_REFRESH_SECRET
- FRONTEND_URL / SITE_URL / ALLOWED_ORIGINS

Feature-specific:
- LIVEKIT_URL / LIVEKIT_API_KEY / LIVEKIT_API_SECRET
- RESEND_API_KEY / EMAIL_FROM
- TWILIO_* and/or TELEGRAM_BOT_TOKEN
- AI provider keys
- external file storage configuration

The Express application itself is host-agnostic. Vercel-specific behavior is
limited to api/index.js and vercel.json.
