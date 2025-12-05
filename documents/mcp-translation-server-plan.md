# MCP Translation Server Plan

## Overview

This document outlines a plan for building an MCP (Model Context Protocol) server that enables AI-driven translation workflows for the Kingdom Training WordPress site. The MCP server would allow Claude to interactively translate posts, critique translations, and improve quality through multi-pass refinement.

## Why MCP?

The current translation system does:
- Google Translate → LLM improvement → save post

An MCP server would enable a **conversational, agent-driven workflow** where Claude can:
- Inspect the source content in context
- Make intelligent decisions about translation strategy
- Run multi-pass critique/improvement cycles
- Ask for human feedback at key decision points
- Handle edge cases (idioms, cultural references, domain terminology)
- Reference glossaries, style guides, and previous translations

---

## Proposed MCP Tools

### 1. Content Discovery & Reading

```typescript
// Get posts that need translation
get_untranslated_posts(
  post_type: string,      // 'article' | 'strategy_course' | 'tool'
  target_language: string // 'es' | 'fr' | 'pt' | 'zh' | 'ar' | 'hi'
)
→ Returns: Array<{
    post_id: number,
    title: string,
    post_type: string,
    date: string,
    word_count: number
  }>

// Read full post content with metadata
get_post_content(post_id: number)
→ Returns: {
    post_id: number,
    title: string,
    content: string,        // HTML content
    excerpt: string,
    post_type: string,
    language: string,
    status: string,
    linked_translations: { [lang: string]: number },
    featured_image_id: number | null,
    author: string,
    date: string
  }

// Get existing translation for comparison
get_translation_pair(
  source_post_id: number,
  target_language: string
)
→ Returns: {
    source: PostContent,
    translation: PostContent | null
  }
```

### 2. Post Creation & Polylang Linking

```typescript
// Create a new translation post, automatically linked via Polylang
create_translation_post(
  source_post_id: number,
  target_language: string,
  title: string,
  content: string,
  excerpt?: string,
  status: 'draft' | 'publish' | 'pending'
)
→ Returns: {
    post_id: number,
    edit_url: string,
    permalink: string,
    language: string
  }

// Update existing translation
update_translation_post(
  post_id: number,
  updates: {
    title?: string,
    content?: string,
    excerpt?: string,
    status?: string
  }
)
→ Returns: {
    post_id: number,
    updated_fields: string[]
  }
```

### 3. Translation Utilities

```typescript
// Machine translate via Google (for initial draft)
machine_translate(
  text: string,
  source_language: string,  // Default: 'en'
  target_language: string
)
→ Returns: {
    translated_text: string,
    detected_source_language: string
  }

// Get site's translation glossary/terminology
get_terminology_glossary(language: string)
→ Returns: {
    terms: { [english_term: string]: string },
    notes: string
  }

// Batch translate multiple text segments
batch_translate(
  segments: string[],
  source_language: string,
  target_language: string
)
→ Returns: {
    translations: string[],
    total_characters: number
  }
```

### 4. Quality Workflow Tools

```typescript
// Save a critique/review note for human review
add_translation_note(
  post_id: number,
  note_type: 'critique' | 'improvement' | 'question' | 'terminology',
  content: string
)
→ Returns: { note_id: number }

// Get translation history/versions
get_translation_history(post_id: number)
→ Returns: Array<{
    version: number,
    date: string,
    changes_summary: string
  }>

// Flag a translation for human review
flag_for_review(
  post_id: number,
  reason: string,
  sections?: string[]  // Specific sections that need attention
)
→ Returns: { flagged: boolean }
```

---

## AI-Powered Workflow Example

With these tools, a conversation might look like:

```
User: "Translate the article 'AI Fundamentals for Ministry Leaders' into Spanish"

Claude: 
1. Calls get_post_content() to read the full article
2. Analyzes the content - identifies ministry-specific terminology, 
   scripture references, cultural concepts
3. Calls get_terminology_glossary('es') to get established translations
4. Calls machine_translate() for an initial draft
5. Reviews the draft against the original, critiques issues:
   - "The phrase 'Great Commission' should use the standard Spanish term"
   - "This idiom doesn't translate well, needs cultural adaptation"
   - "The scripture reference should match Reina-Valera convention"
6. Rewrites sections that need improvement
7. Calls create_translation_post() with the polished version
8. Reports back: "Created Spanish translation as draft. Here are 3 sections 
   I'd recommend you review manually: [specific concerns]"
```

---

## Critique & Improvement Loop

The real power is in **multi-pass refinement**:

```typescript
// Conceptual workflow the agent would follow:

async function translateWithCritique(postId: number, targetLang: string) {
  // Step 1: Get source content
  const source = await get_post_content(postId);
  
  // Step 2: Get terminology glossary for consistency
  const glossary = await get_terminology_glossary(targetLang);
  
  // Step 3: Initial machine translation
  const draft = await machine_translate(source.content, 'en', targetLang);
  
  // Step 4: AI critiques its own translation
  // Claude analyzes for:
  // - Accuracy (meaning preserved?)
  // - Naturalness (sounds native?)
  // - Cultural fit (appropriate for audience?)
  // - Terminology (matches glossary?)
  // - Tone (matches source tone?)
  const critique = analyzeDraft(source.content, draft, glossary);
  
  // Step 5: AI improves based on critique
  const improved = improveDraft(draft, critique, targetLang);
  
  // Step 6: Second critique pass
  const secondCritique = analyzeDraft(source.content, improved, glossary);
  
  // Step 7: Create post with notes for human review
  const post = await create_translation_post(
    postId, 
    targetLang, 
    improved.title,
    improved.content,
    improved.excerpt,
    'draft'
  );
  
  // Step 8: Add review notes if there are concerns
  if (secondCritique.concerns.length > 0) {
    await add_translation_note(post.post_id, 'critique', secondCritique.summary);
    await flag_for_review(post.post_id, 'AI flagged sections for review', secondCritique.concerns);
  }
  
  return post;
}
```

---

## Architecture

### Recommended: Node.js MCP Server

```
┌─────────────────────────────────────────────────────┐
│         MCP Translation Server (TypeScript)         │
├─────────────────────────────────────────────────────┤
│  - Exposes tools to Claude via MCP protocol         │
│  - Calls WordPress REST API for content management  │
│  - Calls Google Translate API for machine trans.    │
│  - Manages authentication and rate limiting         │
│  - Maintains glossary and style guide context       │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│           WordPress REST API (gaal/v1/...)          │
├─────────────────────────────────────────────────────┤
│  Existing endpoints:                                │
│  - POST /translate/generate-all                     │
│  - POST /translate/single                           │
│  - POST /translate/retranslate                      │
│  - GET  /translate/status/{post_id}                 │
│  - POST /translate/copy-from-english                │
│  - POST /translate/chunked                          │
│                                                     │
│  New endpoints (if needed):                         │
│  - GET  /posts/untranslated                         │
│  - GET  /glossary/{language}                        │
│  - POST /translation-notes                          │
└─────────────────────────────────────────────────────┘
```

### File Structure

```
mcp-wordpress-translator/
├── package.json
├── tsconfig.json
├── .env.example
├── src/
│   ├── index.ts                    # MCP server entry point
│   ├── server.ts                   # MCP server configuration
│   ├── tools/
│   │   ├── index.ts                # Tool registry
│   │   ├── posts.ts                # get_post_content, get_untranslated_posts
│   │   ├── translations.ts         # create_translation_post, update_translation_post
│   │   ├── translate.ts            # machine_translate, batch_translate
│   │   ├── glossary.ts             # get_terminology_glossary
│   │   └── workflow.ts             # add_translation_note, flag_for_review
│   ├── clients/
│   │   ├── wordpress.ts            # HTTP client for WP REST API
│   │   └── google-translate.ts     # Google Cloud Translation client
│   ├── types/
│   │   ├── wordpress.ts            # WP data types
│   │   └── tools.ts                # Tool parameter/return types
│   └── config.ts                   # Environment and configuration
├── data/
│   └── glossaries/                 # Language-specific terminology files
│       ├── es.json
│       ├── fr.json
│       └── ...
└── README.md
```

---

## Configuration

### Environment Variables

```bash
# WordPress Configuration
WORDPRESS_URL=https://ai.kingdom.training
WORDPRESS_USERNAME=your-username
WORDPRESS_APP_PASSWORD=your-app-password

# Google Cloud Translation
GOOGLE_TRANSLATE_API_KEY=your-api-key

# Optional: Direct LLM access (if not using Claude via MCP)
LLM_API_ENDPOINT=https://api.openai.com/v1
LLM_API_KEY=your-key
LLM_MODEL=gpt-4
```

### Authentication Options

1. **WordPress Application Passwords** (Recommended)
   - Built into WordPress
   - Easy to revoke
   - Works with Basic Auth

2. **JWT Authentication**
   - Requires plugin (e.g., JWT Authentication for WP REST API)
   - Token-based, expires

3. **OAuth 2.0**
   - Most secure
   - More complex setup

---

## Advantages Over Current System

| Current System | MCP Approach |
|----------------|--------------|
| Single-pass: translate → improve → save | Multi-pass: translate → critique → improve → critique → save |
| Fixed prompts hardcoded in PHP | Dynamic, context-aware prompts based on content type |
| Fully automated | Human-in-the-loop: Claude can ask questions, flag concerns |
| Batch processing only | Interactive: handle one post deeply or batch intelligently |
| No persistent memory | Can reference glossaries, style guides, previous translations |
| Limited error handling | Claude can reason about errors and suggest fixes |
| One-size-fits-all | Can adapt strategy per post type (article vs course vs tool) |

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up MCP server boilerplate with TypeScript
- [ ] Implement WordPress API client with authentication
- [ ] Create `get_post_content` tool
- [ ] Create `get_untranslated_posts` tool
- [ ] Test basic read operations via Claude

### Phase 2: Translation Tools (Week 2)
- [ ] Implement `create_translation_post` tool
- [ ] Implement `update_translation_post` tool
- [ ] Integrate Google Translate via `machine_translate` tool
- [ ] Test end-to-end translation workflow

### Phase 3: Quality Workflow (Week 3)
- [ ] Create terminology glossary system
- [ ] Implement `get_terminology_glossary` tool
- [ ] Add `add_translation_note` tool
- [ ] Add `flag_for_review` tool
- [ ] Build review dashboard in WordPress admin (optional)

### Phase 4: Refinement (Week 4)
- [ ] Add batch translation support
- [ ] Implement translation history tracking
- [ ] Add rate limiting and error recovery
- [ ] Documentation and testing
- [ ] Deploy and monitor

---

## Example Usage Scenarios

### Scenario 1: Single Post Translation
```
"Translate post ID 1234 into Spanish with careful attention to ministry terminology."
```

### Scenario 2: Batch Translation
```
"Find all untranslated articles and translate them to French. Flag any that have complex theological terms for my review."
```

### Scenario 3: Quality Improvement
```
"Review the existing Spanish translation of 'Introduction to AI Ethics' and improve any awkward phrasing."
```

### Scenario 4: Terminology Consistency
```
"Check all Spanish translations for consistent use of our glossary terms. Report any inconsistencies."
```

---

## Terminology Glossary Structure

Each language should have a glossary file (`data/glossaries/{lang}.json`):

```json
{
  "language": "es",
  "language_name": "Spanish",
  "terms": {
    "Great Commission": "Gran Comisión",
    "discipleship": "discipulado",
    "kingdom of God": "reino de Dios",
    "spiritual formation": "formación espiritual",
    "mission field": "campo misionero",
    "church planting": "plantación de iglesias",
    "AI ethics": "ética de la IA",
    "machine learning": "aprendizaje automático"
  },
  "style_notes": [
    "Use formal 'usted' form for instructional content",
    "Scripture references should follow Reina-Valera 1960 naming conventions",
    "Preserve English terms for technical AI concepts when no standard translation exists"
  ]
}
```

---

## Next Steps

1. **Review this plan** - Adjust tools and workflow as needed
2. **Set up MCP server project** - Initialize TypeScript project with MCP SDK
3. **Configure WordPress authentication** - Create application password or set up JWT
4. **Build minimal viable server** - Start with `get_post_content` and `create_translation_post`
5. **Test with Claude** - Verify the workflow works interactively
6. **Iterate** - Add critique loop, glossary, and quality tools

---

## Resources

- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [Google Cloud Translation API](https://cloud.google.com/translate/docs)
- [Polylang REST API](https://polylang.pro/doc/rest-api/)

---

## Related Documents

- `multilingual-translation-implementation-plan.md` - Current PHP-based implementation
- `multilingual-translation-automation.md` - Original feature specification
