# Checklist: App Behind Firewall / New Public IP   

After moving the server behind a firewall or changing the public IP, use this checklist so the app works when accessed via the **new public IP** or domain (e.g. **wmp.kwsc.gos.pk**).

**Your setup:** Server internal IP `192.168.50.1` → DMZ on firewall → public IP `119.30.113.19` → domain `wmp.kwsc.gos.pk`.

---

## 0. Fix "EADDRNOTAVAIL" – server must listen on 0.0.0.0

If the app fails to start with:

```text
Error: listen EADDRNOTAVAIL: address not available 119.30.113.18:3000
```

the process is still trying to **bind** to the **old** public IP, which is no longer on this machine.

**On the server** (in `/opt/wmp16/.env` or wherever the app runs):

1. **Remove or change `HOSTNAME`.** Set it to `0.0.0.0` so the app listens on all interfaces (required when behind DMZ/firewall):

   ```bash
   HOSTNAME=0.0.0.0
   ```

2. **Do not set** `HOSTNAME=119.30.113.18` or any IP that is not assigned to this server. The Next.js standalone server uses `HOSTNAME` for the bind address; with `0.0.0.0`, it will accept connections that arrive via the firewall to `192.168.50.1`.

3. Restart the app after editing `.env`:

   ```bash
   pm2 restart wmp
   ```

---

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

## 5. E‑filing allowed IPs (EFILING_ALLOWED_IPS)

E‑filing routes (`/elogin`, `/efiling`, `/efilinguser`) only allow requests whose **client IP** (from `X-Forwarded-For` or the socket) is in `EFILING_ALLOWED_IPS`.

- **DMZ setup:** Traffic is: User → public `119.30.113.19` → firewall → server `192.168.50.1`. The app sees the **client IP** as whatever the firewall/proxy sends (often the public IP or the user’s IP in `X-Forwarded-For`). It does **not** see `192.168.50.1` as the “client” for those users; that’s the server’s own IP.
- So:
  - **`192.168.50.1`** – only allows requests that appear to come from the server itself (e.g. localhost or same-machine calls). It does **not** allow normal users coming via the firewall.
  - To allow **users coming via the public IP or domain**, include the IP the app actually sees. Typically that is the **new public IP** and/or your office/internal ranges. Example:

```bash
# In .env on the server – allow public IP and internal range (no spaces after =)
EFILING_ALLOWED_IPS=119.30.113.19,192.168.50.,127.0.0.1
```

(Allowed list is prefix-based: e.g. `192.168.50.` matches any `192.168.50.x`.)

- If you’re unsure which IP the app sees, check the log line `Client IP: …` in `pm2 logs wmp` when you open `/elogin` from the browser; add that IP (or its prefix) to `EFILING_ALLOWED_IPS`.

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
