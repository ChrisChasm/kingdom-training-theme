<?php
/**
 * Batch Translator
 * 
 * Handles batch operations for translation: creating drafts, copying metadata, etc.
 */

if (!class_exists('GAAL_Batch_Translator')) {
    class GAAL_Batch_Translator {
        
        /**
         * Create draft translations for multiple posts
         * 
         * @param array $items Array of ['post_id' => X, 'languages' => ['ar', 'es']]
         * @return array Results
         */
        public function create_drafts($items) {
            $results = array();
            
            foreach ($items as $item) {
                $post_id = $item['post_id'];
                $languages = $item['languages'];
                $source_post = get_post($post_id);
                
                if (!$source_post) {
                    $results[$post_id] = array('error' => __('Post not found', 'kingdom-training'));
                    continue;
                }
                
                $results[$post_id] = array();
                
                foreach ($languages as $lang) {
                    // Check if translation already exists
                    $translations = array();
                    if (function_exists('pll_get_post_translations')) {
                        $translations = pll_get_post_translations($post_id);
                    }
                    
                    if (isset($translations[$lang])) {
                        $results[$post_id][$lang] = array(
                            'status' => 'exists',
                            'draft_id' => $translations[$lang],
                        );
                        continue;
                    }
                    
                    // Create draft with English content (not yet translated)
                    $draft_data = array(
                        'post_title'   => $source_post->post_title,
                        'post_content' => $source_post->post_content,
                        'post_excerpt' => $source_post->post_excerpt,
                        'post_status'  => 'draft',
                        'post_type'    => $source_post->post_type,
                        'post_author'  => $source_post->post_author,
                    );
                    
                    $draft_id = wp_insert_post($draft_data);
                    
                    if (is_wp_error($draft_id)) {
                        $results[$post_id][$lang] = array(
                            'status' => 'error',
                            'error' => $draft_id->get_error_message(),
                        );
                        continue;
                    }
                    
                    // Set language
                    if (function_exists('pll_set_post_language')) {
                        pll_set_post_language($draft_id, $lang);
                    }
                    
                    // Link translations
                    if (function_exists('pll_save_post_translations')) {
                        $translations[$lang] = $draft_id;
                        $translations['en'] = $post_id;
                        pll_save_post_translations($translations);
                    }
                    
                    // Copy featured image
                    $thumbnail_id = get_post_thumbnail_id($post_id);
                    if ($thumbnail_id) {
                        set_post_thumbnail($draft_id, $thumbnail_id);
                    }
                    
                    // Copy relevant meta
                    $this->copy_post_meta($post_id, $draft_id);
                    
                    // Mark for translation tracking
                    update_post_meta($draft_id, '_gaal_needs_translation', true);
                    update_post_meta($draft_id, '_gaal_source_post_id', $post_id);
                    update_post_meta($draft_id, '_gaal_created_at', current_time('mysql'));
                    
                    $results[$post_id][$lang] = array(
                        'status' => 'created',
                        'draft_id' => $draft_id,
                    );
                    
                    GAAL_Translation_Logger::info('Draft translation created', array(
                        'source_post_id' => $post_id,
                        'draft_id' => $draft_id,
                        'language' => $lang,
                    ));
                }
            }
            
            return $results;
        }
        
        /**
         * Copy relevant post meta from source to target
         * 
         * @param int $source_id Source post ID
         * @param int $target_id Target post ID
         */
        public function copy_post_meta($source_id, $target_id) {
            // Copy taxonomy terms (Polylang handles term translations)
            $taxonomies = get_object_taxonomies(get_post_type($source_id));
            
            foreach ($taxonomies as $taxonomy) {
                // Skip language taxonomy
                if ($taxonomy === 'language' || $taxonomy === 'post_translations') {
                    continue;
                }
                
                $terms = wp_get_object_terms($source_id, $taxonomy, array('fields' => 'ids'));
                if (!is_wp_error($terms) && !empty($terms)) {
                    wp_set_object_terms($target_id, $terms, $taxonomy);
                }
            }
            
            // Copy specific meta fields (customize as needed)
            $meta_keys_to_copy = array(
                '_yoast_wpseo_metadesc',
                '_yoast_wpseo_title',
                '_yoast_wpseo_focuskw',
                // Add other meta keys as needed
            );
            
            foreach ($meta_keys_to_copy as $key) {
                $value = get_post_meta($source_id, $key, true);
                if ($value) {
                    update_post_meta($target_id, $key, $value);
                }
            }
        }
        
        /**
         * Get posts that need translation (have drafts waiting)
         * 
         * @return array Posts needing translation
         */
        public function get_pending_translations() {
            $args = array(
                'post_type' => array('post', 'page', 'article', 'strategy_course', 'tool'),
                'post_status' => 'draft',
                'posts_per_page' => -1,
                'meta_query' => array(
                    array(
                        'key' => '_gaal_needs_translation',
                        'value' => '1',
                        'compare' => '=',
                    ),
                ),
            );
            
            $posts = get_posts($args);
            $pending = array();
            
            foreach ($posts as $post) {
                $source_id = get_post_meta($post->ID, '_gaal_source_post_id', true);
                $language = '';
                if (function_exists('pll_get_post_language')) {
                    $language = pll_get_post_language($post->ID, 'slug');
                }
                
                $pending[] = array(
                    'draft_id' => $post->ID,
                    'source_post_id' => $source_id,
                    'language' => $language,
                    'title' => $post->post_title,
                    'created_at' => get_post_meta($post->ID, '_gaal_created_at', true),
                );
            }
            
            return $pending;
        }
    }
}
