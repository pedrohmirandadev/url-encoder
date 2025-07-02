#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Git Hooks Manager${NC}"
    echo -e "${BLUE}================================${NC}"
}

check_husky() {
    if [ ! -d ".husky" ]; then
        print_error "Husky not installed. Run: npm install"
        exit 1
    fi
}

install_hooks() {
    print_message "Installing Git Hooks..."
    
    if ! command -v npx &> /dev/null; then
        print_error "npx not found. Install Node.js first."
        exit 1
    fi
    
    if [ ! -d ".husky" ]; then
        print_message "Installing Husky..."
        npx husky init
    fi
    
    chmod +x .husky/pre-commit
    chmod +x .husky/commit-msg
    chmod +x .husky/pre-push
    
    print_success "Git Hooks installed successfully!"
}

disable_hooks() {
    print_message "Disabling Git Hooks..."
    
    if [ -f ".husky/pre-commit" ]; then
        chmod -x .husky/pre-commit
        print_message "Pre-commit hook disabled"
    fi
    
    if [ -f ".husky/commit-msg" ]; then
        chmod -x .husky/commit-msg
        print_message "Commit-msg hook disabled"
    fi
    
    if [ -f ".husky/pre-push" ]; then
        chmod -x .husky/pre-push
        print_message "Pre-push hook disabled"
    fi
    
    print_success "Git Hooks disabled!"
}

enable_hooks() {
    print_message "Enabling Git Hooks..."
    
    if [ -f ".husky/pre-commit" ]; then
        chmod +x .husky/pre-commit
        print_message "Pre-commit hook enabled"
    fi
    
    if [ -f ".husky/commit-msg" ]; then
        chmod +x .husky/commit-msg
        print_message "Commit-msg hook enabled"
    fi
    
    if [ -f ".husky/pre-push" ]; then
        chmod +x .husky/pre-push
        print_message "Pre-push hook enabled"
    fi
    
    print_success "Git Hooks enabled!"
}

status_hooks() {
    print_message "Checking Git Hooks status..."
    
    echo ""
    echo "Available hooks:"
    echo "-----------------"
    
    if [ -f ".husky/pre-commit" ]; then
        if [ -x ".husky/pre-commit" ]; then
            echo -e "  pre-commit: ${GREEN}✓ Enabled${NC}"
        else
            echo -e "  pre-commit: ${RED}✗ Disabled${NC}"
        fi
    else
        echo -e "  pre-commit: ${YELLOW}⚠ Not found${NC}"
    fi
    
    if [ -f ".husky/commit-msg" ]; then
        if [ -x ".husky/commit-msg" ]; then
            echo -e "  commit-msg:  ${GREEN}✓ Enabled${NC}"
        else
            echo -e "  commit-msg:  ${RED}✗ Disabled${NC}"
        fi
    else
        echo -e "  commit-msg:  ${YELLOW}⚠ Not found${NC}"
    fi
    
    if [ -f ".husky/pre-push" ]; then
        if [ -x ".husky/pre-push" ]; then
            echo -e "  pre-push:    ${GREEN}✓ Enabled${NC}"
        else
            echo -e "  pre-push:    ${RED}✗ Disabled${NC}"
        fi
    else
        echo -e "  pre-push:    ${YELLOW}⚠ Not found${NC}"
    fi
    
    echo ""
}

test_hooks() {
    print_message "Testing Git Hooks..."
    
    if [ -x ".husky/pre-commit" ]; then
        print_message "Testing pre-commit hook..."
        if .husky/pre-commit; then
            print_success "Pre-commit hook working!"
        else
            print_error "Pre-commit hook failed!"
        fi
    fi
    
    echo ""
    print_message "To test completely, make a commit:"
    echo "  git add ."
    echo "  git commit -m 'test: testing hooks'"
}

show_help() {
    print_header
    echo "Usage: $0 [command]"
    echo ""
    echo "Available commands:"
    echo "  install   - Install Git Hooks"
    echo "  enable    - Enable Git Hooks"
    echo "  disable   - Disable Git Hooks"
    echo "  status    - Check hooks status"
    echo "  test      - Test Git Hooks"
    echo "  help      - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 install"
    echo "  $0 status"
    echo "  $0 test"
    echo ""
    echo "Configured hooks:"
    echo "  pre-commit  - Lint, format and tests before commit"
    echo "  commit-msg  - Message format validation"
    echo "  pre-push    - Complete tests before push"
}

main() {
    case "${1:-help}" in
        install)
            install_hooks
            ;;
        enable)
            enable_hooks
            ;;
        disable)
            disable_hooks
            ;;
        status)
            status_hooks
            ;;
        test)
            test_hooks
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Invalid command: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@" 