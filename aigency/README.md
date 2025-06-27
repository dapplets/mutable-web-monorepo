# 🚀 Self-hosted Aigency Starter Kit

Easily self-host **Aigency**, a powerful AI-driven automation platform, using Docker on your own server.

---

## 📋 Prerequisites

Before installation, make sure you have the following:

1. **A Server** with:

   - A public IP address
   - At least **2 vCPUs**, **4 GB RAM**, **40 GB SSD**
   - **Ubuntu 24.04 LTS** (tested)

2. **Domain Configuration** — Point your domain's A-records to your server IP:

   - `api.example.com` — Aigency backend API
   - `n8n.example.com` — [n8n](https://github.com/n8n-io/n8n) low-code automation engine
   - `tgapp.example.com` — Telegram Mini App (UI for Aigency)

3. **Docker** installed on your server. You can follow [this guide](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-22-04).

4. **Telegram Bot** — Create one via [@BotFather](https://t.me/BotFather) and save the token.

5. **OpenAI API Key** — Obtain from [platform.openai.com](https://platform.openai.com/api-keys).

6. **NEAR AI API Key** — Sign in at [app.near.ai](https://app.near.ai/), open developer tools, and [locate the `auth` cookie](./docs/near-ai-api-token.png).

<details>
<summary>Optional but recommended</summary>

7. **Change the default SSH port** — edit `/etc/ssh/sshd_config`, e.g., set `Port 49100` and restart SSH

8. **Configure UFW (Uncomplicated Firewall)**

```bash
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 49100/tcp # Custom SSH port
sudo ufw allow 5432/tcp  # PostgreSQL (optional)
sudo ufw enable
```

9. **Install and configure Fail2Ban** to prevent brute-force attacks:

```bash
sudo apt install fail2ban
sudo nano /etc/fail2ban/jail.local
```

Paste the following:

```ini
[sshd]
enabled = true
port = 49100
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
findtime = 600
bantime = 3600
```

Then restart and verify:

```bash
sudo systemctl restart fail2ban
sudo fail2ban-client status sshd
```

10. **Set global log rotation policy for Docker** to prevent log growth

Edit or create the file `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:

```bash
sudo systemctl restart docker
```

</details>

---

## 🛠 Installation

1. **Clone the repository** and navigate to the Aigency directory:

   ```bash
   git clone https://github.com/dapplets/mutable-web-monorepo.git
   cd mutable-web-monorepo/aigency
   ```

2. **Set up the environment variables**:

   ```bash
   bash generate-env.sh
   nano .env
   ```

   Fill in all required values, including domain names, API keys, and Telegram token.

3. **Launch the application using Docker Compose**:

   ```bash
   docker compose up --build --no-deps --force-recreate -d
   ```

   To ensure there are no errors, you can view the logs.

   ```bash
   docker compose logs -f
   ```

4. **Access the n8n UI**:

   Open `https://n8n.example.com` in your browser and create your user account when prompted.

5. **Verify workflows**:

   - Ensure workflows are imported and `Main` workflow is active.

6. **Set the Mini App URL**:

   - Return to **@BotFather** and set the bot’s Mini App URL that you defined in `.env`, e.g. `https://tgapp.example.com`

7. ✅ **You’re ready!**

   - Start chatting with your Telegram bot to manage your Aigency instance.

---

## 🧹 Uninstallation

To stop and clean up all Docker containers, volumes, and networks:

```bash
docker compose down --volumes
```
