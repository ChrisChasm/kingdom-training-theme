#!/usr/bin/env python3
"""
Test Google Translate API Key
Tests the provided API key to see if it's configured correctly
"""

import requests
import json
import sys

# API Key provided by user
API_KEY = "AIzaSyAAi50uVDt-R-qYiqQJfVc6dv9NJwmrplo"

# Test parameters
TEST_TEXT = "Hello, world!"
SOURCE_LANGUAGE = "en"
TARGET_LANGUAGE = "es"

# API endpoint
API_ENDPOINT = "https://translation.googleapis.com/language/translate/v2"

def test_google_translate_api():
    """Test the Google Translate API with the provided key"""
    
    print("=" * 80)
    print("Google Translate API Test")
    print("=" * 80)
    print()
    print(f"API Key: {API_KEY[:10]}...{API_KEY[-4:]}")
    print()
    print("Test Translation:")
    print(f"  Source Text: {TEST_TEXT}")
    print(f"  From: {SOURCE_LANGUAGE}")
    print(f"  To: {TARGET_LANGUAGE}")
    print()
    
    # Prepare request parameters
    params = {
        'key': API_KEY,
        'q': TEST_TEXT,
        'target': TARGET_LANGUAGE,
        'source': SOURCE_LANGUAGE,
    }
    
    print("Making API request...")
    print(f"URL: {API_ENDPOINT}")
    print()
    
    try:
        # Make the request
        response = requests.get(API_ENDPOINT, params=params, timeout=30)
        
        # Get response details
        http_status = response.status_code
        response_text = response.text
        
        print("=" * 80)
        print(f"HTTP Status Code: {http_status}")
        print("=" * 80)
        print()
        
        # Try to parse JSON response
        try:
            response_data = response.json()
            print("Response (JSON):")
            print(json.dumps(response_data, indent=2))
            print()
        except json.JSONDecodeError:
            print("Response (Raw Text):")
            print(response_text)
            print()
            print("⚠️  Warning: Response is not valid JSON")
            return False
        
        # Check for errors
        if http_status != 200:
            print("❌ API Error Detected:")
            print()
            
            if 'error' in response_data:
                error = response_data['error']
                
                if 'message' in error:
                    print(f"  Message: {error['message']}")
                
                if 'errors' in error:
                    print("  Error Details:")
                    for err in error['errors']:
                        if 'message' in err:
                            print(f"    Message: {err['message']}")
                        if 'reason' in err:
                            print(f"    Reason: {err['reason']}")
                        if 'domain' in err:
                            print(f"    Domain: {err['domain']}")
                        print()
            
            # Common error reasons
            if http_status == 400:
                print("  Common causes:")
                print("    - Invalid API key")
                print("    - Missing required parameters")
                print("    - Invalid language codes")
            elif http_status == 403:
                print("  Common causes:")
                print("    - API key doesn't have permission")
                print("    - API not enabled in Google Cloud Console")
                print("    - Billing not enabled")
            elif http_status == 429:
                print("  Common causes:")
                print("    - Quota exceeded")
                print("    - Rate limit exceeded")
            
            return False
        
        # Check for successful translation
        if 'data' in response_data and 'translations' in response_data['data']:
            translations = response_data['data']['translations']
            if len(translations) > 0 and 'translatedText' in translations[0]:
                translated_text = translations[0]['translatedText']
                print("✅ Translation Successful!")
                print()
                print(f"  Original: {TEST_TEXT}")
                print(f"  Translated: {translated_text}")
                print()
                print("=" * 80)
                print("✅ API Key is working correctly!")
                print("=" * 80)
                return True
            else:
                print("❌ Unexpected response format")
                print("  Expected 'data.translations[0].translatedText'")
                return False
        else:
            print("❌ Unexpected response format")
            print("  Expected 'data.translations' in response")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
        print("  The API request took longer than 30 seconds")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection error")
        print("  Could not connect to Google Translate API")
        print("  Check your internet connection")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {type(e).__name__}")
        print(f"  {str(e)}")
        return False

if __name__ == "__main__":
    success = test_google_translate_api()
    sys.exit(0 if success else 1)