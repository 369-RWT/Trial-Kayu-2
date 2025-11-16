# Al Fath Kayu - Offline Deployment Quick Start

This is a quick start guide for deploying the Al Fath Kayu costing system on a local network for completely offline operation.

## Quick Deployment (3 Steps)

### Step 1: Install Docker

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

**Windows:**
- Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop)

**macOS:**
- Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Step 2: Clone and Deploy

```bash
# Clone the repository
git clone https://github.com/369-RWT/Trial-Kayu-2.git
cd Trial-Kayu-2

# Run deployment script
./scripts/deploy-local.sh
```

### Step 3: Access the Application

- **On server:** http://localhost:3000
- **On network:** http://YOUR_SERVER_IP:3000

Replace `YOUR_SERVER_IP` with your server's IP address (shown by the deployment script).

## Default Login

- **Email:** admin@alfathkayu.com
- **Password:** Admin123!

**⚠️ Change the default password after first login!**

## Features

✅ **Completely Offline** - No internet required after initial setup  
✅ **Multi-User** - Access from multiple computers on your network  
✅ **Progressive Web App** - Install on desktop for native app experience  
✅ **Production Ready** - Optimized for performance and reliability  
✅ **Auto-Backup** - Database persistence with Docker volumes  

## Management

### Stop Application
```bash
docker-compose down
```

### Restart Application
```bash
docker-compose restart
```

### View Logs
```bash
docker-compose logs -f
```

### Backup Database
```bash
docker-compose exec postgres pg_dump -U alfathkayu alfathkayu_db > backup.sql
```

## Full Documentation

For detailed deployment instructions, troubleshooting, and advanced configuration, see [OFFLINE_DEPLOYMENT.md](./OFFLINE_DEPLOYMENT.md).

## System Requirements

- **CPU:** 2 cores minimum (4 cores recommended)
- **RAM:** 4GB minimum (8GB recommended)
- **Storage:** 10GB minimum (20GB recommended)
- **OS:** Ubuntu 20.04+, Windows 10+, macOS 10.15+
- **Network:** Local network with static IP (recommended)

## Support

For issues or questions, refer to the [full deployment guide](./OFFLINE_DEPLOYMENT.md) or check the application logs.

---

**Version:** 1.0.0  
**Last Updated:** November 2025
