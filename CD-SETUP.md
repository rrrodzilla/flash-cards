# Continuous Deployment Setup

## Overview

Automated deployment pipeline for flash cards application to penny-pi Incus container.

## Architecture

```
GitHub Release (tag) → GitHub Actions → Build & Test → Upload Asset → Webhook → penny-pi → Deploy
```

## Components

### 1. GitHub Actions Workflow (`.github/workflows/release.yml`)
- Triggers on release publication
- Runs tests, type-check, and lint
- Builds production bundle with Vite
- Creates tarball: `flashcards-{tag}.tar.gz`
- Uploads to GitHub release assets
- Sends webhook to trigger deployment

### 2. Deployment Script (`/usr/local/bin/deploy-flashcards.sh` on penny-pi)
- Downloads release asset from GitHub
- Creates backup of current deployment
- Deploys to Incus container `flashcards-app`
- Verifies deployment
- Automatic rollback on failure
- Logs: `/var/log/flashcards-deployments.log`

### 3. Webhook Receiver (`webhook.service` on penny-pi)
- Uses `adnanh/webhook` (https://github.com/adnanh/webhook)
- Systemd service listening on port 9000
- Validates HMAC-SHA256 signatures
- Triggers deployment script on valid release events
- Logs: `journalctl -u webhook -f`
- Service status: `systemctl status webhook`
- Config: `/etc/webhook.conf`

### 4. Traefik Routing
- Public webhook endpoint configured with opaque subdomain
- Routes to localhost:9000 on penny-pi
- TLS termination with Let's Encrypt
- Full path forwarding (no prefix stripping)

## Webhook Endpoint Design

The webhook endpoint uses security best practices:
- **Opaque subdomain**: Prevents infrastructure enumeration
- **HMAC-SHA256 signing**: Validates all requests
- **TLS encryption**: End-to-end encrypted
- **No public disclosure**: Endpoint URL stored as GitHub secret

### DNS Configuration

The webhook domain uses a hybrid approach:
- **Opaque identifier**: Random hex provides security through obscurity
- **Server hint**: 2-letter prefix for operational identification (private)
- **Service prefix**: `wh-` indicates webhook service
- DNS A record points to penny-pi public IP (not disclosed in docs)

## Testing the Pipeline

### 1. Create a test release:
```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0

# Or create release via GitHub UI
# Repository → Releases → Draft a new release
# Tag: v1.0.0
# Title: v1.0.0
# Click "Publish release"
```

### 2. Monitor deployment:
```bash
# On penny-pi, watch logs in real-time
ssh root@penny-pi "tail -f /var/log/github-webhook.log"

# Or check deployment log
ssh root@penny-pi "tail -f /var/log/flashcards-deployments.log"

# Check service status
ssh root@penny-pi "systemctl status github-webhook"
```

### 3. Verify deployment:
```bash
# Check app is accessible
curl -I https://flashcard.internal.govcraft.ai

# Check container status
ssh root@penny-pi "incus list --project flashcards"

# Check nginx in container
ssh root@penny-pi "incus exec flashcards-app --project flashcards -- systemctl status nginx"
```

## Deployment Flow

1. **Developer creates GitHub release** (or pushes tag)
2. **GitHub Actions workflow runs**:
   - Checkout code
   - Install dependencies (pnpm)
   - Run tests (`pnpm test:run`)
   - Type check (`pnpm type-check`)
   - Lint (`pnpm lint`)
   - Build (`pnpm build`)
   - Create tarball from `dist/`
   - Upload to release assets
   - Send webhook POST to penny-pi
3. **Webhook receiver on penny-pi**:
   - Receives webhook event
   - Extracts tag name
   - Spawns deployment script in background
   - Returns 200 OK
4. **Deployment script**:
   - Downloads release asset from GitHub
   - Creates timestamped backup
   - Stops nginx in container
   - Clears old files
   - Extracts new files
   - Sets permissions (www-data:www-data)
   - Starts nginx
   - Verifies deployment (HTTP 200)
   - Logs deployment or rolls back on failure

## Rollback

Automatic rollback occurs if deployment verification fails. Manual rollback:

```bash
# List backups
ssh root@penny-pi "ls -lh /var/backups/flashcards/"

# Manual rollback to specific backup
ssh root@penny-pi "
  BACKUP_FILE=/var/backups/flashcards/backup-YYYYMMDD-HHMMSS.tar.gz
  incus exec flashcards-app --project flashcards -- bash -c '
    rm -rf /var/www/flashcards/* &&
    cat > /tmp/restore.tar.gz' < \$BACKUP_FILE
  incus exec flashcards-app --project flashcards -- bash -c '
    tar -xzf /tmp/restore.tar.gz -C /var/www/flashcards &&
    rm /tmp/restore.tar.gz &&
    systemctl restart nginx'
"
```

## Maintenance

### View webhook receiver logs:
```bash
ssh root@penny-pi "journalctl -u webhook -f"
```

### Restart webhook service:
```bash
ssh root@penny-pi "systemctl restart webhook"
```

### Test deployment script manually:
```bash
ssh root@penny-pi "/usr/local/bin/deploy-flashcards.sh v1.0.0"
```

### Cleanup old backups (keeps 5):
Automatic - runs on each deployment

### Update webhook secret:
```bash
# Generate new secret
NEW_SECRET=$(openssl rand -hex 32)
echo $NEW_SECRET

# Update webhook config on penny-pi
ssh root@penny-pi "sed -i 's/\"secret\": \".*\"/\"secret\": \"$NEW_SECRET\"/' /etc/webhook.conf"

# Update workflow file locally
# Edit .github/workflows/release.yml and change WEBHOOK_SECRET value

# Restart webhook service
ssh root@penny-pi "systemctl restart webhook"
```

## Troubleshooting

### Deployment failed
- Check webhook logs: `ssh root@penny-pi "journalctl -u webhook -n 50"`
- Check deployment log: `ssh root@penny-pi "cat /var/log/flashcards-deployments.log"`
- Verify release asset exists on GitHub
- Check network connectivity from penny-pi to GitHub
- Verify container is running: `incus list --project flashcards`

### Webhook not triggered
- Check webhook service: `ssh root@penny-pi "systemctl status webhook"`
- View webhook logs: `ssh root@penny-pi "journalctl -u webhook -f"`
- Verify GitHub secrets are set (WEBHOOK_URL and WEBHOOK_SECRET)
- Check GitHub Actions workflow output for curl errors
- Verify Traefik config: `ssh root@penny-pi "cat /etc/traefik/dynamic/webhook.yml"`
- Check webhook config: `ssh root@penny-pi "cat /etc/webhook.conf"`

### Build failed in GitHub Actions
- Check workflow run in GitHub Actions tab
- Verify tests pass locally: `pnpm test:run`
- Verify type-check: `pnpm type-check`
- Verify lint: `pnpm lint`

## Required GitHub Repository Secrets

Configure in repository: `Settings → Secrets and variables → Actions → New repository secret`

**WEBHOOK_URL**
- The full HTTPS URL to the webhook endpoint on penny-pi
- Format: `https://{opaque-subdomain}.govcraft.ai/hooks/flashcards-deploy`
- Stored as secret to prevent endpoint enumeration
- Get value: Contact server administrator or check penny-pi Traefik config

**WEBHOOK_SECRET**
- Get value from penny-pi: `ssh root@penny-pi "grep secret /etc/webhook.conf | grep -oP '\"secret\":\s*\"\K[^\"]+'"`
- Used for HMAC-SHA256 webhook signature validation
- Prevents unauthorized deployment triggers

## Security Notes

- Webhook secret stored in `/etc/webhook.conf` on penny-pi (access via SSH)
- HMAC-SHA256 signature validation on all webhook requests
- Deployment runs as root (required for Incus container management)
- Backups stored in `/var/backups/flashcards/` (retention: 5 most recent)
- GitHub Actions uses `GITHUB_TOKEN` (automatic, scoped to repository)
- TLS required for webhook endpoint (Let's Encrypt cert)
- Opaque subdomain prevents infrastructure enumeration
- **Never commit secrets to repository** (use GitHub Secrets)

## Files Reference

### Local Repository
- `.github/workflows/release.yml` - GitHub Actions workflow

### penny-pi Server
- `/usr/local/bin/deploy-flashcards.sh` - Deployment script
- `/usr/bin/webhook` - Webhook server binary (adnanh/webhook)
- `/etc/webhook.conf` - Webhook configuration (JSON)
- `/etc/systemd/system/webhook.service` - Systemd service
- `/etc/traefik/dynamic/webhook.yml` - Traefik routing config
- `/var/log/flashcards-deployments.log` - Deployment history
- `/var/backups/flashcards/` - Deployment backups
- Logs: `journalctl -u webhook`

### Incus Container (flashcards-app)
- `/var/www/flashcards/` - Application files
- `/etc/nginx/sites-available/flashcards` - Nginx config
