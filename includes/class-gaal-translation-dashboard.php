<?php
/**
 * Auto Translate Dashboard
 * 
 * Main dashboard class for managing multilingual translations across all content types.
 * Provides a centralized interface for gap detection, batch operations, and progress tracking.
 */

if (!class_exists('GAAL_Translation_Dashboard')) {
    class GAAL_Translation_Dashboard {
        
        /**
         * Singleton instance
         * 
         * @var GAAL_Translation_Dashboard
         */
        private static $instance = null;
        
        /**
         * Get singleton instance
         * 
         * @return GAAL_Translation_Dashboard
         */
        public static function get_instance() {
            if (null === self::$instance) {
                self::$instance = new self();
            }
            return self::$instance;
        }
        
        /**
         * Constructor
         */
        private function __construct() {
            add_action('admin_menu', array($this, 'register_menu'));
            add_action('admin_enqueue_scripts', array($this, 'enqueue_assets'));
        }
        
        /**
         * Register admin menu page
         */
        public function register_menu() {
            add_menu_page(
                __('Auto Translate', 'kingdom-training'),           // Page title
                __('Auto Translate', 'kingdom-training'),           // Menu title
                'manage_options',                                    // Capability
                'gaal-auto-translate',                              // Menu slug
                array($this, 'render_dashboard'),                   // Callback
                'dashicons-translation',                            // Icon
                30                                                   // Position (after Comments)
            );
            
            // Submenu pages
            add_submenu_page(
                'gaal-auto-translate',
                __('Dashboard', 'kingdom-training'),
                __('Dashboard', 'kingdom-training'),
                'manage_options',
                'gaal-auto-translate',
                array($this, 'render_dashboard')
            );
            
            add_submenu_page(
                'gaal-auto-translate',
                __('Settings', 'kingdom-training'),
                __('Settings', 'kingdom-training'),
                'manage_options',
                'gaal-translation-settings',
                'gaal_translation_settings_page'  // Existing settings page
            );
        }
        
        /**
         * Enqueue dashboard assets
         * 
         * @param string $hook Current admin page hook
         */
        public function enqueue_assets($hook) {
            if ($hook !== 'toplevel_page_gaal-auto-translate') {
                return;
            }
            
            $css_path = get_template_directory() . '/admin/css/auto-translate-dashboard.css';
            $js_path = get_template_directory() . '/admin/js/auto-translate-dashboard.js';
            
            wp_enqueue_style(
                'gaal-auto-translate-dashboard',
                get_template_directory_uri() . '/admin/css/auto-translate-dashboard.css',
                array(),
                file_exists($css_path) ? filemtime($css_path) : '1.0.0'
            );
            
            wp_enqueue_script(
                'gaal-auto-translate-dashboard',
                get_template_directory_uri() . '/admin/js/auto-translate-dashboard.js',
                array('jquery'),
                file_exists($js_path) ? filemtime($js_path) : '1.0.0',
                true
            );
            
            wp_localize_script('gaal-auto-translate-dashboard', 'gaalAutoTranslate', array(
                'apiUrl' => rest_url('gaal/v1/'),
                'nonce' => wp_create_nonce('wp_rest'),
                'strings' => array(
                    'scanning' => __('Scanning for gaps...', 'kingdom-training'),
                    'creating_drafts' => __('Creating drafts...', 'kingdom-training'),
                    'translating' => __('Translating...', 'kingdom-training'),
                    'complete' => __('Complete', 'kingdom-training'),
                    'failed' => __('Failed', 'kingdom-training'),
                    'confirm_translate_all' => __('This will translate all selected posts. Continue?', 'kingdom-training'),
                    'confirm_create_drafts' => __('This will create draft translations for all selected posts. Continue?', 'kingdom-training'),
                    'no_gaps_found' => __('No translation gaps found! All content is translated.', 'kingdom-training'),
                    'error_occurred' => __('An error occurred. Please try again.', 'kingdom-training'),
                ),
                'languages' => $this->get_enabled_languages_data(),
                'postTypes' => array('post', 'page', 'article', 'strategy_course', 'tool'),
            ));
        }
        
        /**
         * Get enabled languages with their display data
         * 
         * @return array
         */
        public function get_enabled_languages_data() {
            $enabled_languages = get_option('gaal_translation_enabled_languages', array());
            $languages_data = array();
            
            // Get language names from Polylang if available
            if (function_exists('PLL') && isset(PLL()->model)) {
                $all_languages = PLL()->model->get_languages_list();
                foreach ($all_languages as $lang) {
                    if (in_array($lang->slug, $enabled_languages)) {
                        $languages_data[$lang->slug] = array(
                            'code' => $lang->slug,
                            'name' => $lang->name,
                            'locale' => $lang->locale,
                            'flag' => $lang->flag_url,
                        );
                    }
                }
            } else {
                // Fallback: use language codes
                foreach ($enabled_languages as $code) {
                    $languages_data[$code] = array(
                        'code' => $code,
                        'name' => strtoupper($code),
                        'locale' => $code,
                        'flag' => '',
                    );
                }
            }
            
            return $languages_data;
        }
        
        /**
         * Render the dashboard page
         */
        public function render_dashboard() {
            // Include the template
            $template_path = get_template_directory() . '/admin/views/auto-translate-dashboard.php';
            if (file_exists($template_path)) {
                include $template_path;
            } else {
                echo '<div class="wrap"><h1>' . esc_html__('Auto Translate Dashboard', 'kingdom-training') . '</h1>';
                echo '<p>' . esc_html__('Dashboard template not found.', 'kingdom-training') . '</p></div>';
            }
        }
    }
}

// Initialize the dashboard
function gaal_init_translation_dashboard() {
    GAAL_Translation_Dashboard::get_instance();
}
add_action('plugins_loaded', 'gaal_init_translation_dashboard');
