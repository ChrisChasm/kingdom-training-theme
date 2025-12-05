#!/bin/bash
# Simple Google Translate API Test Script
# This script can be run on your server via SSH or WP-CLI

echo "Google Translate API Test"
echo "========================"
echo ""

# Method 1: Try WP-CLI if available
if command -v wp &> /dev/null; then
    echo "Method 1: Using WP-CLI"
    API_KEY=$(wp option get gaal_translation_google_api_key 2>/dev/null)
    if [ ! -z "$API_KEY" ]; then
        echo "✓ Found API key via WP-CLI"
        echo ""
        echo "Testing API..."
        echo ""
        
        # Test the API
        curl -s "https://translation.googleapis.com/language/translate/v2?key=${API_KEY}&q=Hello%20world&target=es&source=en" | jq .
        exit 0
    fi
fi

# Method 2: Manual API key input
echo "Method 2: Manual API Key"
echo ""
read -p "Enter your Google Translate API key (or press Ctrl+C to cancel): " API_KEY

if [ -z "$API_KEY" ]; then
    echo "Error: API key is required"
    exit 1
fi

echo ""
echo "Testing API..."
echo ""

# Test the API
curl -s "https://translation.googleapis.com/language/translate/v2?key=${API_KEY}&q=Hello%20world&target=es&source=en" | jq .

echo ""
echo "If you see an error above, that's the issue. If you see translated text, the API is working."