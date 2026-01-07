# Panduan Deploy Bot WhatsApp di Pterodactyl Panel

## Persyaratan

- Pterodactyl Panel sudah terinstall
- Egg Node.js dengan Puppeteer/Chromium support
- Minimal **2GB RAM** untuk server

---

## 1. Install Egg Node.js dengan Chromium

### Opsi A: Gunakan Parkervcp Eggs (Recommended)

1. Download egg dari: https://github.com/parkervcp/eggs/tree/master/bots/discord/discord.js-generic
2. Atau gunakan custom egg dengan Chromium

### Opsi B: Custom Egg dengan Docker Image

Gunakan Docker image yang sudah include Chromium:

- `ghcr.io/parkervcp/yolks:nodejs_18` (dengan Chromium)
- `node:18-bullseye` + install chromium

---

## 2. Buat Custom Egg (Jika Perlu)

### Buat file egg JSON:

```json
{
  "meta": {
    "version": "PTDL_v2",
    "update_url": null
  },
  "exported_at": "2026-01-07",
  "name": "Node.js WhatsApp Bot",
  "author": "your@email.com",
  "description": "Node.js dengan Chromium untuk WhatsApp Bot",
  "features": null,
  "docker_images": {
    "ghcr.io/parkervcp/yolks:nodejs_20": "ghcr.io/parkervcp/yolks:nodejs_20"
  },
  "file_denylist": [],
  "startup": "npm start",
  "config": {
    "files": "{}",
    "startup": "{}",
    "logs": "{}",
    "stop": "^C"
  },
  "scripts": {
    "installation": {
      "script": "#!/bin/bash\napt-get update\napt-get install -y chromium chromium-sandbox\nnpm install",
      "container": "ghcr.io/parkervcp/installers:debian",
      "entrypoint": "bash"
    }
  },
  "variables": [
    {
      "name": "Node.js Version",
      "description": "Version of Node.js to use",
      "env_variable": "NODE_VERSION",
      "default_value": "20",
      "user_viewable": true,
      "user_editable": true,
      "rules": "required|string",
      "sort": null,
      "field_type": "text"
    },
    {
      "name": "Chrome Path",
      "description": "Path to Chromium executable",
      "env_variable": "CHROME_PATH",
      "default_value": "/usr/bin/chromium",
      "user_viewable": true,
      "user_editable": true,
      "rules": "required|string",
      "sort": null,
      "field_type": "text"
    }
  ]
}
```

---

## 3. Setup Server di Pterodactyl

### Buat Server Baru:

1. **Name**: Bot WhatsApp
2. **Egg**: Node.js WhatsApp Bot (atau egg dengan Chromium)
3. **Resources**:
   - Memory: **2048 MB** (minimum)
   - Disk: **5000 MB**
   - CPU: **100%**

### Environment Variables:

| Variable      | Value                                                |
| ------------- | ---------------------------------------------------- |
| `PORT`        | `3001`                                               |
| `CHROME_PATH` | `/usr/bin/chromium` atau `/usr/bin/chromium-browser` |
| `NODE_ENV`    | `production`                                         |

---

## 4. Upload Files

### Via SFTP:

1. Connect ke server via SFTP (lihat di tab "Settings")
2. Upload semua file project

### Via Git:

Di Console server:

```bash
git clone <your-repo-url> .
npm install
```

---

## 5. Konfigurasi Startup

### Di Pterodactyl Panel:

**Startup Command:**

```bash
npm start
```

### Update package.json:

Pastikan ada script `start`:

```json
{
  "scripts": {
    "start": "node main.js",
    "bot": "nodemon main"
  }
}
```

---

## 6. Jalankan Server

1. Klik **Start** di panel
2. Lihat **Console** untuk QR Code
3. Scan QR menggunakan WhatsApp di HP

---

## 7. Troubleshooting

### Error: Chromium not found

```bash
# Cek path chromium di console
which chromium
which chromium-browser

# Update CHROME_PATH sesuai output
```

### Error: No usable sandbox

Pastikan args puppeteer include:

- `--no-sandbox`
- `--disable-setuid-sandbox`

### Error: Memory tidak cukup

- Tingkatkan RAM server ke minimal 2GB
- Tambahkan swap jika perlu

### Error: Target closed

```bash
# Di console, hapus cache
rm -rf .wwebjs_auth .wwebjs_cache

# Restart server
```

### QR Code tidak muncul

1. Cek console untuk error
2. Pastikan port tidak diblokir
3. Restart server

---

## 8. Alternatif: Gunakan Puppeteer Built-in Chromium

Jika Egg tidak punya Chromium, install puppeteer (bukan puppeteer-core):

```bash
npm install puppeteer
```

Update kode:

```javascript
const puppeteer = require("puppeteer");

const client = new Client({
  puppeteer: {
    headless: true,
    executablePath: puppeteer.executablePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});
```

---

## 9. Port Allocation

Di Pterodactyl, tambahkan port allocation:

1. Buka **Network** tab
2. Tambahkan port (misal: 3001)
3. Update `.env`:
   ```
   PORT=3001
   ```

---

## 10. Backup Session

Untuk mencegah scan QR ulang setiap restart:

1. **Backup folder** `.wwebjs_auth` secara berkala
2. Atau gunakan **Remote Auth** dengan database

---

## Tips Penting

1. ⚠️ **Jangan gunakan shared hosting** - Butuh resources dedicated
2. ⚠️ **Minimal 2GB RAM** - Puppeteer butuh memory besar
3. ✅ **Gunakan egg dengan Chromium** - Lebih stabil
4. ✅ **Set auto-restart** - Di panel settings
5. ✅ **Monitor memory usage** - Hindari crash
