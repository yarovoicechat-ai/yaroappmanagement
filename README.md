# Voice Call Club Management Panel

Separate Next.js app for `management.voicecallclub.com`.

This panel is intentionally limited to app configuration work:

- Settings
- Gifts
- Frames
- Avatars

It does not include full-admin routes such as users, admins, hosts, calls, reports, or withdrawals.

## Development

Install dependencies, then run:

```bash
npm run dev
```

## Production

The included PM2 config runs the app on port `5051`:

```bash
npm run build
pm2 start ecosystem.config.js
```
