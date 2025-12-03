#!/bin/bash

# Output colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Setting up environment for Electron Playwright Recorder ===${NC}\n"

# Check for Node.js
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        echo -e "${GREEN}✓ Node.js is already installed: ${NODE_VERSION}${NC}"
        return 0
    else
        echo -e "${YELLOW}✗ Node.js not found${NC}"
        return 1
    fi
}

# Check for npm
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v)
        echo -e "${GREEN}✓ npm is already installed: ${NPM_VERSION}${NC}"
        return 0
    else
        echo -e "${YELLOW}✗ npm not found${NC}"
        return 1
    fi
}

# Install Node.js via Homebrew
install_node_mac() {
    echo -e "\n${YELLOW}Starting Node.js installation...${NC}"
    
    # Check for Homebrew
    if ! command -v brew &> /dev/null; then
        echo -e "${YELLOW}Homebrew not found. Installing Homebrew...${NC}"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}✗ Error installing Homebrew${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ Homebrew successfully installed${NC}"
    else
        echo -e "${GREEN}✓ Homebrew is already installed${NC}"
    fi
    
    # Install Node.js
    echo -e "${YELLOW}Installing Node.js via Homebrew...${NC}"
    brew install node
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Error installing Node.js${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Node.js successfully installed${NC}"
}

# Install project dependencies
install_dependencies() {
    echo -e "\n${YELLOW}Installing project dependencies...${NC}"
    
    if [ ! -f "package.json" ]; then
        echo -e "${RED}✗ package.json not found in the current directory${NC}"
        exit 1
    fi
    
    npm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Error installing dependencies${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Dependencies successfully installed${NC}"
}

# Main logic
main() {
    # Check Node.js
    if ! check_node; then
        install_node_mac
        
        # Re-check after installation
        if ! check_node; then
            echo -e "${RED}✗ Node.js was not installed correctly${NC}"
            exit 1
        fi
    fi
    
    # Check npm
    if ! check_npm; then
        echo -e "${RED}✗ npm is not installed. Something went wrong during Node.js installation${NC}"
        exit 1
    fi
    
    # Install dependencies
    install_dependencies
    
    echo -e "\n${GREEN}=== Setup completed successfully! ===${NC}"
    echo -e "${GREEN}You can now start the application with: ${YELLOW}npm start${NC}"
    echo -e "${GREEN}Or use: ${YELLOW}./run.sh${NC}\n"
}

# Run
main
