# Checklist: App Behind Firewall / New Public IP   

After moving the server behind a firewall or changing the public IP, use this checklist so the app works when accessed via the **new public IP** or domain (e.g. **wmp.kwsc.gos.pk**).

**Your setup:** Server internal IP `192.168.50.2` (or `.1`) → DMZ on firewall → public IP `119.30.113.19` → domain `wmp.kwsc.gos.pk`.

### If the app only works on localhost / 127.0.0.1 (not 192.168.50.2:3000 or wmp.kwsc.gos.pk)

1. **Node is binding only to 127.0.0.1** — so it must listen on **0.0.0.0**. On the server in `/opt/wmp16/.env` set:
   ```bash
   HOSTNAME=0.0.0.0
   ```
   Restart: `pm2 restart wmp`. Then test from the server: `curl -I http://192.168.50.2:3000` should return HTTP headers.

2. **.env typos** — Fix so the app and Nginx work:
   - Use **`BEHIND_PROXY=true`** (underscore), not `BEHIND PROXY=true` (space).
   - Use **`::1`** in `EFILING_ALLOWED_IPS` (no space), not `:: 1`.

3. **Nginx** — Fix config and reload:
   - Change **`expires ly`** to **`expires 1y`** (typo).
   - Remove any stray **`=`** on its own line.
   - Run: `sudo nginx -t && sudo systemctl reload nginx`.

4. **PM2: `-H` and `-p` do nothing** — The Next.js **standalone** server (used by `npm start`) does **not** read `-H` or `-p` from the command line; it only uses **HOSTNAME** and **PORT** from the **environment**. So:
   ```bash
   pm2 start npm --name wmp -- start -- -H 0.0.0.0 -p 3000   # -H and -p are IGNORED
   ```
   Use one of these instead:
   - **Recommended:** `pm2 start ecosystem.config.js` (ecosystem sets `HOSTNAME=0.0.0.0` and `PORT=3000`), or
   - Put **HOSTNAME=0.0.0.0** and **PORT=3000** in **/opt/wmp16/.env**, then: `pm2 start npm --name wmp -- start`.
   After changing, run: `pm2 delete wmp` (if it exists), then start again with one of the commands above.

5. **Firewall** — From outside, 443 must reach this server. On the **firewall**, forward **TCP 443** (and 80) to the server’s internal IP (e.g. **192.168.50.2**). If the firewall doesn’t forward, https://wmp.kwsc.gos.pk and 119.30.113.19 will not reach Nginx.

See **`docs/SERVER_ENV_EXAMPLE.txt`** and **`docs/nginx-wmp.conf.example`** for a full server `.env` and Nginx config. For **firewall check commands** (firewalld, iptables, ufw, rich rules, direct rules), see **`docs/FIREWALL_CHECK_COMMANDS.md`**.

---

## 0. Fix "EADDRNOTAVAIL" – server must listen on 0.0.0.0

If the app fails to start with:

```text
Error: listen EADDRNOTAVAIL: address not available 119.30.113.19:3000
```
(or with `119.30.113.18`), the process is trying to **bind** to a public IP. That IP is **not on this machine** — it lives on the firewall. This server only has `192.168.50.2` (and 127.0.0.1). Fix both below.

### A. Fix `/etc/hosts` (hostname must not resolve to the public IP on this server)

If the server’s hostname is `wmp.kwsc.gos.pk`, the system (or Node) may resolve it via **DNS** to `119.30.113.19`. The app then tries to bind to that IP and fails.

**On the server**, edit `/etc/hosts` so the hostname resolves to an IP that **exists on this box** (e.g. `127.0.0.1` or `192.168.50.2`), not the public IP:

```text
127.0.0.1   localhost localhost.localdomain
::1         localhost localhost.localdomain
127.0.0.1   wmp.kwsc.gos.pk www.wmp.kwsc.gos.pk
```

- **Remove** any line that has only `119.30.113.19` with no hostname, or that has `wmp.kwsc.gos.pk` with **no IP** in front (invalid line).
- The line must be: **IP first**, then hostnames. So: `127.0.0.1 wmp.kwsc.gos.pk www.wmp.kwsc.gos.pk`.

Save and exit. This makes the hostname resolve locally so nothing on this server tries to bind to 119.30.113.19.

### B. Force the app to bind to 0.0.0.0 (env + start)

**On the server** (e.g. `/opt/wmp16/.env` or `/root/.pm2`-related env):

1. Set so the Next.js standalone server listens on all interfaces:

   ```bash
   HOSTNAME=0.0.0.0
   ```

2. **Do not set** `HOSTNAME` to `119.30.113.18`, `119.30.113.19`, or any IP that is not assigned to this server.

3. If you use **PM2** with `ecosystem.config.js`, ensure it doesn’t override with a wrong hostname; the repo’s `ecosystem.config.js` already has `HOSTNAME: '0.0.0.0'`. If PM2 runs `npm start` instead, that script loads `.env` — so fix `.env` as above.

4. Restart the app:

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
