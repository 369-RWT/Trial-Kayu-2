# Deployment Directory

This directory contains all files and configurations needed for deploying the Al Fath Kayu Costing System in production environments, especially for offline local network deployments.

---

## 📁 Directory Structure

```
deployment/
├── README.md                          # This file
├── OFFLINE_DEPLOYMENT.md              # Complete offline deployment guide
├── docker-compose.production.yml      # Production Docker Compose configuration
├── Dockerfile                         # Production application container
├── .dockerignore                      # Docker build exclusions
├── .env.production.example            # Environment variables template
└── scripts/
    ├── deploy-local.sh                # Automated deployment script
    └── generate-icons.sh              # PWA icon generation
```

---

## 🚀 Quick Start (Automated)

The easiest way to deploy is using the automated script:

```bash
# From project root
./deployment/scripts/deploy-local.sh
```

This script will:
1. Check Docker installation
2. Detect your server's IP address
3. Create `.env.production` from template
4. Build and start containers
5. Run database migrations
6. Optionally seed the database

---

## 📋 Manual Deployment

If you prefer manual control:

### 1. Create Environment File
```bash
cp deployment/.env.production.example deployment/.env.production
```

Edit `deployment/.env.production` and set:
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `DATABASE_URL` - Update if using external database
- `NEXTAUTH_URL` - Set to your server's IP

### 2. Build and Start
```bash
# From project root
docker compose -f deployment/docker-compose.production.yml up -d --build
```

### 3. Run Migrations
```bash
docker compose -f deployment/docker-compose.production.yml exec app npx prisma migrate deploy
```

### 4. Seed Database (Optional)
```bash
docker compose -f deployment/docker-compose.production.yml exec app npx prisma db seed
```

---

## 🔧 Management Commands

All commands should be run from the **project root** directory.

### View Logs
```bash
# All services
docker compose -f deployment/docker-compose.production.yml logs -f

# App only
docker compose -f deployment/docker-compose.production.yml logs -f app

# Database only
docker compose -f deployment/docker-compose.production.yml logs -f postgres
```

### Stop Application
```bash
docker compose -f deployment/docker-compose.production.yml down
```

### Restart Application
```bash
docker compose -f deployment/docker-compose.production.yml restart
```

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f deployment/docker-compose.production.yml up -d --build

# Run new migrations
docker compose -f deployment/docker-compose.production.yml exec app npx prisma migrate deploy
```

### Backup Database
```bash
docker compose -f deployment/docker-compose.production.yml exec postgres \
  pg_dump -U alfathkayu alfathkayu_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
cat backup_file.sql | docker compose -f deployment/docker-compose.production.yml exec -T postgres \
  psql -U alfathkayu alfathkayu_db
```

---

## 🌐 Network Configuration

### Finding Your Server IP
```bash
hostname -I
```

### Firewall Configuration (if needed)
```bash
# Allow port 3000
sudo ufw allow 3000/tcp

# Or restrict to local network only
sudo ufw allow from 192.168.1.0/24 to any port 3000
```

### Static IP Configuration (Recommended)

**Ubuntu/Debian (Netplan):**
```bash
sudo nano /etc/netplan/01-netcfg.yaml
```

```yaml
network:
  version: 2
  ethernets:
    eth0:  # or your interface name
      dhcp4: no
      addresses:
        - 192.168.1.100/24
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

```bash
sudo netplan apply
```

---

## 🔒 Security Considerations

### Change Default Credentials

1. **Database Password**
   Edit `deployment/docker-compose.production.yml`:
   ```yaml
   POSTGRES_PASSWORD: your_secure_password
   ```

   Update `deployment/.env.production`:
   ```env
   DATABASE_URL="postgresql://alfathkayu:your_secure_password@postgres:5432/alfathkayu_db"
   ```

2. **NextAuth Secret**
   ```bash
   openssl rand -base64 32
   ```

   Add to `deployment/.env.production`:
   ```env
   NEXTAUTH_SECRET="generated_secret_here"
   ```

3. **Network Restrictions**
   ```bash
   # Only allow access from local network
   sudo ufw allow from 192.168.1.0/24 to any port 3000
   sudo ufw deny 3000/tcp
   ```

---

## 📖 Additional Documentation

- **Complete Deployment Guide**: See [OFFLINE_DEPLOYMENT.md](./OFFLINE_DEPLOYMENT.md)
- **Technical Documentation**: See `../TECHNICAL_DOCUMENTATION.md`
- **Project Summary**: See `../PROJECT_SUMMARY.md`

---

## 🛠️ Troubleshooting

### Application Not Accessible

1. Check if containers are running:
   ```bash
   docker compose -f deployment/docker-compose.production.yml ps
   ```

2. Check logs:
   ```bash
   docker compose -f deployment/docker-compose.production.yml logs app
   ```

3. Verify firewall:
   ```bash
   sudo ufw status
   ```

### Database Connection Issues

1. Check database status:
   ```bash
   docker compose -f deployment/docker-compose.production.yml exec postgres pg_isready -U alfathkayu
   ```

2. View database logs:
   ```bash
   docker compose -f deployment/docker-compose.production.yml logs postgres
   ```

### Port Already in Use

Edit `deployment/docker-compose.production.yml`:
```yaml
services:
  app:
    ports:
      - "8080:3000"  # Change 8080 to any available port
```

---

## 📊 System Requirements

- **Docker**: 20.10 or later
- **Docker Compose**: 2.0 or later
- **Disk Space**: ~2GB minimum
- **RAM**: 2GB minimum (4GB recommended)
- **Network**: Local network with static IP (recommended)

---

## ✅ Deployment Checklist

- [ ] Docker and Docker Compose installed
- [ ] Environment file created (`deployment/.env.production`)
- [ ] NEXTAUTH_SECRET generated and set
- [ ] Database password changed from default
- [ ] Server has static IP configured
- [ ] Firewall configured (if needed)
- [ ] Containers built and running
- [ ] Database migrations applied
- [ ] Database seeded (if needed)
- [ ] Application accessible on network
- [ ] Backup strategy implemented

---

**Last Updated**: 2025-11-16
**Version**: 1.0.0
