# Checklist: App Behind Firewall / New Public IP

After moving the server behind a firewall or changing the public IP, use this checklist so the app works when accessed via the **new public IP** or domain (e.g. **wmp.kwsc.gos.pk**).

## 1. NEXTAUTH_URL must match how users open the app

On the **server** (in `.env`, `ecosystem.config.js`, or systemd/nginx env), set:

- If users open **https://wmp.kwsc.gos.pk** (recommended):
  ```bash
  NEXTAUTH_URL=https://wmp.kwsc.gos.pk
  ```
- If users open **http://YOUR_NEW_PUBLIC_IP:3000** (no domain, no HTTPS):
  ```bash
  NEXTAUTH_URL=http://YOUR_NEW_PUBLIC_IP:3000
  ```

If `NEXTAUTH_URL` is wrong, login callbacks and cookies will fail when using the new IP or domain.

## 2. Reverse proxy (Nginx) – forwarded headers

If the app is behind Nginx, the proxy must send the **real** host and protocol so NextAuth and CSP use the correct origin:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
}
```

Restart Nginx after changes.

## 3. Firewall rules

Open the ports the app uses:

- **80** (HTTP) and **443** (HTTPS) if you use Nginx in front.
- **3000** only if users connect directly to the app (e.g. `http://NEW_IP:3000`).

Example (Linux with `ufw`):

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# Only if direct access to Node:
# sudo ufw allow 3000/tcp
sudo ufw reload
```

## 4. DNS for the domain

If you use **wmp.kwsc.gos.pk**, point it to the **new** public IP:

- **A record** for `wmp.kwsc.gos.pk` → new server IP (not the old 119.30.113.18).

## 5. E‑filing internal access (optional)

If e‑filing routes (`/elogin`, `/efiling`, `/efilinguser`) are restricted by IP, add the new IP (or office ranges) to the allowed list:

```bash
# In .env on the server
EFILING_ALLOWED_IPS=NEW_PUBLIC_IP,10.0.0.0/8,...
```

Use the IP(s) from which users will access the app (e.g. new public IP or internal subnet).

## 6. HTTPS and cookies

- Over **HTTP**, browsers do not send cookies marked `Secure`. So if `NEXTAUTH_URL` is `https://...` but users open **http://NEW_IP:3000**, login may not persist.
- Prefer **HTTPS** (e.g. Nginx + Let’s Encrypt) and set `NEXTAUTH_URL=https://wmp.kwsc.gos.pk`.

## 7. Restart the app after env changes

After changing `NEXTAUTH_URL` or `EFILING_ALLOWED_IPS`:

```bash
# If using PM2
pm2 restart wmp

# If using systemd
sudo systemctl restart wmp
```

## Code changes already done in this repo

- **CSP** in `middleware.js` and `middleware/efilingAuth.js` no longer hardcode the old IP `119.30.113.18`. They use the request’s host (including when behind a proxy), so the app works from the new public IP or domain without CSP blocking API/WebSocket requests.

If login still fails after this checklist, check server logs (e.g. `pm2 logs wmp`) for auth/callback errors and confirm the browser is using the same URL as `NEXTAUTH_URL` (and HTTPS if you use secure cookies).
