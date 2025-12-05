<?php
/**
 * Translation Scanner
 * 
 * Scans all content and identifies missing translations for enabled languages.
 */

if (!class_exists('GAAL_Translation_Scanner')) {
    class GAAL_Translation_Scanner {
        
        /**
         * Supported post types for translation
         * 
         * @var array
         */
        protected $post_types = array('post', 'page', 'article', 'strategy_course', 'tool');
        
        /**
         * Find all English posts missing translations
         * 
         * @param array $filters Optional filters (post_type, language, etc.)
         * @return array Translation gaps
         */
        public function find_gaps($filters = array()) {
            $enabled_languages = get_option('gaal_translation_enabled_languages', array());
            $target_languages = array_diff($enabled_languages, array('en'));
            
            if (empty($target_languages)) {
                return array();
            }
            
            // Build query args
            $args = array(
                'post_type' => isset($filters['post_type']) && !empty($filters['post_type']) ? $filters['post_type'] : $this->post_types,
                'post_status' => 'publish',
                'posts_per_page' => -1,
                'fields' => 'ids',
            );
            
            // Add language filter for Polylang
            if (function_exists('pll_default_language')) {
                $args['lang'] = pll_default_language('slug') ?: 'en';
            }
            
            $english_post_ids = get_posts($args);
            $gaps = array();
            
            foreach ($english_post_ids as $post_id) {
                $translations = function_exists('pll_get_post_translations') 
                    ? pll_get_post_translations($post_id) 
                    : array();
                
                $existing_langs = array_keys($translations);
                $missing_langs = array_diff($target_languages, $existing_langs);
                
                // Apply language filter if specified
                if (!empty($filters['language'])) {
                    $missing_langs = array_intersect($missing_langs, (array) $filters['language']);
                }
                
                if (!empty($missing_langs)) {
                    $post = get_post($post_id);
                    $post_type_obj = get_post_type_object($post->post_type);
                    
                    $gaps[$post_id] = array(
                        'id' => $post_id,
                        'title' => $post->post_title,
                        'post_type' => $post->post_type,
                        'post_type_label' => $post_type_obj ? $post_type_obj->labels->singular_name : $post->post_type,
                        'status' => $post->post_status,
                        'edit_link' => get_edit_post_link($post_id, 'raw'),
                        'missing_languages' => array_values($missing_langs),
                        'existing_translations' => $this->get_translation_status($translations),
                        'content_length' => strlen($post->post_content),
                        'estimated_chunks' => max(1, ceil(strlen($post->post_content) / 3000)),
                    );
                }
            }
            
            return $gaps;
        }
        
        /**
         * Get summary statistics
         * 
         * @return array Summary data
         */
        public function get_summary() {
            $gaps = $this->find_gaps();
            $enabled_languages = get_option('gaal_translation_enabled_languages', array());
            $target_languages = array_diff($enabled_languages, array('en'));
            
            $total_posts = count($gaps);
            $total_translations_needed = 0;
            $by_language = array();
            $by_post_type = array();
            
            foreach ($target_languages as $lang) {
                $by_language[$lang] = 0;
            }
            
            foreach ($gaps as $gap) {
                $total_translations_needed += count($gap['missing_languages']);
                
                foreach ($gap['missing_languages'] as $lang) {
                    if (isset($by_language[$lang])) {
                        $by_language[$lang]++;
                    }
                }
                
                $pt = $gap['post_type'];
                $by_post_type[$pt] = isset($by_post_type[$pt]) ? $by_post_type[$pt] + 1 : 1;
            }
            
            return array(
                'posts_needing_translation' => $total_posts,
                'total_translations_needed' => $total_translations_needed,
                'languages_enabled' => count($target_languages),
                'by_language' => $by_language,
                'by_post_type' => $by_post_type,
            );
        }
        
        /**
         * Format translation status for display
         * 
         * @param array $translations Polylang translations array
         * @return array Formatted translation status
         */
        protected function get_translation_status($translations) {
            $status = array();
            foreach ($translations as $lang => $post_id) {
                if ($lang === 'en') continue;
                $post = get_post($post_id);
                if ($post) {
                    $status[$lang] = array(
                        'id' => $post_id,
                        'status' => $post->post_status,
                        'edit_link' => get_edit_post_link($post_id, 'raw'),
                    );
                }
            }
            return $status;
        }
        
        /**
         * Get supported post types
         * 
         * @return array
         */
        public function get_post_types() {
            return $this->post_types;
        }
        
        /**
         * Get post types with labels for display
         * 
         * @return array
         */
        public function get_post_types_with_labels() {
            $result = array();
            foreach ($this->post_types as $post_type) {
                $obj = get_post_type_object($post_type);
                $result[$post_type] = $obj ? $obj->labels->singular_name : $post_type;
            }
            return $result;
        }
        
        /**
         * Find all existing translations (non-English posts that are translations)
         * 
         * @param array $filters Optional filters (post_type, language, status)
         * @return array Existing translations
         */
        public function find_existing_translations($filters = array()) {
            $enabled_languages = get_option('gaal_translation_enabled_languages', array());
            $target_languages = array_diff($enabled_languages, array('en'));
            
            if (empty($target_languages)) {
                return array();
            }
            
            // Apply language filter if specified
            if (!empty($filters['language'])) {
                $target_languages = array_intersect($target_languages, (array) $filters['language']);
            }
            
            $translations = array();
            
            foreach ($target_languages as $lang) {
                // Build query args for this language
                $args = array(
                    'post_type' => isset($filters['post_type']) && !empty($filters['post_type']) ? $filters['post_type'] : $this->post_types,
                    'post_status' => isset($filters['status']) && !empty($filters['status']) ? $filters['status'] : array('publish', 'draft', 'pending'),
                    'posts_per_page' => -1,
                    'lang' => $lang,
                );
                
                $posts = get_posts($args);
                
                foreach ($posts as $post) {
                    // Get the source (English) post
                    $source_post_id = null;
                    $source_post = null;
                    
                    if (function_exists('pll_get_post_translations')) {
                        $post_translations = pll_get_post_translations($post->ID);
                        if (isset($post_translations['en'])) {
                            $source_post_id = $post_translations['en'];
                            $source_post = get_post($source_post_id);
                        }
                    }
                    
                    $post_type_obj = get_post_type_object($post->post_type);
                    
                    // Get translation metadata
                    $translated_at = get_post_meta($post->ID, '_gaal_translated_at', true);
                    $evaluation = get_post_meta($post->ID, '_gaal_evaluation', true);
                    
                    $translations[] = array(
                        'id' => $post->ID,
                        'title' => $post->post_title,
                        'post_type' => $post->post_type,
                        'post_type_label' => $post_type_obj ? $post_type_obj->labels->singular_name : $post->post_type,
                        'status' => $post->post_status,
                        'language' => $lang,
                        'edit_link' => get_edit_post_link($post->ID, 'raw'),
                        'view_link' => get_permalink($post->ID),
                        'source_post_id' => $source_post_id,
                        'source_title' => $source_post ? $source_post->post_title : null,
                        'source_edit_link' => $source_post_id ? get_edit_post_link($source_post_id, 'raw') : null,
                        'translated_at' => $translated_at,
                        'modified_date' => $post->post_modified,
                        'content_length' => strlen($post->post_content),
                        'evaluation' => $evaluation ? $evaluation : null,
                    );
                }
            }
            
            // Sort by modified date descending
            usort($translations, function($a, $b) {
                return strtotime($b['modified_date']) - strtotime($a['modified_date']);
            });
            
            return $translations;
        }
        
        /**
         * Get summary of existing translations
         * 
         * @return array Summary data
         */
        public function get_translations_summary() {
            $translations = $this->find_existing_translations();
            
            $by_language = array();
            $by_status = array();
            $by_post_type = array();
            
            foreach ($translations as $t) {
                // By language
                $lang = $t['language'];
                $by_language[$lang] = isset($by_language[$lang]) ? $by_language[$lang] + 1 : 1;
                
                // By status
                $status = $t['status'];
                $by_status[$status] = isset($by_status[$status]) ? $by_status[$status] + 1 : 1;
                
                // By post type
                $pt = $t['post_type'];
                $by_post_type[$pt] = isset($by_post_type[$pt]) ? $by_post_type[$pt] + 1 : 1;
            }
            
            return array(
                'total' => count($translations),
                'by_language' => $by_language,
                'by_status' => $by_status,
                'by_post_type' => $by_post_type,
            );
        }
    }
}
