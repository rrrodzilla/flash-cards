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

### 3. Webhook Receiver (`github-webhook.service` on penny-pi)
- Systemd service listening on port 9000
- Receives GitHub webhook events
- Triggers deployment script
- Logs: `/var/log/github-webhook.log`
- Service status: `systemctl status github-webhook`

### 4. Traefik Routing
- Public webhook endpoint: `https://webhook.govcraft.ai/flashcards`
- Routes to localhost:9000
- TLS termination with Let's Encrypt

## Public Webhook Endpoint

The webhook endpoint is publicly accessible at:
```
https://webhook.govcraft.ai/flashcards
```

This endpoint:
- Is routed through Traefik on penny-pi
- Uses Let's Encrypt TLS certificate
- Forwards to the webhook receiver service (localhost:9000)
- No GitHub secrets required (webhook URL is hardcoded in workflow)

### DNS Configuration Required

Ensure `webhook.govcraft.ai` DNS record points to penny-pi's public IP.

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
ssh root@penny-pi "journalctl -u github-webhook -f"
```

### Restart webhook service:
```bash
ssh root@penny-pi "systemctl restart github-webhook"
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
ssh root@penny-pi "openssl rand -hex 32 | tee /etc/github-webhook-secret"

# Update GitHub repository secret WEBHOOK_SECRET
# Restart webhook service
ssh root@penny-pi "systemctl restart github-webhook"
```

## Troubleshooting

### Deployment failed
- Check logs: `/var/log/github-webhook.log`
- Check deployment log: `/var/log/flashcards-deployments.log`
- Verify release asset exists on GitHub
- Check network connectivity from penny-pi to GitHub
- Verify container is running: `incus list --project flashcards`

### Webhook not triggered
- Verify GitHub secrets are set correctly
- Check Traefik logs: `journalctl -u traefik -f`
- Test webhook endpoint: `curl -I https://penny-pi.tail93cb7e.ts.net/webhook/flashcards`
- Check webhook service: `systemctl status github-webhook`

### Build failed in GitHub Actions
- Check workflow run in GitHub Actions tab
- Verify tests pass locally: `pnpm test:run`
- Verify type-check: `pnpm type-check`
- Verify lint: `pnpm lint`

## Security Notes

- Webhook secret stored in `/etc/github-webhook-secret` (600 permissions, root only)
- Deployment runs as root (required for Incus container management)
- Backups stored in `/var/backups/flashcards/` (retention: 5 most recent)
- GitHub Actions uses `GITHUB_TOKEN` (automatic, scoped to repository)
- TLS required for webhook endpoint (Let's Encrypt cert)

## Files Reference

### Local Repository
- `.github/workflows/release.yml` - GitHub Actions workflow

### penny-pi Server
- `/usr/local/bin/deploy-flashcards.sh` - Deployment script
- `/usr/local/bin/github-webhook-receiver.sh` - Webhook receiver script
- `/etc/systemd/system/github-webhook.service` - Systemd service
- `/etc/github-webhook-secret` - Webhook secret (600, root)
- `/etc/traefik/dynamic/webhook.yml` - Traefik routing config
- `/var/log/github-webhook.log` - Webhook receiver logs
- `/var/log/flashcards-deployments.log` - Deployment history
- `/var/backups/flashcards/` - Deployment backups

### Incus Container (flashcards-app)
- `/var/www/flashcards/` - Application files
- `/etc/nginx/sites-available/flashcards` - Nginx config
