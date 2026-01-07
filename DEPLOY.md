# Panduan Deploy Bot WhatsApp ke VPS

## 1. Persiapan VPS (Ubuntu/Debian)

### Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install Google Chrome (Stable)

```bash
# Download dan install Chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install ./google-chrome-stable_current_amd64.deb -y

# Cek instalasi
google-chrome-stable --version
```

### Install Dependencies untuk Puppeteer

```bash
sudo apt-get install -y \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    wget \
    libgbm-dev
```

---

## 2. Upload Project ke VPS

### Via Git (Recommended)

```bash
cd /var/www
git clone <your-repo-url> bot-wa
cd bot-wa
```

### Via SCP (Upload langsung)

```bash
# Dari komputer lokal
scp -r ./bot-wa user@your-vps-ip:/var/www/
```

---

## 3. Setup Project

```bash
cd /var/www/bot-wa

# Install dependencies
npm install

# Buat file .env
cp .env.example .env
nano .env

# Edit sesuai kebutuhan:
# PORT=3001
```

---

## 4. Setup PM2 (Process Manager)

### Install PM2

```bash
sudo npm install -g pm2
```

### Buat file ecosystem

```bash
nano ecosystem.config.js
```

Isi dengan:

```javascript
module.exports = {
  apps: [
    {
      name: "bot-wa",
      script: "main.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
```

### Jalankan dengan PM2

```bash
# Start aplikasi
pm2 start ecosystem.config.js

# Lihat status
pm2 status

# Lihat logs (untuk scan QR)
pm2 logs bot-wa

# Auto-start saat VPS reboot
pm2 startup
pm2 save
```

---

## 5. Setup Nginx (Reverse Proxy)

### Install Nginx

```bash
sudo apt install nginx -y
```

### Buat konfigurasi

```bash
sudo nano /etc/nginx/sites-available/bot-wa
```

Isi dengan:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # atau IP VPS

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Aktifkan konfigurasi

```bash
sudo ln -s /etc/nginx/sites-available/bot-wa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. Setup SSL (HTTPS) dengan Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 7. Scan QR Code

Setelah aplikasi berjalan:

```bash
# Lihat logs untuk QR code
pm2 logs bot-wa
```

Scan QR yang muncul menggunakan WhatsApp di HP.

---

## 8. Troubleshooting

### Error: Chrome tidak ditemukan

```bash
# Cek path Chrome
which google-chrome-stable

# Set environment variable jika perlu
export CHROME_PATH=/usr/bin/google-chrome-stable
```

### Error: Protocol error / Target closed

```bash
# Hapus session lama
rm -rf .wwebjs_auth .wwebjs_cache

# Restart aplikasi
pm2 restart bot-wa
```

### Error: Memory tidak cukup

```bash
# Tambah swap memory
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Cek resource

```bash
# Cek memory
free -h

# Cek disk
df -h

# Cek proses
htop
```

---

## 9. Maintenance

### Restart aplikasi

```bash
pm2 restart bot-wa
```

### Update aplikasi

```bash
cd /var/www/bot-wa
git pull
npm install
pm2 restart bot-wa
```

### Backup session WhatsApp

```bash
# Backup
tar -czvf wwebjs_backup.tar.gz .wwebjs_auth

# Restore
tar -xzvf wwebjs_backup.tar.gz
```

---

## Tips Penting

1. **Gunakan VPS minimal 2GB RAM** - Puppeteer butuh memory cukup besar
2. **Jangan logout dari HP** - Session akan invalid
3. **Backup folder `.wwebjs_auth`** - Agar tidak perlu scan QR ulang
4. **Monitor dengan PM2** - `pm2 monit`
5. **Set firewall** - Hanya buka port yang diperlukan

```bash
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```
