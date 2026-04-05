# Deploy On Amazon Lightsail

This project is a Next.js 14 server app with Prisma and a local SQLite database.

For this codebase, the lowest-cost production setup on AWS Lightsail is:

- One Linux/Unix Lightsail instance
- One static IP attached to that instance
- Nginx as reverse proxy
- HTTPS with Let's Encrypt on the instance
- SQLite kept on the instance disk

Do not use Lightsail Containers for the current app if you want the lowest cost and simplest operations. The app stores data in SQLite, so it needs persistent local disk storage. A container service is more expensive and is a poor fit unless you first move Prisma to PostgreSQL or MySQL.

## Recommended plan

- Start with the $5 USD/month Linux instance with public IPv4
- Use Ubuntu 22.04 LTS or 24.04 LTS
- Attach the included static IP immediately

Why this is the right baseline:

- It is cheaper than Lightsail Containers for this app shape
- It avoids the $18/month Lightsail load balancer
- It works with SQLite without redesigning persistence
- It keeps DNS simple with O2switch

If you are willing to run IPv6-only, Lightsail has cheaper plans, but O2switch and general client compatibility are simpler with the standard public IPv4 setup.

## Production env vars

Create `.env` on the server with values like these:

```env
DATABASE_URL="file:./data/a2p.db"
PRACTITIONER_EMAIL="admin@your-domain.tld"
PRACTITIONER_PASSWORD="replace-with-a-strong-password"
PRACTITIONER_NAME="Praticien"
SESSION_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_APP_URL="https://app.your-domain.tld"
```

Notes:

- `DATABASE_URL="file:./data/a2p.db"` is resolved by Prisma relative to the Prisma schema, so the database file will live under `prisma/data/a2p.db`
- Make sure `prisma/data` exists and is writable by the app user
- `NEXT_PUBLIC_APP_URL` must match the final public URL exactly, including `https`

## Server bootstrap

SSH into the instance and install the base packages:

```bash
sudo apt update
sudo apt install -y nginx git curl build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

Clone and prepare the project:

```bash
cd /var/www
sudo mkdir -p /var/www
sudo chown "$USER":"$USER" /var/www
git clone <your-repo-url> a2p
cd a2p
npm ci
mkdir -p prisma/data
cp .env.example .env
nano .env
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run build
```

If the seed should not run twice in production, skip it after the first deploy.

## Run the app with systemd

Copy the sample service file from `deploy/lightsail/a2p.service.example` to `/etc/systemd/system/a2p.service` and update the paths, user, and domain values.

Then enable it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now a2p
sudo systemctl status a2p
```

Useful commands:

```bash
sudo journalctl -u a2p -n 100 --no-pager
sudo systemctl restart a2p
```

## Configure Nginx

Copy `deploy/lightsail/nginx.conf.example` to `/etc/nginx/sites-available/a2p` and replace `app.your-domain.tld` with your real domain.

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/a2p /etc/nginx/sites-enabled/a2p
sudo nginx -t
sudo systemctl reload nginx
```

At this point, HTTP should already proxy to the app.

## Enable HTTPS without a load balancer

Install Certbot and issue the certificate directly on the instance:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.your-domain.tld
```

If you also want `www`, add it only if that hostname points to the same server and Nginx is configured for it.

This avoids the extra monthly cost of a Lightsail load balancer.

## O2switch DNS setup

In O2switch DNS, create these records.

For a dedicated subdomain such as `app.your-domain.tld`:

- `A` record for `app` pointing to the Lightsail static IPv4

Optional:

- `AAAA` record for `app` pointing to the instance IPv6 if you enable it

For the root domain:

- `A` record for `@` pointing to the Lightsail static IPv4

For `www`:

- `CNAME` record for `www` pointing to `@` or to the root hostname if O2switch allows it
- If O2switch does not allow that shape, use another `A` record for `www` to the same static IP

Practical recommendation:

- Put the app on `app.your-domain.tld`
- Keep the root domain on your existing site or redirect it later if needed

That reduces migration risk and keeps the prototype isolated.

## First deployment sequence

Use this exact order:

1. Create the Lightsail instance
2. Attach a static IP
3. Point O2switch DNS to the static IP
4. Wait for DNS propagation
5. Install Node.js and Nginx
6. Deploy the app and start the `systemd` service
7. Verify HTTP works
8. Run Certbot for HTTPS
9. Test login, session creation, questionnaire, and result pages

## Updates

For later deployments:

```bash
cd /var/www/a2p
git pull
npm ci
npx prisma migrate deploy
npm run build
sudo systemctl restart a2p
```

## Backups and risk level

This setup is cheap, but it has one important tradeoff: SQLite lives on a single server disk.

For a prototype, that is acceptable. For anything client-critical, add at least one of these:

1. Lightsail instance snapshots before each release
2. A nightly copy of `prisma/data/a2p.db` to S3 or another backup target
3. A future migration from SQLite to PostgreSQL

## Cost summary

Approximate monthly baseline:

- Lightsail Linux instance with public IPv4: about $5/month
- Static IP: included when attached to the instance
- Nginx and Let's Encrypt: $0

Avoid these if your goal is minimum cost:

- Lightsail container service: starts above the VM price and is not ideal with SQLite
- Lightsail load balancer: extra monthly charge not needed for a single prototype app
- Lightsail managed database: much more expensive than the current SQLite setup

## When to redesign

Move away from this setup when one of these becomes true:

- More than one app server is needed
- You need zero-downtime deploys
- You need stronger backup and recovery guarantees
- You want a managed database

At that point, switch Prisma from SQLite to PostgreSQL and then reconsider Lightsail Containers, ECS, or another managed platform.