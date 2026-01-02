#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PORT=5173  # Vite default port

echo -e "${BLUE}===================================${NC}"
echo -e "${BLUE}Local Development Server${NC}"
echo -e "${BLUE}===================================${NC}"

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
    echo -e "${YELLOW}Loading environment variables from .env.local...${NC}"
    # Read and export environment variables (|| [ -n "$key" ] handles files without trailing newline)
    while IFS='=' read -r key value || [ -n "$key" ]; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z $key ]] && continue

        # Remove leading/trailing whitespace
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)

        # Convert PROJECT-ID to PROJECT_ID
        if [ "$key" = "PROJECT-ID" ]; then
            export PROJECT_ID="$value"
        else
            export "$key"="$value"
        fi
    done < .env.local
fi

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install
else
    echo -e "${GREEN}Dependencies already installed${NC}"
fi

echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}Starting development server...${NC}"
echo -e "${GREEN}===================================${NC}"
echo -e "${YELLOW}Local URL: http://localhost:${PORT}${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

# Run the dev server
npm run dev
