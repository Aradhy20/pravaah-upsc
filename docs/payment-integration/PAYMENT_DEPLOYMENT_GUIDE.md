# Pravaah UPSC — UPI Gateway Deployment Guide

This guide details the step-by-step production deployment of the **UPI Gateway** microservice (`https://github.com/mynkdev-21/upi-gateway`) and the configuration required to connect it to **Pravaah UPSC** running on Vercel.

---

## 1. Architectural Architecture & Boundary Rule

> [!IMPORTANT]
> **Strict Separation of Concerns**: Do NOT merge the Laravel UPI Gateway codebase into the Next.js repository.
> The UPI Gateway must be deployed as an independent HTTPS microservice on a dedicated subdomain:
> - Proposed Gateway URL: `https://payments.pravaahupsc.com`
> - Pravaah UPSC Web App: `https://pravaah-upsc.vercel.app` (or custom apex/subdomain)

Pravaah UPSC communicates with the gateway exclusively via authenticated server-to-server HTTP REST calls using `X-Api-Key` and `X-Api-Secret`, and receives asynchronous cryptographically signed webhooks.

```
+-----------------------------------------------------------------------------------+
|                              SYSTEM DEPLOYMENT TOPOLOGY                           |
+-----------------------------------------------------------------------------------+

     [ Student Browser ]
             |
             | HTTPS (Next.js App)
             v
+-------------------------------+                     +-------------------------------+
|      Pravaah UPSC (Vercel)    |                     |   UPI Gateway Microservice    |
|                               |                     |   (Ubuntu VPS / Hetzner / EC2)|
| - Next.js 14 App Router       |  Server-to-Server   | - Laravel 12 / PHP 8.2+       |
| - lib/payments/upi-gateway    |-------------------->| - MySQL 8+                    |
| - API: /api/v1/payments/...   |  (API Key + Secret) | - Nginx + Certbot SSL         |
| - Webhook: /api/webhooks/...  |<--------------------| - Redis Queue Worker          |
|                               |  HMAC-SHA256 Webhook| - Dynamic UPI QR & Intent     |
+-------------------------------+                     +-------------------------------+
                |                                                     |
                v                                                     v
        [ Docker PostgreSQL ]                                 [ Bank UPI Network ]
```

---

## 2. Server Requirements for UPI Gateway Microservice

To host the Laravel UPI Gateway microservice:
- **Operating System**: Ubuntu 22.04 LTS or 24.04 LTS
- **Compute**: Minimum 1 vCPU, 2 GB RAM (4 GB recommended for production traffic)
- **Runtime**: PHP 8.2 or 8.3 with extensions (`php-fpm`, `php-mysql`, `php-curl`, `php-bcmath`, `php-mbstring`, `php-xml`, `php-zip`, `php-redis`)
- **Database**: MySQL 8.0+ or MariaDB 10.11+
- **Cache/Queue**: Redis 7.0+
- **Web Server**: Nginx with HTTP/2 and TLS 1.3
- **Process Supervisor**: `supervisor` or `systemd` to keep queue workers and outbox runners alive

---

## 3. Step-by-Step VPS Provisioning (Ubuntu 24.04)

### Step 1: Install System Dependencies
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y software-properties-common curl git unzip nginx supervisor certbot python3-certbot-nginx redis-server

# Add PHP PPA
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-curl php8.2-mbstring php8.2-xml php8.2-bcmath php8.2-zip php8.2-redis php8.2-intl

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### Step 2: Configure MySQL
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation

sudo mysql -u root -p
```
Inside MySQL prompt:
```sql
CREATE DATABASE upi_gateway_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'upigw_user'@'localhost' IDENTIFIED BY 'StrongRandomPassword_2026';
GRANT ALL PRIVILEGES ON upi_gateway_db.* TO 'upigw_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 3: Clone and Setup Laravel UPI Gateway
```bash
cd /var/www
sudo git clone https://github.com/mynkdev-21/upi-gateway.git upi-gateway
cd upi-gateway

# Set permissions
sudo chown -R www-data:www-data /var/www/upi-gateway
sudo chmod -R 775 /var/www/upi-gateway/storage /var/www/upi-gateway/bootstrap/cache

# Install PHP dependencies
sudo -u www-data composer install --no-dev --optimize-autoloader

# Setup environment
sudo cp .env.example .env
sudo nano .env
```

Configure `.env` with production settings:
```env
APP_NAME="Pravaah UPI Gateway"
APP_ENV=production
APP_KEY=base64:... # Generate via php artisan key:generate
APP_DEBUG=false
APP_URL=https://payments.pravaahupsc.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=upi_gateway_db
DB_USERNAME=upigw_user
DB_PASSWORD=StrongRandomPassword_2026

QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

UPI_VPA="merchant@okaxis" # Or merchant banking VPA
UPI_MERCHANT_NAME="Pravaah UPSC"
UPI_MERCHANT_CODE="8299" # MCC Code for Educational Services
```

Run migrations and seeders:
```bash
sudo -u www-data php artisan key:generate
sudo -u www-data php artisan migrate --force
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache
```

---

## 4. Nginx Reverse Proxy & SSL Configuration

Create `/etc/nginx/sites-available/payments.pravaahupsc.com`:
```nginx
server {
    listen 80;
    server_name payments.pravaahupsc.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name payments.pravaahupsc.com;

    root /var/www/upi-gateway/public;
    index index.php;

    ssl_certificate /etc/letsencrypt/live/payments.pravaahupsc.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/payments.pravaahupsc.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable site and request SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/payments.pravaahupsc.com /etc/nginx/sites-enabled/
sudo certbot --nginx -d payments.pravaahupsc.com
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Queue Worker & Cron Automation

Laravel requires continuous queue workers for dispatching webhook retries and polling bank settlements.

### Supervisor Worker Configuration
Create `/etc/supervisor/conf.d/upi-worker.conf`:
```ini
[program:upi-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/upi-gateway/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/upi-gateway/storage/logs/worker.log
stopwaitsecs=3600
```

Start supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start upi-worker:*
```

### Laravel Scheduler Cron
Add to www-data crontab (`sudo crontab -u www-data -e`):
```cron
* * * * * cd /var/www/upi-gateway && php artisan schedule:run >> /dev/null 2>&1
```

---

## 6. Merchant Setup & Secret Generation

1. Open `https://payments.pravaahupsc.com/login` and log into the Gateway Admin.
2. Navigate to **Merchants** -> **Create Merchant** -> `Pravaah UPSC Production`.
3. Note down the generated keys:
   - **X-Api-Key**: `ug_live_...`
   - **X-Api-Secret**: `ugs_live_...`
4. Set Webhook Configuration:
   - **Webhook URL**: `https://pravaah-upsc.vercel.app/api/webhooks/upi-gateway`
   - **Webhook Secret**: Generate a secure 64-character secret (`whsec_...`)
   - **Events**: Subscribe to `order.paid`, `order.expired`, and `order.under_review`.

---

## 7. Connecting Pravaah UPSC (Next.js on Vercel)

Log into Vercel Dashboard -> Project Settings -> **Environment Variables**, and configure:

| Environment Variable | Production Value | Development / Preview Value |
|---|---|---|
| `UPI_GATEWAY_BASE_URL` | `https://payments.pravaahupsc.com` | `https://payments.pravaahupsc.com` (or local) |
| `UPI_GATEWAY_API_KEY` | `ug_live_...` | `ug_sandbox_...` |
| `UPI_GATEWAY_API_SECRET`| `ugs_live_...` | `ugs_sandbox_...` |
| `UPI_GATEWAY_WEBHOOK_SECRET`| `whsec_...` | `whsec_test_...` |
| `UPI_GATEWAY_SANDBOX_MODE` | `false` | `true` |

Once configured, trigger a new deployment on Vercel. Test order creation and webhooks will automatically execute against the live microservice!
