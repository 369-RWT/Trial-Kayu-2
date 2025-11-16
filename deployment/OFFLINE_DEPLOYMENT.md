# Offline Deployment Guide for Local Network

This guide explains how to deploy the Al Fath Kayu costing system on a local network for completely offline operation.

> **📁 Note**: All deployment files are organized in the `deployment/` directory to keep them separate from the main application code. This guide assumes you are running commands from the project root directory (`Trial-Kayu-2/`).

## Prerequisites

Before deployment, ensure you have the following installed on the server machine:

1. **Docker** (version 20.10 or later)
   - Download: https://docs.docker.com/get-docker/
   - For Ubuntu: `sudo apt-get install docker.io docker-compose`

2. **Git** (for cloning the repository)
   - For Ubuntu: `sudo apt-get install git`

## Deployment Methods

You can deploy the application using one of two methods:

### Method 1: Automated Deployment (Recommended)

This is the easiest method using the provided deployment script.

1. **Clone the repository** (one-time setup):
   ```bash
   git clone https://github.com/369-RWT/Trial-Kayu-2.git
   cd Trial-Kayu-2
   ```

2. **Run the deployment script**:
   ```bash
   ./deployment/scripts/deploy-local.sh
   ```

3. The script will:
   - Check for Docker installation
   - Detect your server's IP address
   - Create `deployment/.env.production` from the template
   - Build and start the application
   - Run database migrations
   - Optionally seed the database with sample data

4. **Access the application**:
   - On the server: `http://localhost:3000`
   - On other computers: `http://YOUR_SERVER_IP:3000`

### Method 2: Manual Deployment

If you prefer manual control over the deployment process:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/369-RWT/Trial-Kayu-2.git
   cd Trial-Kayu-2
   ```

2. **Create environment file**:
   ```bash
   cp deployment/.env.production.example deployment/.env.production
   ```

3. **Edit `deployment/.env.production`**:
   - Replace `localhost` with your server's IP address in `NEXTAUTH_URL`
   - Generate a secure random string for `NEXTAUTH_SECRET`:
     ```bash
     openssl rand -base64 32
     ```

4. **Build and start containers**:
   ```bash
   docker compose -f deployment/docker-compose.production.yml up -d --build
   ```

5. **Run database migrations**:
   ```bash
   docker compose -f deployment/docker-compose.production.yml exec app npx prisma migrate deploy
   ```

6. **Seed database** (optional):
   ```bash
   docker compose -f deployment/docker-compose.production.yml exec app npx prisma db seed
   ```

## Network Configuration

### Accessing from Other Computers

1. **Find your server's IP address**:
   ```bash
   hostname -I
   ```
   Example output: `192.168.1.100`

2. **Configure firewall** (if needed):
   ```bash
   sudo ufw allow 3000/tcp
   ```

3. **Access from other computers**:
   - Open a web browser
   - Navigate to: `http://192.168.1.100:3000` (replace with your server IP)

### Static IP Configuration (Recommended)

For reliable offline operation, configure a static IP for your server:

**Ubuntu/Debian:**
1. Edit netplan configuration:
   ```bash
   sudo nano /etc/netplan/01-netcfg.yaml
   ```

2. Configure static IP:
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

3. Apply configuration:
   ```bash
   sudo netplan apply
   ```

## Management Commands

All commands should be run from the **project root** directory (`Trial-Kayu-2/`).

### View Application Logs
```bash
docker compose -f deployment/docker-compose.production.yml logs -f app
```

### View Database Logs
```bash
docker compose -f deployment/docker-compose.production.yml logs -f postgres
```

### Stop the Application
```bash
docker compose -f deployment/docker-compose.production.yml down
```

### Restart the Application
```bash
docker compose -f deployment/docker-compose.production.yml restart
```

### Update the Application
```bash
git pull origin main
docker compose -f deployment/docker-compose.production.yml up -d --build
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

## Offline Operation

Once deployed, the application operates completely offline:

### What Works Offline:
✅ All core features (production, inventory, reports)  
✅ User authentication  
✅ Database operations  
✅ PWA functionality (instant loading, offline caching)  
✅ Local network access from multiple computers  

### What Requires Internet (One-Time Only):
- Initial Docker image download
- Initial npm package installation (during build)

### Making the Deployment Truly Offline:

If you need to deploy on a machine without any internet access:

1. **On a machine with internet**, save Docker images:
   ```bash
   docker save postgres:16-alpine -o postgres.tar
   docker save node:22-alpine -o node.tar
   ```

2. **Transfer files** to the offline machine:
   - The repository folder
   - Docker image tar files

3. **On the offline machine**, load Docker images:
   ```bash
   docker load -i postgres.tar
   docker load -i node.tar
   ```

4. **Deploy normally** using the deployment script or manual method

## Troubleshooting

### Application Not Accessible from Network

1. Check if the application is running:
   ```bash
   docker compose -f deployment/docker-compose.production.yml ps
   ```

2. Check firewall settings:
   ```bash
   sudo ufw status
   ```

3. Verify the application is listening on all interfaces:
   ```bash
   docker compose -f deployment/docker-compose.production.yml logs app | grep "Ready"
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

3. Restart database:
   ```bash
   docker compose -f deployment/docker-compose.production.yml restart postgres
   ```

### Port Already in Use

If port 3000 or 5432 is already in use, edit `deployment/docker-compose.production.yml`:

```yaml
services:
  app:
    ports:
      - "8080:3000"  # Change 8080 to any available port
```

## Security Recommendations

For production deployment on a local network:

1. **Change default passwords**:
   - Update `POSTGRES_PASSWORD` in `deployment/docker-compose.production.yml`
   - Update `DATABASE_URL` in `deployment/.env.production` accordingly

2. **Set a strong NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

3. **Restrict network access** (if needed):
   ```bash
   sudo ufw allow from 192.168.1.0/24 to any port 3000
   ```

4. **Regular backups**:
   - Set up automated database backups
   - Store backups on a separate machine or external drive

## Support

For issues or questions:
- Check the logs: `docker compose -f deployment/docker-compose.production.yml logs -f`
- Review this guide
- Contact your system administrator

---

**Last Updated:** November 2025  
**Version:** 1.0.0
