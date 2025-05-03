#!/usr/bin/env bash

# Text colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

clear
echo -e "${BOLD}=====================================================${NC}"
echo -e "${BOLD}    HackCheck-UI Setup and Launch Tool (Unix/Mac)${NC}"
echo -e "${BOLD}=====================================================${NC}"
echo

echo -e "This script will set up and start the HackCheck application for you."
echo -e "No coding experience required! Just follow the prompts."
echo

# Step 1: Check for Node.js
echo -e "${BLUE}[STEP 1/5]${NC} Checking if Node.js is installed..."
if ! command -v node &> /dev/null
then
  echo -e "${RED}[ERROR] Node.js was not found on your computer!${NC}"
  echo
  echo -e "To fix this issue:"
  echo -e "1. For Mac: Install Node.js using Homebrew with ${YELLOW}brew install node${NC}"
  echo -e "2. For Ubuntu/Debian: Use ${YELLOW}sudo apt update && sudo apt install nodejs npm${NC}"
  echo -e "3. For other systems: Download from ${YELLOW}https://nodejs.org/${NC}"
  echo -e "4. After installation, restart your terminal"
  echo -e "5. Run this script again"
  exit 1
fi

echo -e "${GREEN}[SUCCESS]${NC} Node.js is installed!"
echo -e "${BLUE}[INFO]${NC} Version: $(node -v)"

# Step 2: Setup environment
echo
echo -e "${BLUE}[STEP 2/5]${NC} Setting up environment configuration..."
if [ -f ".env" ]; then
  echo -e "${BLUE}[INFO]${NC} Configuration file already exists"
  echo -e "${BLUE}[INFO]${NC} Using existing settings from .env file"
  
  # Get current API URL
  api_url=$(grep NEXT_PUBLIC_API_BASE_URL .env | sed 's/NEXT_PUBLIC_API_BASE_URL=//g' | tr -d '"')
  echo -e "${BLUE}[INFO]${NC} Current Backend URL: ${YELLOW}${api_url}${NC}"
  
  echo
  echo -e "Would you like to keep this setting or create a new one?"
  echo -e "1 - Keep current setting"
  echo -e "2 - Enter new backend URL"
  read -p "Enter your choice (1 or 2): " choice
  
  if [ "$choice" = "2" ]; then
    setup_new_url=true
  else
    echo -e "${BLUE}[INFO]${NC} Keeping current settings"
    setup_new_url=false
  fi
else
  setup_new_url=true
fi

if [ "$setup_new_url" = true ]; then
  echo
  echo -e "The backend API URL is needed to connect to your server."
  echo -e "Example: ${YELLOW}http://localhost:8000/${NC} or ${YELLOW}http://127.0.0.1:8000/${NC}"
  echo
  read -p "Enter your backend API URL: " api_url
  
  # Remove trailing slash if present
  api_url=${api_url%/}
  
  echo "NEXT_PUBLIC_API_BASE_URL=\"$api_url\"" > .env
  echo -e "${GREEN}[SUCCESS]${NC} Created configuration with Backend URL: ${YELLOW}${api_url}${NC}"
fi

# Step 3: Install dependencies
echo
echo -e "${BLUE}[STEP 3/5]${NC} Installing required packages..."
echo -e "This may take a few minutes depending on your internet speed..."
echo
if ! npm install; then
  echo -e "${RED}[ERROR] Failed to install required packages!${NC}"
  echo
  echo -e "Possible solutions:"
  echo -e "1. Check your internet connection"
  echo -e "2. Run with sudo if it's a permissions issue: ${YELLOW}sudo ./start.sh${NC}"
  echo -e "3. If you're behind a proxy, configure npm proxy settings"
  exit 1
fi

# Step 4: Build the application
echo
echo -e "${BLUE}[STEP 4/5]${NC} Building the application..."
echo -e "This may take a minute or two..."
echo
if ! npm run build; then
  echo -e "${RED}[ERROR] Failed to build the application!${NC}"
  echo
  echo -e "Possible solutions:"
  echo -e "1. Make sure your backend API URL is correct"
  echo -e "2. Try running with sudo if it's a permissions issue"
  echo -e "3. Delete the node_modules folder and try again"
  exit 1
fi

echo
echo -e "${BLUE}[STEP 5/5]${NC} Starting the server..."
if ! npm run start; then
  echo -e "${RED}[ERROR] Failed to start the server!${NC}"
  echo
  echo -e "Possible solutions:"
  echo -e "1. Make sure your backend API URL is correct"
  echo -e "2. Try running with sudo if it's a permissions issue"
  echo -e "3. Check if another process is using the same port"
  exit 1
fi

echo
echo -e "${GREEN}[SUCCESS]${NC} The application is running!"
echo -e "Open ${YELLOW}http://localhost:3000${NC} in your browser."
