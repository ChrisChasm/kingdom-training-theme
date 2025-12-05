/**
 * Translation Admin JavaScript
 * 
 * Handles AJAX interactions for translation meta box
 */

(function($) {
    'use strict';
    
    $(document).ready(function() {
        // Generate all translations
        $('.gaal-generate-all').on('click', function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var $messages = $('.gaal-translation-messages');
            
            $button.prop('disabled', true).text(gaalTranslation.strings.loading);
            $messages.empty();
            
            $.ajax({
                url: gaalTranslation.apiUrl + 'generate-all',
                method: 'POST',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', gaalTranslation.nonce);
                },
                data: {
                    post_id: gaalTranslation.postId
                },
                success: function(response) {
                    $button.prop('disabled', false).text(gaalTranslation.strings.generateAll);
                    
                    if (response.success) {
                        $messages.html('<div class="notice notice-success"><p>' + 
                            gaalTranslation.strings.success + ': ' + response.message + '</p></div>');
                        
                        // Refresh page after 2 seconds to show updated translations
                        setTimeout(function() {
                            location.reload();
                        }, 2000);
                    } else {
                        $messages.html('<div class="notice notice-error"><p>' + 
                            gaalTranslation.strings.error + ': ' + (response.message || 'Unknown error') + '</p></div>');
                    }
                },
                error: function(xhr, status, error) {
                    $button.prop('disabled', false).text(gaalTranslation.strings.generateAll);
                    
                    var errorMessage = 'Unknown error';
                    if (xhr.responseJSON) {
                        if (xhr.responseJSON.message) {
                            errorMessage = xhr.responseJSON.message;
                        } else if (xhr.responseJSON.data && xhr.responseJSON.data.message) {
                            errorMessage = xhr.responseJSON.data.message;
                        } else if (xhr.responseJSON.code) {
                            errorMessage = xhr.responseJSON.code + ': ' + (xhr.responseJSON.message || errorMessage);
                        }
                        
                        // Include detailed errors if available
                        if (xhr.responseJSON.data && xhr.responseJSON.data.errors) {
                            var errors = xhr.responseJSON.data.errors;
                            if (typeof errors === 'object') {
                                var errorList = [];
                                for (var lang in errors) {
                                    if (errors.hasOwnProperty(lang)) {
                                        errorList.push(lang + ': ' + errors[lang]);
                                    }
                                }
                                if (errorList.length > 0) {
                                    errorMessage += '<br><strong>Details:</strong><br>' + errorList.join('<br>');
                                }
                            }
                        }
                    } else if (xhr.responseText) {
                        try {
                            var error = JSON.parse(xhr.responseText);
                            errorMessage = error.message || (error.data && error.data.message) || errorMessage;
                            if (error.data && error.data.errors) {
                                var errors = error.data.errors;
                                if (typeof errors === 'object') {
                                    var errorList = [];
                                    for (var lang in errors) {
                                        if (errors.hasOwnProperty(lang)) {
                                            errorList.push(lang + ': ' + errors[lang]);
                                        }
                                    }
                                    if (errorList.length > 0) {
                                        errorMessage += '<br><strong>Details:</strong><br>' + errorList.join('<br>');
                                    }
                                }
                            }
                        } catch(e) {
                            errorMessage = xhr.responseText.substring(0, 200);
                        }
                    }
                    
                    // Log full error for debugging
                    console.error('Translation error:', {
                        status: xhr.status,
                        statusText: xhr.statusText,
                        response: xhr.responseJSON || xhr.responseText,
                        error: error
                    });
                    
                    $messages.html('<div class="notice notice-error"><p>' + 
                        gaalTranslation.strings.error + ': ' + errorMessage + '</p></div>');
                }
            });
        });
        
        // Translate single language
        $('.gaal-translate-single').on('click', function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var $language = $button.data('language') || $button.attr('data-language');
            var $messages = $('.gaal-translation-messages');
            var $statusText = $button.closest('.gaal-translation-language').find('.gaal-translation-status-text');
            
            // Debug logging
            console.log('Translation request:', {
                postId: gaalTranslation.postId,
                targetLanguage: $language,
                buttonData: $button.data(),
            });
            
            // Validate required data
            if (!$language) {
                console.error('Missing language data attribute');
                $messages.html('<div class="notice notice-error"><p>' + 
                    gaalTranslation.strings.error + ': ' + 'Language not specified</p></div>');
                return;
            }
            
            if (!gaalTranslation.postId) {
                console.error('Missing post ID');
                $messages.html('<div class="notice notice-error"><p>' + 
                    gaalTranslation.strings.error + ': ' + 'Post ID not found</p></div>');
                return;
            }
            
            $button.prop('disabled', true).text(gaalTranslation.strings.loading);
            $messages.empty();
            
            // Log the full request details
            console.log('Making AJAX request:', {
                url: gaalTranslation.apiUrl + 'single',
                nonce: gaalTranslation.nonce,
                data: {
                    post_id: parseInt(gaalTranslation.postId, 10),
                    target_language: String($language).trim()
                }
            });
            
            $.ajax({
                url: gaalTranslation.apiUrl + 'single',
                method: 'POST',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', gaalTranslation.nonce);
                    console.log('Request headers set, nonce:', gaalTranslation.nonce);
                },
                data: {
                    post_id: parseInt(gaalTranslation.postId, 10),
                    target_language: String($language).trim()
                },
                success: function(response) {
                    $button.prop('disabled', false).text(gaalTranslation.strings.translateSingle);
                    
                    if (response.success) {
                        $messages.html('<div class="notice notice-success"><p>' + 
                            gaalTranslation.strings.success + ': ' + response.message + '</p></div>');
                        
                        // Update status
                        $statusText.html('<span class="status-draft">' + gaalTranslation.strings.completed + '</span>');
                        
                        // Refresh page after 2 seconds to show updated translation
                        setTimeout(function() {
                            location.reload();
                        }, 2000);
                    } else {
                        $messages.html('<div class="notice notice-error"><p>' + 
                            gaalTranslation.strings.error + ': ' + (response.message || 'Unknown error') + '</p></div>');
                    }
                },
                error: function(xhr, status, error) {
                    $button.prop('disabled', false).text(gaalTranslation.strings.translateSingle);
                    
                    var errorMessage = 'Unknown error';
                    if (xhr.responseJSON) {
                        if (xhr.responseJSON.message) {
                            errorMessage = xhr.responseJSON.message;
                        } else if (xhr.responseJSON.data && xhr.responseJSON.data.message) {
                            errorMessage = xhr.responseJSON.data.message;
                        } else if (xhr.responseJSON.code) {
                            errorMessage = xhr.responseJSON.code + ': ' + (xhr.responseJSON.message || errorMessage);
                        }
                        
                        // Include detailed errors if available
                        if (xhr.responseJSON.data && xhr.responseJSON.data.errors) {
                            var errors = xhr.responseJSON.data.errors;
                            if (typeof errors === 'object') {
                                var errorList = [];
                                for (var lang in errors) {
                                    if (errors.hasOwnProperty(lang)) {
                                        errorList.push(lang + ': ' + errors[lang]);
                                    }
                                }
                                if (errorList.length > 0) {
                                    errorMessage += '<br><strong>Details:</strong><br>' + errorList.join('<br>');
                                }
                            }
                        }
                    } else if (xhr.responseText) {
                        try {
                            var error = JSON.parse(xhr.responseText);
                            errorMessage = error.message || (error.data && error.data.message) || errorMessage;
                            if (error.data && error.data.errors) {
                                var errors = error.data.errors;
                                if (typeof errors === 'object') {
                                    var errorList = [];
                                    for (var lang in errors) {
                                        if (errors.hasOwnProperty(lang)) {
                                            errorList.push(lang + ': ' + errors[lang]);
                                        }
                                    }
                                    if (errorList.length > 0) {
                                        errorMessage += '<br><strong>Details:</strong><br>' + errorList.join('<br>');
                                    }
                                }
                            }
                        } catch(e) {
                            errorMessage = xhr.responseText.substring(0, 200);
                        }
                    }
                    
                    // Log full error for debugging
                    console.error('=== Translation Error Details ===');
                    console.error('Status:', xhr.status);
                    console.error('Status Text:', xhr.statusText);
                    console.error('Response JSON:', xhr.responseJSON);
                    console.error('Response Text (raw):', xhr.responseText);
                    console.error('Error param:', error);
                    console.error('All response headers:', xhr.getAllResponseHeaders());
                    console.error('=================================');
                    
                    $messages.html('<div class="notice notice-error"><p>' + 
                        gaalTranslation.strings.error + ': ' + errorMessage + '</p></div>');
                }
            });
        });
        
        // Poll for translation status (if job is in progress)
        function pollTranslationStatus() {
            // This could be implemented to check job status periodically
            // For now, we'll rely on page refresh after completion
        }
    });
    
})(jQuery);
