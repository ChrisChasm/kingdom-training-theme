<?php
/**
 * Content Processor
 * 
 * Handles content extraction and reconstruction for translation
 */

if (!class_exists('GAAL_Content_Processor')) {
    class GAAL_Content_Processor {
        
        /**
         * Extract translatable content from a post
         * 
         * @param int $post_id Post ID
         * @return array Array with 'title', 'content', 'excerpt'
         */
        public function extract_translatable_content($post_id) {
            $post = get_post($post_id);
            
            if (!$post) {
                return array();
            }
            
            return array(
                'title' => $post->post_title,
                'content' => $post->post_content,
                'excerpt' => $post->post_excerpt,
            );
        }
        
        /**
         * Extract text from HTML while preserving structure markers
         * 
         * @param string $html HTML content
         * @return array Array with 'text' and 'structure' for reconstruction
         */
        public function extract_text_from_html($html) {
            if (empty($html)) {
                return array('text' => '', 'structure' => array());
            }
            
            // Create a DOMDocument to parse HTML
            $dom = new DOMDocument();
            @$dom->loadHTML('<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
            
            $text_parts = array();
            $structure = array();
            
            // Extract text nodes and preserve structure
            $xpath = new DOMXPath($dom);
            $text_nodes = $xpath->query('//text()[normalize-space()]');
            
            $index = 0;
            foreach ($text_nodes as $text_node) {
                $text = trim($text_node->nodeValue);
                if (!empty($text)) {
                    $text_parts[] = $text;
                    
                    // Store structure info
                    $parent = $text_node->parentNode;
                    $structure[$index] = array(
                        'tag' => $parent->nodeName,
                        'attributes' => $this->get_node_attributes($parent),
                    );
                    
                    $index++;
                }
            }
            
            return array(
                'text' => implode("\n\n", $text_parts),
                'structure' => $structure,
            );
        }
        
        /**
         * Get node attributes as array
         * 
         * @param DOMNode $node DOM node
         * @return array Attributes
         */
        protected function get_node_attributes($node) {
            $attributes = array();
            
            if ($node->hasAttributes()) {
                foreach ($node->attributes as $attr) {
                    $attributes[$attr->nodeName] = $attr->nodeValue;
                }
            }
            
            return $attributes;
        }
        
        /**
         * Rebuild HTML from translated text
         * 
         * This is a simplified version. For complex HTML, consider using a more sophisticated approach.
         * 
         * @param string $original_html Original HTML
         * @param string $translated_text Translated text
         * @return string Rebuilt HTML
         */
        public function rebuild_html($original_html, $translated_text) {
            if (empty($original_html)) {
                return $translated_text;
            }
            
            // Simple approach: Replace text content while preserving HTML tags
            // This works for simple HTML but may need enhancement for complex structures
            
            // Split translated text into paragraphs
            $translated_paragraphs = array_filter(array_map('trim', explode("\n\n", $translated_text)));
            
            // Extract HTML structure
            $dom = new DOMDocument();
            @$dom->loadHTML('<?xml encoding="UTF-8">' . $original_html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
            
            $xpath = new DOMXPath($dom);
            $text_nodes = $xpath->query('//text()[normalize-space()]');
            
            $paragraph_index = 0;
            foreach ($text_nodes as $text_node) {
                if ($paragraph_index < count($translated_paragraphs)) {
                    $text_node->nodeValue = $translated_paragraphs[$paragraph_index];
                    $paragraph_index++;
                }
            }
            
            // Get the body content
            $body = $dom->getElementsByTagName('body')->item(0);
            if ($body) {
                $html = '';
                foreach ($body->childNodes as $node) {
                    $html .= $dom->saveHTML($node);
                }
                return $html;
            }
            
            // Fallback: return translated text wrapped in paragraphs
            $html = '';
            foreach ($translated_paragraphs as $paragraph) {
                if (!empty($paragraph)) {
                    $html .= '<p>' . esc_html($paragraph) . '</p>';
                }
            }
            
            return $html;
        }
        
        /**
         * Preserve HTML structure in translation
         * 
         * This method attempts to preserve HTML tags and structure while translating content
         * 
         * @param string $html HTML content
         * @param string $translated_html Translated HTML (may have lost structure)
         * @return string HTML with preserved structure
         */
        public function preserve_html_structure($html, $translated_html) {
            // If translated HTML already has structure, use it
            if (strip_tags($translated_html) !== $translated_html) {
                return $translated_html;
            }
            
            // Otherwise, try to rebuild structure from original
            return $this->rebuild_html($html, $translated_html);
        }
        
        /**
         * Rebuild post content from translated parts
         * 
         * @param array $translated_parts Array with 'title', 'content', 'excerpt'
         * @return array Rebuilt content array
         */
        public function rebuild_post_content($translated_parts) {
            return array(
                'post_title' => isset($translated_parts['title']) ? $translated_parts['title'] : '',
                'post_content' => isset($translated_parts['content']) ? $translated_parts['content'] : '',
                'post_excerpt' => isset($translated_parts['excerpt']) ? $translated_parts['excerpt'] : '',
            );
        }
        
        /**
         * Clean and prepare content for translation
         * 
         * @param string $content Content to clean
         * @return string Cleaned content
         */
        public function clean_content($content) {
            // Remove WordPress shortcodes (they should be preserved but not translated)
            // For now, we'll keep them and handle them separately if needed
            
            // Decode HTML entities
            $content = html_entity_decode($content, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            
            // Trim whitespace
            $content = trim($content);
            
            return $content;
        }
        
        /**
         * Split content into chunks for translation
         * 
         * Useful for very long content that might exceed API limits
         * 
         * @param string $content Content to split
         * @param int $max_length Maximum length per chunk
         * @return array Array of content chunks
         */
        public function split_content($content, $max_length = 5000) {
            if (strlen($content) <= $max_length) {
                return array($content);
            }
            
            // Split by paragraphs first
            $paragraphs = preg_split('/\n\s*\n/', $content);
            $chunks = array();
            $current_chunk = '';
            
            foreach ($paragraphs as $paragraph) {
                if (strlen($current_chunk) + strlen($paragraph) + 2 > $max_length) {
                    if (!empty($current_chunk)) {
                        $chunks[] = trim($current_chunk);
                    }
                    $current_chunk = $paragraph;
                } else {
                    $current_chunk .= ($current_chunk ? "\n\n" : '') . $paragraph;
                }
            }
            
            if (!empty($current_chunk)) {
                $chunks[] = trim($current_chunk);
            }
            
            return $chunks;
        }
        
        /**
         * Combine translated chunks back into full content
         * 
         * @param array $chunks Array of translated chunks
         * @return string Combined content
         */
        public function combine_chunks($chunks) {
            return implode("\n\n", array_filter($chunks));
        }
    }
}
