#!/bin/bash

# EC2 Deployment Script for Name & Address App
# Run this script on a fresh Ubuntu EC2 instance

set -e

echo "🚀 Starting deployment setup..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add current user to docker group
sudo usermod -aG docker $USER

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

echo "✅ Docker and Docker Compose installed successfully!"
echo ""
echo "⚠️  IMPORTANT: Log out and log back in for Docker group changes to take effect."
echo "   Or run: newgrp docker"
echo ""
echo "📂 Next steps:"
echo "   1. Create project directory: mkdir -p ~/app && cd ~/app"
echo "   2. Upload your project files using scp or git"
echo "   3. Create .env file with your database credentials"
echo "   4. Run: docker-compose up -d --build"
echo ""
echo "🎉 Setup complete!"
