<?php
/**
 * Translation Automation Settings Page
 * 
 * Admin settings page for configuring translation automation features
 */

/**
 * Add translation settings page to WordPress admin
 */
function gaal_add_translation_settings_page() {
    add_options_page(
        __('Translation Automation', 'kingdom-training'),
        __('Translation Automation', 'kingdom-training'),
        'manage_options',
        'gaal-translation-settings',
        'gaal_translation_settings_page'
    );
}
add_action('admin_menu', 'gaal_add_translation_settings_page');

/**
 * Register and save translation settings
 */
function gaal_save_translation_settings() {
    register_setting('gaal_translation_settings', 'gaal_translation_google_api_key');
    register_setting('gaal_translation_settings', 'gaal_translation_llm_endpoint');
    register_setting('gaal_translation_settings', 'gaal_translation_llm_api_key');
    register_setting('gaal_translation_settings', 'gaal_translation_llm_model');
    register_setting('gaal_translation_settings', 'gaal_translation_enabled_languages');
    register_setting('gaal_translation_settings', 'gaal_translation_default_status');
    register_setting('gaal_translation_settings', 'gaal_translation_llm_provider');
    
    // Save settings if form was submitted
    if (isset($_POST['gaal_translation_settings_submit']) && check_admin_referer('gaal_translation_settings')) {
        // Validate and save Google Translate API key
        if (isset($_POST['gaal_translation_google_api_key'])) {
            $api_key = sanitize_text_field($_POST['gaal_translation_google_api_key']);
            update_option('gaal_translation_google_api_key', $api_key);
        }
        
        // Validate and save LLM endpoint
        if (isset($_POST['gaal_translation_llm_endpoint'])) {
            $endpoint = esc_url_raw($_POST['gaal_translation_llm_endpoint']);
            update_option('gaal_translation_llm_endpoint', $endpoint);
        }
        
        // Validate and save LLM API key
        if (isset($_POST['gaal_translation_llm_api_key'])) {
            $api_key = sanitize_text_field($_POST['gaal_translation_llm_api_key']);
            update_option('gaal_translation_llm_api_key', $api_key);
        }
        
        // Validate and save LLM model name
        if (isset($_POST['gaal_translation_llm_model'])) {
            $model = sanitize_text_field($_POST['gaal_translation_llm_model']);
            update_option('gaal_translation_llm_model', $model);
        }
        
        // Save enabled languages
        if (isset($_POST['gaal_translation_enabled_languages']) && is_array($_POST['gaal_translation_enabled_languages'])) {
            $enabled_languages = array_map('sanitize_text_field', $_POST['gaal_translation_enabled_languages']);
            update_option('gaal_translation_enabled_languages', $enabled_languages);
        } else {
            update_option('gaal_translation_enabled_languages', array());
        }
        
        // Save default post status
        if (isset($_POST['gaal_translation_default_status'])) {
            $status = sanitize_text_field($_POST['gaal_translation_default_status']);
            $allowed_statuses = array('draft', 'publish', 'pending');
            if (in_array($status, $allowed_statuses)) {
                update_option('gaal_translation_default_status', $status);
            }
        }
        
        // Save provider preset
        if (isset($_POST['gaal_translation_llm_provider'])) {
            $provider = sanitize_text_field($_POST['gaal_translation_llm_provider']);
            update_option('gaal_translation_llm_provider', $provider);
            
            // Auto-fill endpoint based on provider preset
            if ($provider !== 'custom') {
                $provider_endpoints = array(
                    'openai' => 'https://api.openai.com/v1',
                    'anthropic' => 'https://api.anthropic.com/v1',
                    'gemini' => 'https://generativelanguage.googleapis.com/v1',
                    'openrouter' => 'https://openrouter.ai/api/v1',
                );
                if (isset($provider_endpoints[$provider])) {
                    update_option('gaal_translation_llm_endpoint', $provider_endpoints[$provider]);
                }
            }
        }
        
        echo '<div class="notice notice-success"><p>' . __('Settings saved successfully!', 'kingdom-training') . '</p></div>';
    }
}
add_action('admin_init', 'gaal_save_translation_settings');

/**
 * Render translation settings page
 */
function gaal_translation_settings_page() {
    // Get current settings
    $google_api_key = get_option('gaal_translation_google_api_key', '');
    $llm_endpoint = get_option('gaal_translation_llm_endpoint', '');
    $llm_api_key = get_option('gaal_translation_llm_api_key', '');
    $llm_model = get_option('gaal_translation_llm_model', 'gpt-4');
    $enabled_languages = get_option('gaal_translation_enabled_languages', array());
    $default_status = get_option('gaal_translation_default_status', 'draft');
    $llm_provider = get_option('gaal_translation_llm_provider', 'custom');
    
    // Get available languages from Polylang
    $available_languages = array();
    if (function_exists('PLL') && isset(PLL()->model)) {
        // Get full language objects from Polylang
        $languages = PLL()->model->get_languages_list();
        foreach ($languages as $lang) {
            $available_languages[] = array(
                'slug' => $lang->slug,
                'name' => $lang->name,
                'locale' => $lang->locale,
            );
        }
    } elseif (function_exists('pll_languages_list')) {
        // Fallback: get language slugs and retrieve language data
        $language_slugs = pll_languages_list();
        foreach ($language_slugs as $slug) {
            if (function_exists('PLL') && isset(PLL()->model)) {
                $lang = PLL()->model->get_language($slug);
                if ($lang) {
                    $available_languages[] = array(
                        'slug' => $lang->slug,
                        'name' => $lang->name,
                        'locale' => $lang->locale,
                    );
                }
            } else {
                // Last resort: use slug as name
                $available_languages[] = array(
                    'slug' => $slug,
                    'name' => strtoupper($slug),
                    'locale' => $slug,
                );
            }
        }
    }
    
    ?>
    <div class="wrap">
        <h1><?php echo esc_html__('Translation Automation Settings', 'kingdom-training'); ?></h1>
        
        <form method="post" action="">
            <?php wp_nonce_field('gaal_translation_settings'); ?>
            
            <h2><?php echo esc_html__('Google Translate API', 'kingdom-training'); ?></h2>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="gaal_translation_google_api_key"><?php echo esc_html__('API Key', 'kingdom-training'); ?></label>
                    </th>
                    <td>
                        <input type="text" 
                               id="gaal_translation_google_api_key" 
                               name="gaal_translation_google_api_key" 
                               value="<?php echo esc_attr($google_api_key); ?>" 
                               class="regular-text"
                               placeholder="AIza...">
                        <button type="button" class="button gaal-test-connection" data-api="google_translate" style="margin-left: 5px;">
                            <?php echo esc_html__('Test Connection', 'kingdom-training'); ?>
                        </button>
                        <span class="gaal-test-result" data-api="google_translate" style="margin-left: 10px;"></span>
                        <p class="description">
                            <?php echo esc_html__('Enter your Google Cloud Translation API key. You can obtain this from the Google Cloud Console.', 'kingdom-training'); ?>
                            <a href="https://console.cloud.google.com/apis/credentials" target="_blank"><?php echo esc_html__('Get API Key', 'kingdom-training'); ?></a>
                        </p>
                    </td>
                </tr>
            </table>
            
            <h2><?php echo esc_html__('LLM API Configuration', 'kingdom-training'); ?></h2>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="gaal_translation_llm_provider"><?php echo esc_html__('Provider', 'kingdom-training'); ?></label>
                    </th>
                    <td>
                        <select name="gaal_translation_llm_provider" id="gaal_translation_llm_provider">
                            <option value="custom" <?php selected($llm_provider, 'custom'); ?>><?php echo esc_html__('Custom', 'kingdom-training'); ?></option>
                            <option value="openai" <?php selected($llm_provider, 'openai'); ?>><?php echo esc_html__('OpenAI', 'kingdom-training'); ?></option>
                            <option value="anthropic" <?php selected($llm_provider, 'anthropic'); ?>><?php echo esc_html__('Anthropic Claude', 'kingdom-training'); ?></option>
                            <option value="gemini" <?php selected($llm_provider, 'gemini'); ?>><?php echo esc_html__('Google Gemini', 'kingdom-training'); ?></option>
                            <option value="openrouter" <?php selected($llm_provider, 'openrouter'); ?>><?php echo esc_html__('OpenRouter.ai', 'kingdom-training'); ?></option>
                        </select>
                        <p class="description">
                            <?php echo esc_html__('Select a provider preset to auto-fill the endpoint URL, or choose Custom to enter your own.', 'kingdom-training'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="gaal_translation_llm_endpoint"><?php echo esc_html__('Endpoint URL', 'kingdom-training'); ?></label>
                    </th>
                    <td>
                        <input type="url" 
                               id="gaal_translation_llm_endpoint" 
                               name="gaal_translation_llm_endpoint" 
                               value="<?php echo esc_attr($llm_endpoint); ?>" 
                               class="regular-text"
                               placeholder="https://api.openai.com/v1">
                        <p class="description">
                            <?php echo esc_html__('Enter the OpenAI-compatible API endpoint URL. Must support /chat/completions endpoint.', 'kingdom-training'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="gaal_translation_llm_api_key"><?php echo esc_html__('API Key', 'kingdom-training'); ?></label>
                    </th>
                    <td>
                        <input type="text" 
                               id="gaal_translation_llm_api_key" 
                               name="gaal_translation_llm_api_key" 
                               value="<?php echo esc_attr($llm_api_key); ?>" 
                               class="regular-text"
                               placeholder="sk-...">
                        <button type="button" class="button gaal-test-connection" data-api="llm" style="margin-left: 5px;">
                            <?php echo esc_html__('Test Connection', 'kingdom-training'); ?>
                        </button>
                        <span class="gaal-test-result" data-api="llm" style="margin-left: 10px;"></span>
                        <p class="description">
                            <?php echo esc_html__('Enter your LLM API key (Bearer token).', 'kingdom-training'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="gaal_translation_llm_model"><?php echo esc_html__('Model Name', 'kingdom-training'); ?></label>
                    </th>
                    <td>
                        <input type="text" 
                               id="gaal_translation_llm_model" 
                               name="gaal_translation_llm_model" 
                               value="<?php echo esc_attr($llm_model); ?>" 
                               class="regular-text"
                               placeholder="gpt-4">
                        <p class="description">
                            <?php echo esc_html__('Enter the model name (e.g., gpt-4, claude-3-opus-20240229, gemini-pro, anthropic/claude-3-opus for OpenRouter.ai).', 'kingdom-training'); ?>
                        </p>
                    </td>
                </tr>
            </table>
            
            <h2><?php echo esc_html__('Translation Settings', 'kingdom-training'); ?></h2>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label><?php echo esc_html__('Enabled Languages', 'kingdom-training'); ?></label>
                    </th>
                    <td>
                        <?php if (!empty($available_languages)): ?>
                            <?php foreach ($available_languages as $lang): ?>
                                <label style="display: block; margin-bottom: 5px;">
                                    <input type="checkbox" 
                                           name="gaal_translation_enabled_languages[]" 
                                           value="<?php echo esc_attr($lang['slug']); ?>"
                                           <?php checked(in_array($lang['slug'], $enabled_languages)); ?>>
                                    <?php echo esc_html($lang['name'] . ' (' . $lang['slug'] . ')'); ?>
                                </label>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <p class="description">
                                <?php echo esc_html__('No languages found. Please configure Polylang first.', 'kingdom-training'); ?>
                            </p>
                        <?php endif; ?>
                        <p class="description">
                            <?php echo esc_html__('Select which languages should be automatically translated.', 'kingdom-training'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="gaal_translation_default_status"><?php echo esc_html__('Default Post Status', 'kingdom-training'); ?></label>
                    </th>
                    <td>
                        <select name="gaal_translation_default_status" id="gaal_translation_default_status">
                            <option value="draft" <?php selected($default_status, 'draft'); ?>><?php echo esc_html__('Draft', 'kingdom-training'); ?></option>
                            <option value="pending" <?php selected($default_status, 'pending'); ?>><?php echo esc_html__('Pending Review', 'kingdom-training'); ?></option>
                            <option value="publish" <?php selected($default_status, 'publish'); ?>><?php echo esc_html__('Published', 'kingdom-training'); ?></option>
                        </select>
                        <p class="description">
                            <?php echo esc_html__('Default status for newly created translated posts.', 'kingdom-training'); ?>
                        </p>
                    </td>
                </tr>
            </table>
            
            <?php submit_button(__('Save Settings', 'kingdom-training'), 'primary', 'gaal_translation_settings_submit'); ?>
        </form>
        
        <div class="card" style="max-width: 800px; margin-top: 20px;">
            <h2><?php echo esc_html__('How to Configure', 'kingdom-training'); ?></h2>
            <h3><?php echo esc_html__('Google Translate API', 'kingdom-training'); ?></h3>
            <ol>
                <li><?php echo esc_html__('Go to Google Cloud Console', 'kingdom-training'); ?>: <a href="https://console.cloud.google.com" target="_blank">console.cloud.google.com</a></li>
                <li><?php echo esc_html__('Enable the Cloud Translation API', 'kingdom-training'); ?></li>
                <li><?php echo esc_html__('Create an API key in APIs & Services > Credentials', 'kingdom-training'); ?></li>
                <li><?php echo esc_html__('Copy the API key and paste it above', 'kingdom-training'); ?></li>
            </ol>
            
            <h3><?php echo esc_html__('LLM API', 'kingdom-training'); ?></h3>
            <p><?php echo esc_html__('The LLM API is used to improve translation quality. You can use any OpenAI-compatible API endpoint.', 'kingdom-training'); ?></p>
            <ul>
                <li><strong>OpenAI:</strong> <?php echo esc_html__('Get API key from', 'kingdom-training'); ?> <a href="https://platform.openai.com" target="_blank">platform.openai.com</a></li>
                <li><strong>Anthropic:</strong> <?php echo esc_html__('Get API key from', 'kingdom-training'); ?> <a href="https://console.anthropic.com" target="_blank">console.anthropic.com</a></li>
                <li><strong>Google Gemini:</strong> <?php echo esc_html__('Get API key from', 'kingdom-training'); ?> <a href="https://aistudio.google.com" target="_blank">aistudio.google.com</a></li>
                <li><strong>OpenRouter.ai:</strong> <?php echo esc_html__('Get API key from', 'kingdom-training'); ?> <a href="https://openrouter.ai" target="_blank">openrouter.ai</a> - <?php echo esc_html__('Access to multiple LLM models through a unified API', 'kingdom-training'); ?></li>
            </ul>
        </div>
    </div>
    
    <style>
    .gaal-test-connection {
        vertical-align: middle;
    }
    .gaal-test-result {
        display: inline-block;
        vertical-align: middle;
        font-size: 13px;
    }
    .gaal-test-result span {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 3px;
    }
    </style>
    
    <script>
    jQuery(document).ready(function($) {
        // Auto-fill endpoint when provider changes
        $('#gaal_translation_llm_provider').on('change', function() {
            var provider = $(this).val();
            var endpointField = $('#gaal_translation_llm_endpoint');
            var endpoints = {
                'openai': 'https://api.openai.com/v1',
                'anthropic': 'https://api.anthropic.com/v1',
                'gemini': 'https://generativelanguage.googleapis.com/v1',
                'openrouter': 'https://openrouter.ai/api/v1',
            };
            if (endpoints[provider]) {
                endpointField.val(endpoints[provider]);
            }
        });
        
        // Test connection buttons
        $('.gaal-test-connection').on('click', function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var apiType = $button.data('api');
            var $result = $('.gaal-test-result[data-api="' + apiType + '"]');
            
            // Disable button and show loading
            $button.prop('disabled', true).text('<?php echo esc_js(__('Testing...', 'kingdom-training')); ?>');
            $result.html('<span style="color: #666;"><?php echo esc_js(__('Testing...', 'kingdom-training')); ?></span>');
            
            // Prepare data based on API type
            var data = {
                action: 'gaal_test_api_connection',
                api_type: apiType,
                nonce: '<?php echo wp_create_nonce('gaal_test_api_connection'); ?>'
            };
            
            if (apiType === 'google_translate') {
                data.api_key = $('#gaal_translation_google_api_key').val();
            } else if (apiType === 'llm') {
                data.endpoint = $('#gaal_translation_llm_endpoint').val();
                data.api_key = $('#gaal_translation_llm_api_key').val();
                data.model = $('#gaal_translation_llm_model').val();
            }
            
            // Make AJAX request
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: data,
                success: function(response) {
                    $button.prop('disabled', false).text('<?php echo esc_js(__('Test Connection', 'kingdom-training')); ?>');
                    
                    if (response.success) {
                        $result.html('<span style="color: #46b450; font-weight: 600;">✓ <?php echo esc_js(__('Connection successful!', 'kingdom-training')); ?></span>');
                    } else {
                        var errorMsg = response.data && response.data.message ? response.data.message : '<?php echo esc_js(__('Connection failed', 'kingdom-training')); ?>';
                        $result.html('<span style="color: #dc3232; font-weight: 600;">✗ ' + errorMsg + '</span>');
                    }
                },
                error: function(xhr, status, error) {
                    $button.prop('disabled', false).text('<?php echo esc_js(__('Test Connection', 'kingdom-training')); ?>');
                    $result.html('<span style="color: #dc3232; font-weight: 600;">✗ <?php echo esc_js(__('Connection failed', 'kingdom-training')); ?></span>');
                }
            });
        });
    });
    </script>
    <?php
}
