#!/bin/bash

# Al Fath Kayu - Local Network Deployment Script
# This script deploys the application for offline use on a local network

set -e

echo "========================================="
echo "Al Fath Kayu - Local Network Deployment"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker and Docker Compose are installed"
echo ""

# Get server IP address
echo "Detecting server IP address..."
SERVER_IP=$(hostname -I | awk '{print $1}')
echo -e "${GREEN}✓${NC} Server IP: ${SERVER_IP}"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}⚠${NC}  .env.production not found. Creating from template..."
    cp .env.production.example .env.production
    
    # Update NEXTAUTH_URL with server IP
    sed -i "s|http://localhost:3000|http://${SERVER_IP}:3000|g" .env.production
    
    echo -e "${YELLOW}⚠${NC}  Please update .env.production with your configuration:"
    echo "   - Set a secure NEXTAUTH_SECRET"
    echo "   - Update DATABASE_URL if needed"
    echo ""
    read -p "Press Enter to continue after updating .env.production..."
fi

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down 2>/dev/null || true
echo -e "${GREEN}✓${NC} Stopped existing containers"
echo ""

# Build and start containers
echo "Building and starting containers..."
echo "This may take a few minutes on first run..."
docker-compose up -d --build

# Wait for database to be ready
echo ""
echo "Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "Running database migrations..."
docker-compose exec -T app npx prisma migrate deploy

# Seed database (optional)
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Seeding database..."
    docker-compose exec -T app npx prisma db seed
    echo -e "${GREEN}✓${NC} Database seeded"
fi

echo ""
echo "========================================="
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo "========================================="
echo ""
echo "Application is now running at:"
echo -e "  ${GREEN}http://localhost:3000${NC} (on this machine)"
echo -e "  ${GREEN}http://${SERVER_IP}:3000${NC} (on local network)"
echo ""
echo "Other computers on your network can access the application at:"
echo -e "  ${YELLOW}http://${SERVER_IP}:3000${NC}"
echo ""
echo "To stop the application:"
echo "  docker-compose down"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To restart the application:"
echo "  docker-compose restart"
echo ""
