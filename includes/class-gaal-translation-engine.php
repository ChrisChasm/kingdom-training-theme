<?php
/**
 * Translation Engine
 * 
 * Core translation workflow engine that orchestrates translation operations
 */

if (!class_exists('GAAL_Translation_Engine')) {
    class GAAL_Translation_Engine {
        
        /**
         * Google Translate API instance
         * 
         * @var GAAL_Google_Translate_API
         */
        protected $google_translate;
        
        /**
         * LLM API instance
         * 
         * @var GAAL_LLM_API
         */
        protected $llm_api;
        
        /**
         * Content processor instance
         * 
         * @var GAAL_Content_Processor
         */
        protected $content_processor;
        
        /**
         * Constructor
         */
        public function __construct() {
            // Initialize Google Translate API
            $google_api_key = get_option('gaal_translation_google_api_key', '');
            $this->google_translate = new GAAL_Google_Translate_API($google_api_key);
            
            // Initialize LLM API
            $llm_endpoint = get_option('gaal_translation_llm_endpoint', '');
            $llm_api_key = get_option('gaal_translation_llm_api_key', '');
            $llm_model = get_option('gaal_translation_llm_model', 'gpt-4');
            $llm_provider = get_option('gaal_translation_llm_provider', 'custom');
            $this->llm_api = new GAAL_LLM_API($llm_endpoint, $llm_api_key, $llm_model, $llm_provider);
            
            // Initialize content processor
            $this->content_processor = new GAAL_Content_Processor();
        }
        
        /**
         * Translate a post to a specific language
         * 
         * @param int $post_id Source post ID
         * @param string $target_language Target language code
         * @param bool $use_llm_improvement Whether to use LLM for improvement
         * @return int|WP_Error Translated post ID or error
         */
        public function translate_post($post_id, $target_language, $use_llm_improvement = true) {
            GAAL_Translation_Logger::info('Starting translation', array(
                'post_id' => $post_id,
                'target_language' => $target_language,
            ));
            
            // Check if Google Translate is configured
            if (!$this->google_translate->is_configured()) {
                $error = new WP_Error('api_not_configured', __('Google Translate API is not configured', 'kingdom-training'));
                GAAL_Translation_Logger::error('Translation failed: Google Translate not configured');
                return $error;
            }
            
            // Get source post
            $source_post = get_post($post_id);
            if (!$source_post) {
                $error = new WP_Error('post_not_found', __('Source post not found', 'kingdom-training'));
                GAAL_Translation_Logger::error('Translation failed: Source post not found', array('post_id' => $post_id));
                return $error;
            }
            
            // Get source language
            $source_language = 'en'; // Default to English
            if (function_exists('pll_get_post_language')) {
                $source_language = pll_get_post_language($post_id, 'slug') ?: 'en';
            }
            
            // Check if translation already exists
            $existing_translation = null;
            if (function_exists('pll_get_post_translations')) {
                $translations = pll_get_post_translations($post_id);
                if (isset($translations[$target_language])) {
                    $existing_translation = get_post($translations[$target_language]);
                }
            }
            
            // Extract content
            $content = $this->content_processor->extract_translatable_content($post_id);
            
            // Translate title
            $translated_title = $this->google_translate->translate($content['title'], $target_language, $source_language);
            if (is_wp_error($translated_title)) {
                GAAL_Translation_Logger::error('Failed to translate title', array('error' => $translated_title->get_error_message()));
                return $translated_title;
            }
            
            // Translate content
            $translated_content = $this->google_translate->translate($content['content'], $target_language, $source_language);
            if (is_wp_error($translated_content)) {
                GAAL_Translation_Logger::error('Failed to translate content', array('error' => $translated_content->get_error_message()));
                return $translated_content;
            }
            
            // Translate excerpt if available
            $translated_excerpt = '';
            if (!empty($content['excerpt'])) {
                $translated_excerpt = $this->google_translate->translate($content['excerpt'], $target_language, $source_language);
                if (is_wp_error($translated_excerpt)) {
                    GAAL_Translation_Logger::warning('Failed to translate excerpt', array('error' => $translated_excerpt->get_error_message()));
                    $translated_excerpt = ''; // Continue without excerpt
                }
            }
            
            // Improve translation with LLM if enabled and configured
            if ($use_llm_improvement && $this->llm_api->is_configured()) {
                GAAL_Translation_Logger::info('Improving translation with LLM', array('target_language' => $target_language));
                
                $improved_content = $this->llm_api->improve_translation(
                    $content['content'],
                    $translated_content,
                    $target_language
                );
                
                if (!is_wp_error($improved_content)) {
                    $translated_content = $improved_content;
                    GAAL_Translation_Logger::info('Translation improved with LLM');
                } else {
                    GAAL_Translation_Logger::warning('LLM improvement failed, using Google Translate result', array(
                        'error' => $improved_content->get_error_message(),
                    ));
                }
            }
            
            // Prepare post data
            $default_status = get_option('gaal_translation_default_status', 'draft');
            $post_data = array(
                'post_title' => $translated_title,
                'post_content' => $translated_content,
                'post_excerpt' => $translated_excerpt,
                'post_status' => $default_status,
                'post_type' => $source_post->post_type,
                'post_author' => $source_post->post_author,
            );
            
            // Create or update translated post
            if ($existing_translation) {
                $post_data['ID'] = $existing_translation->ID;
                $translated_post_id = wp_update_post($post_data);
            } else {
                $translated_post_id = wp_insert_post($post_data);
            }
            
            if (is_wp_error($translated_post_id)) {
                GAAL_Translation_Logger::error('Failed to create/update translated post', array('error' => $translated_post_id->get_error_message()));
                return $translated_post_id;
            }
            
            // Set language in Polylang
            if (function_exists('pll_set_post_language')) {
                pll_set_post_language($translated_post_id, $target_language);
            }
            
            // Link translations in Polylang
            if (function_exists('pll_save_post_translations')) {
                $translations = array();
                if (function_exists('pll_get_post_translations')) {
                    $existing_translations = pll_get_post_translations($post_id);
                    $translations = $existing_translations ?: array();
                }
                $translations[$source_language] = $post_id;
                $translations[$target_language] = $translated_post_id;
                pll_save_post_translations($translations);
            }
            
            // Copy featured image if available
            $thumbnail_id = get_post_thumbnail_id($post_id);
            if ($thumbnail_id) {
                set_post_thumbnail($translated_post_id, $thumbnail_id);
            }
            
            GAAL_Translation_Logger::info('Translation completed', array(
                'source_post_id' => $post_id,
                'translated_post_id' => $translated_post_id,
                'target_language' => $target_language,
            ));
            
            return $translated_post_id;
        }
        
        /**
         * Translate post to all enabled languages
         * 
         * @param int $post_id Source post ID
         * @param GAAL_Translation_Job $job Optional job instance for progress tracking
         * @return array|WP_Error Array of translated post IDs or error
         */
        public function translate_all_languages($post_id, $job = null) {
            // Get enabled languages
            $enabled_languages = get_option('gaal_translation_enabled_languages', array());
            
            if (empty($enabled_languages)) {
                return new WP_Error('no_languages', __('No languages enabled for translation', 'kingdom-training'));
            }
            
            // Get source language
            $source_language = 'en';
            if (function_exists('pll_get_post_language')) {
                $source_language = pll_get_post_language($post_id, 'slug') ?: 'en';
            }
            
            // Filter out source language
            $target_languages = array_diff($enabled_languages, array($source_language));
            
            if (empty($target_languages)) {
                return new WP_Error('no_target_languages', __('No target languages to translate to', 'kingdom-training'));
            }
            
            $results = array();
            $errors = array();
            
            foreach ($target_languages as $target_language) {
                // Update job progress if provided
                if ($job) {
                    $job->update_language_progress($target_language, 'in_progress');
                }
                
                GAAL_Translation_Logger::info('Translating to language', array(
                    'post_id' => $post_id,
                    'target_language' => $target_language,
                ));
                
                $translated_post_id = $this->translate_post($post_id, $target_language);
                
                if (is_wp_error($translated_post_id)) {
                    $errors[$target_language] = $translated_post_id->get_error_message();
                    
                    if ($job) {
                        $job->update_language_progress($target_language, 'failed', $translated_post_id->get_error_message());
                    }
                    
                    GAAL_Translation_Logger::error('Translation failed for language', array(
                        'target_language' => $target_language,
                        'error' => $translated_post_id->get_error_message(),
                    ));
                } else {
                    $results[$target_language] = $translated_post_id;
                    
                    if ($job) {
                        $job->update_language_progress($target_language, 'completed');
                    }
                    
                    GAAL_Translation_Logger::info('Translation successful for language', array(
                        'target_language' => $target_language,
                        'translated_post_id' => $translated_post_id,
                    ));
                }
            }
            
            // Mark job as completed if all languages are done
            if ($job) {
                $remaining = $job->get_remaining_languages();
                if (empty($remaining)) {
                    $job->complete();
                } elseif (!empty($errors)) {
                    // Some translations failed, but job can be resumed
                    $job->set_status(GAAL_Translation_Job::STATUS_IN_PROGRESS);
                }
            }
            
            if (!empty($errors) && empty($results)) {
                return new WP_Error('translation_failed', __('All translations failed', 'kingdom-training'), array('errors' => $errors));
            }
            
            return array(
                'success' => true,
                'translations' => $results,
                'errors' => $errors,
            );
        }
        
        /**
         * Re-translate an existing post
         * 
         * @param int $post_id Post ID to re-translate
         * @param string $target_language Target language (optional, uses post's language if not provided)
         * @return int|WP_Error Translated post ID or error
         */
        public function retranslate_post($post_id, $target_language = '') {
            // Get source post
            $post = get_post($post_id);
            if (!$post) {
                return new WP_Error('post_not_found', __('Post not found', 'kingdom-training'));
            }
            
            // Get source language
            $source_language = 'en';
            if (function_exists('pll_get_post_language')) {
                $source_language = pll_get_post_language($post_id, 'slug') ?: 'en';
            }
            
            // If target language not provided, find the original source
            if (empty($target_language)) {
                if (function_exists('pll_get_post_translations')) {
                    $translations = pll_get_post_translations($post_id);
                    // Find the default language (usually English)
                    $default_language = function_exists('pll_default_language') ? pll_default_language('slug') : 'en';
                    if (isset($translations[$default_language])) {
                        $source_post_id = $translations[$default_language];
                        $target_language = $source_language;
                        $post_id = $source_post_id;
                    }
                }
            }
            
            if (empty($target_language)) {
                return new WP_Error('no_target_language', __('Target language not specified', 'kingdom-training'));
            }
            
            // Perform translation
            return $this->translate_post($post_id, $target_language);
        }
    }
}
