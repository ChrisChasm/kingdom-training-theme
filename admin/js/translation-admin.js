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
        
        /**
         * Chunked Translation Function
         * 
         * Orchestrates translation by making sequential AJAX calls for each step:
         * init -> title -> content_0..N -> excerpt -> finalize
         * 
         * This avoids PHP timeout by breaking large translations into smaller requests.
         * 
         * @param {number} sourcePostId - The source post ID (English version)
         * @param {string} targetLanguage - Target language code (e.g., 'ar', 'es')
         * @param {object} options - Options object with callbacks
         */
        function translateChunked(sourcePostId, targetLanguage, options) {
            options = options || {};
            var onProgress = options.onProgress || function() {};
            var onComplete = options.onComplete || function() {};
            var onError = options.onError || function() {};
            
            var jobId = null;
            var totalSteps = 0;
            var currentStep = 0;
            var steps = [];
            
            console.log('Starting chunked translation:', {
                sourcePostId: sourcePostId,
                targetLanguage: targetLanguage
            });
            
            // Make a single step request
            function makeStepRequest(step) {
                return new Promise(function(resolve, reject) {
                    $.ajax({
                        url: gaalTranslation.apiUrl + 'chunked',
                        method: 'POST',
                        beforeSend: function(xhr) {
                            xhr.setRequestHeader('X-WP-Nonce', gaalTranslation.nonce);
                        },
                        data: {
                            source_post_id: parseInt(sourcePostId, 10),
                            target_language: targetLanguage,
                            step: step,
                            job_id: jobId || 0
                        },
                        success: function(response) {
                            if (response.success) {
                                resolve(response);
                            } else {
                                reject(new Error(response.message || 'Step failed'));
                            }
                        },
                        error: function(xhr, status, error) {
                            var errorMessage = 'Request failed';
                            if (xhr.responseJSON) {
                                errorMessage = xhr.responseJSON.message || 
                                    (xhr.responseJSON.data && xhr.responseJSON.data.message) || 
                                    errorMessage;
                            }
                            console.error('Chunked translation step error:', {
                                step: step,
                                status: xhr.status,
                                response: xhr.responseJSON || xhr.responseText,
                                error: error
                            });
                            reject(new Error(errorMessage));
                        }
                    });
                });
            }
            
            // Process all steps sequentially
            function processNextStep(stepIndex) {
                if (stepIndex >= steps.length) {
                    // All done
                    onComplete({
                        success: true,
                        jobId: jobId,
                        message: gaalTranslation.strings.retranslateSuccess || 'Translation completed successfully!'
                    });
                    return;
                }
                
                var step = steps[stepIndex];
                currentStep = stepIndex + 1; // 1-based for display
                
                onProgress({
                    currentStep: currentStep,
                    totalSteps: totalSteps,
                    step: step,
                    message: getStepMessage(step, currentStep, totalSteps)
                });
                
                makeStepRequest(step)
                    .then(function(response) {
                        // Update jobId from init response
                        if (step === 'init' && response.job_id) {
                            jobId = response.job_id;
                            totalSteps = response.total_steps;
                            
                            // Build the steps array based on chunk count
                            steps = ['init', 'title'];
                            for (var i = 0; i < response.chunk_count; i++) {
                                steps.push('content_' + i);
                            }
                            steps.push('excerpt', 'finalize');
                            
                            console.log('Translation job initialized:', {
                                jobId: jobId,
                                chunkCount: response.chunk_count,
                                totalSteps: totalSteps,
                                steps: steps
                            });
                        }
                        
                        // Move to next step
                        processNextStep(stepIndex + 1);
                    })
                    .catch(function(error) {
                        onError({
                            step: step,
                            stepIndex: stepIndex,
                            message: error.message,
                            jobId: jobId
                        });
                    });
            }
            
            // Get human-readable message for each step
            function getStepMessage(step, current, total) {
                var stepName = '';
                if (step === 'init') {
                    stepName = gaalTranslation.strings.stepInit || 'Initializing...';
                } else if (step === 'title') {
                    stepName = gaalTranslation.strings.stepTitle || 'Translating title...';
                } else if (step.startsWith('content_')) {
                    var chunkNum = parseInt(step.split('_')[1], 10) + 1;
                    stepName = (gaalTranslation.strings.stepContent || 'Translating content chunk %d...').replace('%d', chunkNum);
                } else if (step === 'excerpt') {
                    stepName = gaalTranslation.strings.stepExcerpt || 'Translating excerpt...';
                } else if (step === 'finalize') {
                    stepName = gaalTranslation.strings.stepFinalize || 'Finalizing...';
                }
                
                return (gaalTranslation.strings.stepProgress || 'Step %1$d of %2$d: %3$s')
                    .replace('%1$d', current)
                    .replace('%2$d', total)
                    .replace('%3$s', stepName);
            }
            
            // Start with init step (steps array will be populated after init response)
            steps = ['init'];
            processNextStep(0);
        }
        
        // Expose for external use
        window.gaalTranslateChunked = translateChunked;
        
        // Copy content from English
        $('.gaal-copy-from-english-btn').on('click', function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var sourcePostId = $button.data('source-id');
            var $messages = $('.gaal-translation-messages');
            var $container = $button.closest('.gaal-copy-from-english');
            
            // Confirm action
            if (!confirm(gaalTranslation.strings.confirmCopy || 'This will overwrite the current title, content, and excerpt with the English version. Continue?')) {
                return;
            }
            
            $button.prop('disabled', true).text(gaalTranslation.strings.copying || 'Copying...');
            $messages.empty();
            
            $.ajax({
                url: gaalTranslation.apiUrl + 'copy-from-english',
                method: 'POST',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-WP-Nonce', gaalTranslation.nonce);
                },
                data: {
                    target_post_id: parseInt(gaalTranslation.postId, 10),
                    source_post_id: parseInt(sourcePostId, 10)
                },
                success: function(response) {
                    $button.prop('disabled', false).text(gaalTranslation.strings.copyFromEnglish || 'Copy Content from English');
                    
                    if (response.success) {
                        $messages.html('<div class="notice notice-success"><p>' + 
                            (gaalTranslation.strings.copySuccess || 'Content copied successfully!') + ' ' + 
                            (response.message || '') + '</p></div>');
                        
                        // Reload the page to show updated content
                        setTimeout(function() {
                            location.reload();
                        }, 1500);
                    } else {
                        $messages.html('<div class="notice notice-error"><p>' + 
                            gaalTranslation.strings.error + ': ' + (response.message || 'Unknown error') + '</p></div>');
                    }
                },
                error: function(xhr, status, error) {
                    $button.prop('disabled', false).text(gaalTranslation.strings.copyFromEnglish || 'Copy Content from English');
                    
                    var errorMessage = 'Unknown error';
                    if (xhr.responseJSON) {
                        errorMessage = xhr.responseJSON.message || (xhr.responseJSON.data && xhr.responseJSON.data.message) || errorMessage;
                    }
                    
                    console.error('Copy from English error:', {
                        status: xhr.status,
                        response: xhr.responseJSON || xhr.responseText,
                        error: error
                    });
                    
                    $messages.html('<div class="notice notice-error"><p>' + 
                        gaalTranslation.strings.error + ': ' + errorMessage + '</p></div>');
                }
            });
        });
        
        // Re-translate from English using Google Translate (Chunked)
        $('.gaal-retranslate-btn').on('click', function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var sourcePostId = $button.data('source-id');
            var targetLanguage = $button.data('target-language');
            var languageName = $button.data('language-name');
            var $messages = $('.gaal-translation-messages');
            var $progressContainer = $('.gaal-progress-container');
            var $progressBar = $progressContainer.find('.gaal-progress-bar');
            var $progressText = $progressContainer.find('.gaal-progress-text');
            var originalText = $button.text();
            
            // Confirm action
            if (!confirm(gaalTranslation.strings.confirmRetranslate || 'This will overwrite the current title, content, and excerpt with a fresh translation from Google Translate. Continue?')) {
                return;
            }
            
            // Disable button and show progress
            $button.prop('disabled', true).text(gaalTranslation.strings.retranslating || 'Translating...');
            $messages.empty();
            
            // Show and reset progress bar
            $progressContainer.addClass('active').show();
            $progressBar.css('width', '0%').removeClass('complete error animating').addClass('animating');
            $progressText.text(gaalTranslation.strings.stepInit || 'Initializing...').removeClass('complete error');
            
            // Debug logging
            console.log('Re-translate request (chunked):', {
                sourcePostId: sourcePostId,
                targetLanguage: targetLanguage,
                currentPostId: gaalTranslation.postId
            });
            
            // Use chunked translation
            translateChunked(sourcePostId, targetLanguage, {
                onProgress: function(progress) {
                    // Update progress bar
                    var percent = Math.round((progress.currentStep / progress.totalSteps) * 100);
                    $progressBar.css('width', percent + '%');
                    $progressText.text(progress.message);
                    
                    console.log('Translation progress:', progress);
                },
                onComplete: function(result) {
                    // Show completion
                    $progressBar.css('width', '100%').removeClass('animating').addClass('complete');
                    $progressText.text(gaalTranslation.strings.translationComplete || 'Translation completed!').addClass('complete');
                    $button.prop('disabled', false).text(originalText);
                    
                    $messages.html('<div class="notice notice-success"><p>' + 
                        (gaalTranslation.strings.retranslateSuccess || 'Content re-translated successfully!') + '</p></div>');
                    
                    // Reload the page to show updated content
                    setTimeout(function() {
                        location.reload();
                    }, 1500);
                },
                onError: function(error) {
                    // Show error
                    $progressBar.removeClass('animating').addClass('error');
                    var errorMsg = (gaalTranslation.strings.translationFailed || 'Translation failed at step: %s').replace('%s', error.step);
                    $progressText.text(errorMsg + ' - ' + error.message).addClass('error');
                    $button.prop('disabled', false).text(originalText);
                    
                    console.error('Chunked translation error:', error);
                    
                    $messages.html('<div class="notice notice-error"><p>' + 
                        gaalTranslation.strings.error + ': ' + error.message + '</p></div>');
                }
            });
        });
        
        // Translate single language (also use chunked translation for large posts)
        // Update existing handler to use chunked translation
        $(document).off('click', '.gaal-translate-single').on('click', '.gaal-translate-single', function(e) {
            e.preventDefault();
            
            var $button = $(this);
            var targetLanguage = $button.data('language') || $button.attr('data-language');
            var $messages = $('.gaal-translation-messages');
            var $progressContainer = $('.gaal-progress-container');
            var $progressBar = $progressContainer.find('.gaal-progress-bar');
            var $progressText = $progressContainer.find('.gaal-progress-text');
            var originalText = $button.text();
            
            // Validate required data
            if (!targetLanguage) {
                console.error('Missing language data attribute');
                $messages.html('<div class="notice notice-error"><p>' + 
                    gaalTranslation.strings.error + ': Language not specified</p></div>');
                return;
            }
            
            if (!gaalTranslation.postId) {
                console.error('Missing post ID');
                $messages.html('<div class="notice notice-error"><p>' + 
                    gaalTranslation.strings.error + ': Post ID not found</p></div>');
                return;
            }
            
            // Disable button and show progress
            $button.prop('disabled', true).text(gaalTranslation.strings.loading);
            $messages.empty();
            
            // Show and reset progress bar
            $progressContainer.addClass('active').show();
            $progressBar.css('width', '0%').removeClass('complete error animating').addClass('animating');
            $progressText.text(gaalTranslation.strings.stepInit || 'Initializing...').removeClass('complete error');
            
            console.log('Translate single (chunked):', {
                postId: gaalTranslation.postId,
                targetLanguage: targetLanguage
            });
            
            // Use chunked translation with current post as source
            translateChunked(parseInt(gaalTranslation.postId, 10), targetLanguage, {
                onProgress: function(progress) {
                    var percent = Math.round((progress.currentStep / progress.totalSteps) * 100);
                    $progressBar.css('width', percent + '%');
                    $progressText.text(progress.message);
                },
                onComplete: function(result) {
                    $progressBar.css('width', '100%').removeClass('animating').addClass('complete');
                    $progressText.text(gaalTranslation.strings.translationComplete || 'Translation completed!').addClass('complete');
                    $button.prop('disabled', false).text(originalText);
                    
                    $messages.html('<div class="notice notice-success"><p>' + 
                        gaalTranslation.strings.success + ': ' + (gaalTranslation.strings.translationComplete || 'Translation completed!') + '</p></div>');
                    
                    setTimeout(function() {
                        location.reload();
                    }, 1500);
                },
                onError: function(error) {
                    $progressBar.removeClass('animating').addClass('error');
                    var errorMsg = (gaalTranslation.strings.translationFailed || 'Translation failed at step: %s').replace('%s', error.step);
                    $progressText.text(errorMsg + ' - ' + error.message).addClass('error');
                    $button.prop('disabled', false).text(originalText);
                    
                    console.error('Chunked translation error:', error);
                    
                    $messages.html('<div class="notice notice-error"><p>' + 
                        gaalTranslation.strings.error + ': ' + error.message + '</p></div>');
                }
            });
        });
    });
    
})(jQuery);
