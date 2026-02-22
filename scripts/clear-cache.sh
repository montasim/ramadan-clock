#!/bin/bash

# Cache Clearing Script for Ramadan Clock
# This script clears all caches to ensure UI changes are reflected immediately

set -e

echo "🧹 Starting cache clearing process..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Clear Next.js build cache
echo "📦 Clearing Next.js build cache..."
if [ -d ".next" ]; then
    rm -rf .next
    print_success "Next.js build cache cleared"
else
    print_warning "Next.js build cache (.next) not found"
fi

# Clear node_modules/.cache if it exists
echo ""
echo "📦 Clearing node_modules cache..."
if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    print_success "Node modules cache cleared"
else
    print_warning "Node modules cache not found"
fi

# Clear TypeScript cache
echo ""
echo "📦 Clearing TypeScript cache..."
if [ -f "tsconfig.tsbuildinfo" ]; then
    rm -f tsconfig.tsbuildinfo
    print_success "TypeScript cache cleared"
else
    print_warning "TypeScript cache not found"
fi

# Clear ESLint cache
echo ""
echo "📦 Clearing ESLint cache..."
if [ -f ".eslintcache" ]; then
    rm -f .eslintcache
    print_success "ESLint cache cleared"
else
    print_warning "ESLint cache not found"
fi

# Clear any .swp or .swo files (Vim swap files)
echo ""
echo "📦 Clearing editor swap files..."
find . -type f \( -name "*.swp" -o -name "*.swo" -o -name "*~" \) -delete 2>/dev/null || true
print_success "Editor swap files cleared"

# Clear any log files
echo ""
echo "📦 Clearing log files..."
find . -type f -name "*.log" -delete 2>/dev/null || true
print_success "Log files cleared"

echo ""
echo "🎉 Cache clearing complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Start the development server with: npm run dev:clean"
echo "   2. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   3. If issues persist, try clearing your browser cache manually"
echo ""
