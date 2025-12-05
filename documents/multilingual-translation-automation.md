# Multilingual Translation Automation Feature

## Overview

This feature adds automated multilingual translation capabilities to the Kingdom Training System, enabling content creators to automatically generate and improve translations for Strategy Courses, Articles, and Tools using Google Translate API for initial translation and an LLM API (OpenAI-compatible) for quality improvement.

## Background

Currently, Polylang allows manual creation of multilingual versions of posts. This feature automates the translation workflow, making it easier to publish content in multiple languages while maintaining quality through AI-powered translation refinement.

## Feature Description

### Core Functionality

The multilingual translation automation feature provides:

1. **Automated Translation Generation**: Automatically create translated versions of English posts for all configured languages
2. **AI-Powered Quality Improvement**: Use an LLM API (OpenAI-compatible) to evaluate and improve translation quality
3. **Flexible Workflow Options**: Support both bulk translation and per-language translation workflows
4. **Resumable Processes**: Handle interruptions gracefully with the ability to restart translation processes
5. **Re-translation Capabilities**: Update existing translations when source content changes

### Target Post Types

- Strategy Courses (`strategy_course`)
- Articles (`article`)
- Tools (`tool`)

### User Workflows

#### Workflow 1: Bulk Translation from English Post

**Scenario**: Content creator has finished writing and reviewing an English post and wants to publish it in all available languages.

**Steps**:
1. User opens the English post in the WordPress admin editor
2. After reviewing the content, user clicks "Generate All Translations" button in the meta sidebar
3. System creates posts for each available language (excluding English)
4. For each language:
   - Content is copied from English post
   - Google Translate API translates the content
   - Translated content is saved to the new language post
   - LLM API evaluates the translation quality
   - LLM suggests improvements by comparing English and translated versions
   - Improved translation is saved as a new revision
5. User receives notification when process completes
6. User can review and edit translations as needed

#### Workflow 2: Per-Language Translation

**Scenario**: Content creator wants to translate a specific language or update an existing translation.

**Steps**:
1. User opens an empty or existing translated post (e.g., Hindi version)
2. User clicks "Translate from English" button in the meta sidebar
3. System identifies the English source post (via Polylang translation links)
4. System performs translation process:
   - Google Translate API translates content
   - LLM API evaluates and improves translation
   - Content is saved to the current post
5. User reviews and publishes the translation

#### Workflow 3: Re-translation

**Scenario**: English source content has been updated, or user wants to improve an existing translation.

**Steps**:
1. User opens a translated post (e.g., Spanish version)
2. User clicks "Re-translate" button in the meta sidebar
3. System identifies the English source post
4. Optionally, user can select a reference translation (e.g., French) that they're confident about
5. System performs re-translation:
   - Google Translate API translates from English
   - LLM API evaluates translation, optionally using reference translation for context
   - Improved translation is saved as a new revision
6. User reviews changes and publishes if satisfied

#### Workflow 4: Resuming Interrupted Processes

**Scenario**: Translation process was interrupted (server timeout, network issue, etc.)

**Steps**:
1. System stores progress in post meta
2. User returns to the post edit screen
3. System detects incomplete translation process
4. User clicks "Resume Translation" button
5. System continues from where it left off
6. Process completes successfully

## Technical Requirements

### API Integrations

#### Google Translate API
- **Purpose**: Initial translation of content from English to target language
- **Content Translated**:
  - Post title
  - Post content (HTML preserved)
  - Post excerpt
- **Configuration**: API key stored in WordPress options

#### LLM API (OpenAI-Compatible)
- **Purpose**: Translation quality evaluation and improvement
- **API Standard**: OpenAI-compatible API format (supports OpenAI, Anthropic Claude, Google Gemini, etc.)
- **Process**:
  1. Receives English source content and translated content
  2. Evaluates translation quality
  3. Suggests improvements (contextual accuracy, natural language flow, terminology consistency)
  4. Generates improved translation
  5. Optionally uses reference translation for better context
- **Configuration**: 
  - API endpoint base URL (e.g., `https://api.openai.com/v1` or `https://api.anthropic.com/v1`)
  - API key stored in WordPress options
  - Model name (e.g., `gpt-4`, `claude-3-opus`, `gemini-pro`)
- **API Format**: Uses OpenAI chat completions format:
  - Endpoint: `{base_url}/chat/completions` (e.g., `https://api.openai.com/v1/chat/completions`)
  - Method: POST
  - Headers: 
    - `Authorization: Bearer {api_key}`
    - `Content-Type: application/json`
    - For Anthropic: `anthropic-version: 2023-06-01` (if required)
  - Request Body:
    ```json
    {
      "model": "gpt-4",
      "messages": [
        {
          "role": "system",
          "content": "You are a translation quality evaluator..."
        },
        {
          "role": "user",
          "content": "English: {...}\nTranslation: {...}"
        }
      ],
      "temperature": 0.7,
      "max_tokens": 4000
    }
    ```
  - Response Format:
    ```json
    {
      "choices": [
        {
          "message": {
            "role": "assistant",
            "content": "Improved translation..."
          }
        }
      ]
    }
    ```
- **Provider Compatibility**: 
  - **OpenAI**: Use `https://api.openai.com/v1` as base URL
  - **Anthropic Claude**: Use `https://api.anthropic.com/v1` as base URL (may require version header)
  - **Google Gemini**: Use OpenAI-compatible endpoint if available, or adapter layer
  - **Other Providers**: Any service that implements OpenAI-compatible API format

### WordPress Integration

#### Admin UI Components

**Meta Box Location**: Right sidebar of post edit screen (after post is created/edited/reviewed)

**Meta Box Title**: "Multilingual Translation"

**Meta Box Content**:
- Current language indicator
- List of available languages with status (translated/not translated)
- Action buttons:
  - "Generate All Translations" (shown on English posts)
  - "Translate from English" (shown on empty translated posts)
  - "Re-translate" (shown on existing translated posts)
  - "Resume Translation" (shown when process interrupted)
- Progress indicator (when translation in progress)
- Status messages

#### REST API Endpoints

**Translation Endpoints**:
- `POST /wp-json/gaal/v1/translate/generate-all` - Generate translations for all languages
- `POST /wp-json/gaal/v1/translate/single` - Translate to specific language
- `POST /wp-json/gaal/v1/translate/retranslate` - Re-translate existing post
- `GET /wp-json/gaal/v1/translate/status/{post_id}` - Get translation status
- `POST /wp-json/gaal/v1/translate/resume` - Resume interrupted process

**Configuration Endpoints**:
- `GET /wp-json/gaal/v1/translate/config` - Get API configuration status
- `POST /wp-json/gaal/v1/translate/config` - Update API configuration (admin only)

#### Background Processing

- Use WordPress Cron or AJAX polling for long-running translation processes
- Store translation job status in post meta
- Handle timeouts gracefully with resumable processes
- Log translation activities for debugging

### Data Storage

#### Post Meta Fields

- `_translation_job_status` - Current translation job status (pending, in_progress, completed, failed)
- `_translation_job_progress` - Progress data (which languages completed, which are pending)
- `_translation_job_data` - Job configuration and state
- `_translation_source_post_id` - ID of English source post (for translated posts)
- `_translation_last_updated` - Timestamp of last translation update
- `_translation_reference_post_id` - Optional reference translation post ID

#### WordPress Options

- `gaal_google_translate_api_key` - Google Translate API key
- `gaal_llm_api_endpoint` - LLM API endpoint URL (OpenAI-compatible)
- `gaal_llm_api_key` - LLM API key
- `gaal_llm_model` - LLM model name (e.g., `gpt-4`, `claude-3-opus`, `gemini-pro`)
- `gaal_translation_enabled_languages` - Array of language codes to translate to (excludes English)

### Polylang Integration

- Use Polylang functions to:
  - Get available languages: `pll_languages_list()`
  - Get post language: `pll_get_post_language()`
  - Get translation links: `pll_get_post_translations()`
  - Create translation links: `pll_set_post_language()`, `pll_save_post_translations()`
- Ensure translations are properly linked in Polylang
- Respect Polylang language settings and configurations

### Content Processing

#### HTML Preservation
- Preserve HTML structure during translation
- Translate text content while maintaining tags
- Handle special elements (images, links, shortcodes) appropriately

#### Content Fields Translated
- Post title
- Post content (HTML)
- Post excerpt
- Meta descriptions (if applicable)

#### Content Not Translated
- Featured images (shared across languages)
- Post categories/tags (handled by Polylang sync)
- Custom meta fields (handled separately if needed)

## User Experience Considerations

### Progress Feedback
- Real-time progress updates via AJAX polling
- Visual progress bar showing completion status
- Status messages for each language being processed
- Error messages with actionable guidance

### Error Handling
- Clear error messages for API failures
- Retry mechanisms for transient failures
- Fallback to manual translation if automation fails
- Logging for debugging and support

### Performance
- Asynchronous processing to avoid blocking admin UI
- Batch processing for multiple languages
- Rate limiting to respect API quotas
- Caching of translation status

### Security
- Nonce verification for all AJAX requests
- Capability checks (require `edit_post` capability)
- Sanitization of all user inputs
- Secure storage of API keys

## Configuration

### Admin Settings Page

**Location**: WordPress Admin → Settings → Translation Automation

**Settings**:
- Google Translate API Key
- LLM API Endpoint URL (e.g., `https://api.openai.com/v1` or `https://api.anthropic.com/v1`)
- LLM API Key
- LLM Model Name (e.g., `gpt-4`, `claude-3-opus`, `gemini-pro`)
- Enabled Languages (checkboxes for each available language)
- Translation Quality Settings (temperature, max_tokens, etc.)
- Default Post Status for Translations (draft, pending, publish)
- Auto-publish Settings (optional)

### Default Behavior

- Translations created as drafts by default (allows review before publishing)
- Process runs asynchronously (doesn't block admin UI)
- Failed translations logged for review
- Source post must be published before translations can be generated

## Success Criteria

1. ✅ User can generate translations for all languages with one click
2. ✅ Translations are created and linked properly in Polylang
3. ✅ Translation quality is improved by LLM AI evaluation
4. ✅ Process can be resumed if interrupted
5. ✅ Individual language translations can be triggered independently
6. ✅ Re-translation updates existing translations when source changes
7. ✅ Admin UI provides clear feedback on translation status
8. ✅ API errors are handled gracefully with user-friendly messages
9. ✅ Translation process doesn't impact site performance
10. ✅ All translations respect WordPress content structure and formatting
11. ✅ LLM provider can be changed by updating URL and API key (OpenAI, Claude, Gemini, etc.)

## Future Enhancements

- Translation memory/cache to avoid re-translating unchanged content
- Custom terminology dictionary for domain-specific terms
- Batch translation for multiple posts
- Translation quality scoring
- Integration with human translation workflows
- Support for additional translation services
- Translation version history and rollback

## Dependencies

- WordPress 5.0+
- Polylang plugin (active)
- PHP 7.4+
- cURL extension (for API calls)
- Google Cloud account (for Translate API)
- LLM API account (OpenAI, Anthropic, Google AI Studio, or any OpenAI-compatible provider)

## Notes

- This feature enhances the existing Polylang integration without replacing it
- Manual translation and editing remain available
- Translations are suggestions that should be reviewed by content creators
- API costs should be monitored and budgeted appropriately
- LLM provider can be switched by changing the API endpoint URL and API key in settings (supports any OpenAI-compatible API)

