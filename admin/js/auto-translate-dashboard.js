/**
 * Auto Translate Dashboard JavaScript
 * 
 * Handles the translation queue management and UI interactions.
 */

(function($) {
    'use strict';
    
    /**
     * Translation Queue Manager
     * Orchestrates translation of multiple posts/languages via AJAX
     */
    class TranslationQueueManager {
        constructor() {
            this.queue = [];
            this.currentItem = null;
            this.currentStep = null;
            this.completed = [];
            this.failed = [];
            this.isPaused = false;
            this.isCancelled = false;
            this.isRunning = false;
            
            this.callbacks = {
                onProgress: null,
                onItemStart: null,
                onItemComplete: null,
                onItemError: null,
                onQueueComplete: null,
            };
        }
        
        /**
         * Add items to queue
         * @param {Array} items - [{source_post_id, target_post_id, language, title}]
         */
        addItems(items) {
            this.queue.push(...items);
            this.updateProgress();
            this.saveState();
        }
        
        /**
         * Clear the queue
         */
        clear() {
            this.queue = [];
            this.currentItem = null;
            this.currentStep = null;
            this.completed = [];
            this.failed = [];
            this.isPaused = false;
            this.isCancelled = false;
            this.isRunning = false;
            this.saveState();
        }
        
        /**
         * Start processing queue
         */
        async start() {
            if (this.isRunning) return;
            
            this.isCancelled = false;
            this.isPaused = false;
            this.isRunning = true;
            
            while (this.queue.length > 0 && !this.isCancelled) {
                if (this.isPaused) {
                    await this.waitForResume();
                    if (this.isCancelled) break;
                }
                
                this.currentItem = this.queue.shift();
                this.updateProgress();
                this.saveState();
                
                if (this.callbacks.onItemStart) {
                    this.callbacks.onItemStart(this.currentItem);
                }
                
                try {
                    await this.translateItem(this.currentItem);
                    this.completed.push(this.currentItem);
                    
                    if (this.callbacks.onItemComplete) {
                        this.callbacks.onItemComplete(this.currentItem);
                    }
                } catch (error) {
                    this.currentItem.error = error.message;
                    this.failed.push(this.currentItem);
                    
                    if (this.callbacks.onItemError) {
                        this.callbacks.onItemError(this.currentItem, error);
                    }
                }
                
                this.currentItem = null;
                this.updateProgress();
                this.saveState();
            }
            
            this.isRunning = false;
            
            if (this.callbacks.onQueueComplete) {
                this.callbacks.onQueueComplete({
                    completed: this.completed,
                    failed: this.failed,
                    cancelled: this.isCancelled,
                });
            }
        }
        
        /**
         * Translate a single item using chunked translation
         */
        translateItem(item) {
            return new Promise((resolve, reject) => {
                this.translateChunked(item.source_post_id, item.language, item.target_post_id, {
                    onProgress: (progress) => {
                        this.currentStep = progress;
                        this.updateProgress();
                    },
                    onComplete: () => resolve(),
                    onError: (error) => reject(error),
                });
            });
        }
        
        /**
         * Chunked translation - sequential AJAX calls for each step
         */
        translateChunked(sourcePostId, targetLanguage, targetPostId, options) {
            let jobId = null;
            let steps = ['init'];
            let stepIndex = 0;
            const self = this;
            
            const processStep = () => {
                if (self.isCancelled) {
                    options.onError(new Error('Translation cancelled'));
                    return;
                }
                
                if (stepIndex >= steps.length) {
                    options.onComplete();
                    return;
                }
                
                const step = steps[stepIndex];
                
                options.onProgress({
                    step: step,
                    stepIndex: stepIndex,
                    totalSteps: steps.length,
                    message: self.getStepMessage(step),
                });
                
                $.ajax({
                    url: gaalAutoTranslate.apiUrl + 'translate/chunked',
                    method: 'POST',
                    beforeSend: (xhr) => {
                        xhr.setRequestHeader('X-WP-Nonce', gaalAutoTranslate.nonce);
                    },
                    contentType: 'application/json',
                    data: JSON.stringify({
                        source_post_id: sourcePostId,
                        target_language: targetLanguage,
                        target_post_id: targetPostId || 0,
                        step: step,
                        job_id: jobId || 0,
                    }),
                    success: (response) => {
                        if (!response.success) {
                            options.onError(new Error(response.message || 'Translation failed'));
                            return;
                        }
                        
                        // Handle init response - get job ID and build steps array
                        if (step === 'init') {
                            jobId = response.job_id;
                            steps = ['init', 'title'];
                            for (let i = 0; i < response.chunk_count; i++) {
                                steps.push('content_' + i);
                            }
                            steps.push('excerpt', 'finalize');
                        }
                        
                        stepIndex++;
                        processStep();
                    },
                    error: (xhr) => {
                        const msg = xhr.responseJSON?.message || 'Request failed';
                        options.onError(new Error(msg));
                    },
                });
            };
            
            processStep();
        }
        
        getStepMessage(step) {
            const messages = {
                'init': gaalAutoTranslate.strings.scanning || 'Initializing...',
                'title': 'Translating title...',
                'excerpt': 'Translating excerpt...',
                'finalize': 'Saving translation...',
            };
            
            if (step.startsWith('content_')) {
                const chunk = parseInt(step.split('_')[1]) + 1;
                return `Translating content (part ${chunk})...`;
            }
            
            return messages[step] || step;
        }
        
        pause() {
            this.isPaused = true;
            this.saveState();
        }
        
        resume() {
            this.isPaused = false;
            if (!this.isRunning && this.queue.length > 0) {
                this.start();
            }
        }
        
        cancel() {
            this.isCancelled = true;
            this.isPaused = false;
            this.isRunning = false;
        }
        
        waitForResume() {
            return new Promise((resolve) => {
                const check = () => {
                    if (!this.isPaused || this.isCancelled) {
                        resolve();
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            });
        }
        
        updateProgress() {
            if (this.callbacks.onProgress) {
                this.callbacks.onProgress({
                    total: this.queue.length + this.completed.length + this.failed.length + (this.currentItem ? 1 : 0),
                    pending: this.queue.length,
                    completed: this.completed.length,
                    failed: this.failed.length,
                    current: this.currentItem,
                    currentStep: this.currentStep,
                    isPaused: this.isPaused,
                    isRunning: this.isRunning,
                });
            }
        }
        
        getStats() {
            return {
                total: this.queue.length + this.completed.length + this.failed.length + (this.currentItem ? 1 : 0),
                pending: this.queue.length,
                completed: this.completed.length,
                failed: this.failed.length,
                isRunning: this.isRunning,
                isPaused: this.isPaused,
            };
        }
        
        /**
         * Save queue state to localStorage for resume after page refresh
         */
        saveState() {
            try {
                localStorage.setItem('gaal_translation_queue', JSON.stringify({
                    queue: this.queue,
                    completed: this.completed,
                    failed: this.failed,
                    isPaused: this.isPaused,
                    savedAt: new Date().toISOString(),
                }));
            } catch (e) {
                console.warn('Could not save queue state:', e);
            }
        }
        
        /**
         * Load queue state from localStorage
         */
        loadState() {
            try {
                const state = localStorage.getItem('gaal_translation_queue');
                if (state) {
                    const data = JSON.parse(state);
                    // Only restore if saved within last hour
                    const savedAt = new Date(data.savedAt);
                    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
                    if (savedAt > hourAgo) {
                        this.queue = data.queue || [];
                        this.completed = data.completed || [];
                        this.failed = data.failed || [];
                        this.isPaused = data.isPaused || false;
                        return true;
                    }
                }
            } catch (e) {
                console.warn('Could not load queue state:', e);
            }
            return false;
        }
        
        /**
         * Clear saved state
         */
        clearState() {
            try {
                localStorage.removeItem('gaal_translation_queue');
            } catch (e) {
                console.warn('Could not clear queue state:', e);
            }
        }
    }
    
    // Export to global scope
    window.GAALTranslationQueue = TranslationQueueManager;
    
    /**
     * Dashboard Controller
     */
    class DashboardController {
        constructor() {
            this.queue = new TranslationQueueManager();
            this.gaps = [];
            this.selectedGaps = new Set();
            
            this.init();
        }
        
        init() {
            this.bindEvents();
            this.setupQueueCallbacks();
            this.initTabs();
            
            // Check for saved queue state
            if (this.queue.loadState() && this.queue.queue.length > 0) {
                this.showProgressSection();
                this.updateProgressUI(this.queue.getStats());
                this.updateQueueTable();
            }
        }
        
        bindEvents() {
            // Tab navigation
            $('.gaal-tabs .nav-tab').on('click', (e) => this.handleTabClick(e));
            
            // Scan button
            $('#btn-scan').on('click', () => this.scanForGaps());
            $('#btn-refresh-gaps').on('click', () => this.scanForGaps());
            
            // Create drafts buttons
            $('#btn-create-all-drafts').on('click', () => this.createAllDrafts());
            $('#btn-create-selected-drafts').on('click', () => this.createSelectedDrafts());
            
            // Translate buttons
            $('#btn-translate-all').on('click', () => this.translateAll());
            $('#btn-translate-selected').on('click', () => this.translateSelected());
            
            // Select all
            $('#select-all-gaps, #select-all-header').on('change', (e) => this.handleSelectAll(e));
            
            // Filters
            $('#filter-post-type, #filter-language').on('change', () => this.applyFilters());
            
            // Queue controls
            $('#btn-pause').on('click', () => this.pauseQueue());
            $('#btn-resume').on('click', () => this.resumeQueue());
            $('#btn-cancel').on('click', () => this.cancelQueue());
            
            // History refresh
            $('#btn-refresh-history').on('click', () => this.loadHistory());
        }
        
        setupQueueCallbacks() {
            this.queue.callbacks.onProgress = (stats) => this.updateProgressUI(stats);
            this.queue.callbacks.onItemStart = (item) => this.onItemStart(item);
            this.queue.callbacks.onItemComplete = (item) => this.onItemComplete(item);
            this.queue.callbacks.onItemError = (item, error) => this.onItemError(item, error);
            this.queue.callbacks.onQueueComplete = (result) => this.onQueueComplete(result);
        }
        
        initTabs() {
            // Check for hash in URL
            const hash = window.location.hash.replace('#', '');
            if (hash && $(`#${hash}`).length) {
                this.switchTab(hash);
            }
        }
        
        handleTabClick(e) {
            e.preventDefault();
            const tab = $(e.currentTarget).data('tab');
            this.switchTab(tab);
            window.location.hash = tab;
        }
        
        switchTab(tabId) {
            $('.nav-tab').removeClass('nav-tab-active');
            $(`.nav-tab[data-tab="${tabId}"]`).addClass('nav-tab-active');
            
            $('.tab-pane').removeClass('active');
            $(`#${tabId}`).addClass('active');
        }
        
        /**
         * Scan for translation gaps
         */
        async scanForGaps() {
            const $btn = $('#btn-scan');
            const originalText = $btn.html();
            $btn.prop('disabled', true).html('<span class="spinner is-active" style="float:none;margin:0"></span> ' + gaalAutoTranslate.strings.scanning);
            
            try {
                const postType = $('#filter-post-type').val();
                const language = $('#filter-language').val();
                
                const response = await $.ajax({
                    url: gaalAutoTranslate.apiUrl + 'translate/scan',
                    method: 'GET',
                    beforeSend: (xhr) => {
                        xhr.setRequestHeader('X-WP-Nonce', gaalAutoTranslate.nonce);
                    },
                    data: {
                        post_type: postType,
                        language: language,
                    },
                });
                
                if (response.success) {
                    this.gaps = Object.values(response.gaps);
                    this.updateSummaryStats(response.summary);
                    this.renderGapsTable();
                    this.updateActionButtons();
                    
                    // Auto-switch to gaps tab if we have gaps
                    if (this.gaps.length > 0) {
                        this.switchTab('gaps');
                    }
                }
            } catch (error) {
                console.error('Scan failed:', error);
                alert(gaalAutoTranslate.strings.error_occurred);
            } finally {
                $btn.prop('disabled', false).html(originalText);
            }
        }
        
        updateSummaryStats(summary) {
            $('#stat-posts-needing').text(summary.posts_needing_translation);
            $('#stat-translations-needed').text(summary.total_translations_needed);
            $('#stat-languages').text(summary.languages_enabled);
        }
        
        renderGapsTable() {
            const $tbody = $('#gaps-tbody');
            $tbody.empty();
            
            if (this.gaps.length === 0) {
                $tbody.html(`<tr class="gaal-empty-row"><td colspan="7">${gaalAutoTranslate.strings.no_gaps_found}</td></tr>`);
                $('#no-gaps-message').show();
                return;
            }
            
            $('#no-gaps-message').hide();
            
            this.gaps.forEach((gap) => {
                const missingBadges = gap.missing_languages.map(lang => 
                    `<span class="lang-badge missing">${lang.toUpperCase()}</span>`
                ).join('');
                
                const existingBadges = Object.keys(gap.existing_translations).map(lang =>
                    `<span class="lang-badge exists">${lang.toUpperCase()}</span>`
                ).join('') || '—';
                
                const row = `
                    <tr data-post-id="${gap.id}">
                        <td class="check-column">
                            <input type="checkbox" class="gap-checkbox" value="${gap.id}" data-languages='${JSON.stringify(gap.missing_languages)}'>
                        </td>
                        <td class="column-title">
                            <strong><a href="${gap.edit_link}" target="_blank">${this.escapeHtml(gap.title)}</a></strong>
                        </td>
                        <td class="column-type">${this.escapeHtml(gap.post_type_label)}</td>
                        <td class="column-missing">
                            <div class="missing-languages">${missingBadges}</div>
                        </td>
                        <td class="column-existing">${existingBadges}</td>
                        <td class="column-chunks">${gap.estimated_chunks}</td>
                        <td class="column-actions">
                            <button type="button" class="button button-small btn-translate-single" data-post-id="${gap.id}" data-languages='${JSON.stringify(gap.missing_languages)}'>
                                <span class="dashicons dashicons-translation"></span>
                            </button>
                        </td>
                    </tr>
                `;
                $tbody.append(row);
            });
            
            // Bind checkbox events
            $('.gap-checkbox').on('change', () => this.updateSelectedCount());
            
            // Bind single translate buttons
            $('.btn-translate-single').on('click', (e) => this.translateSingle(e));
        }
        
        handleSelectAll(e) {
            const isChecked = $(e.target).is(':checked');
            $('.gap-checkbox').prop('checked', isChecked);
            $('#select-all-gaps, #select-all-header').prop('checked', isChecked);
            this.updateSelectedCount();
        }
        
        updateSelectedCount() {
            const checked = $('.gap-checkbox:checked');
            const count = checked.length;
            $('#selected-count').text(`${count} selected`);
            
            this.selectedGaps.clear();
            checked.each((i, el) => {
                this.selectedGaps.add({
                    postId: parseInt($(el).val()),
                    languages: $(el).data('languages'),
                });
            });
            
            $('#btn-create-selected-drafts, #btn-translate-selected').prop('disabled', count === 0);
        }
        
        updateActionButtons() {
            const hasGaps = this.gaps.length > 0;
            $('#btn-create-all-drafts, #btn-translate-all').prop('disabled', !hasGaps);
        }
        
        applyFilters() {
            this.scanForGaps();
        }
        
        /**
         * Create drafts for all gaps
         */
        async createAllDrafts() {
            if (!confirm(gaalAutoTranslate.strings.confirm_create_drafts)) {
                return;
            }
            
            const items = this.gaps.map(gap => ({
                post_id: gap.id,
                languages: gap.missing_languages,
            }));
            
            await this.createDrafts(items);
        }
        
        /**
         * Create drafts for selected gaps
         */
        async createSelectedDrafts() {
            if (!confirm(gaalAutoTranslate.strings.confirm_create_drafts)) {
                return;
            }
            
            const items = Array.from(this.selectedGaps).map(gap => ({
                post_id: gap.postId,
                languages: gap.languages,
            }));
            
            await this.createDrafts(items);
        }
        
        async createDrafts(items) {
            const $btn = $('#btn-create-all-drafts, #btn-create-selected-drafts');
            $btn.prop('disabled', true);
            
            try {
                const response = await $.ajax({
                    url: gaalAutoTranslate.apiUrl + 'translate/create-drafts',
                    method: 'POST',
                    beforeSend: (xhr) => {
                        xhr.setRequestHeader('X-WP-Nonce', gaalAutoTranslate.nonce);
                    },
                    contentType: 'application/json',
                    data: JSON.stringify({ items }),
                });
                
                if (response.success) {
                    alert(`Created ${response.summary.created} drafts (${response.summary.existed} already existed, ${response.summary.errors} errors)`);
                    this.scanForGaps(); // Refresh gaps
                }
            } catch (error) {
                console.error('Create drafts failed:', error);
                alert(gaalAutoTranslate.strings.error_occurred);
            } finally {
                $btn.prop('disabled', false);
            }
        }
        
        /**
         * Translate all gaps
         */
        translateAll() {
            if (!confirm(gaalAutoTranslate.strings.confirm_translate_all)) {
                return;
            }
            
            const items = [];
            this.gaps.forEach(gap => {
                gap.missing_languages.forEach(lang => {
                    items.push({
                        source_post_id: gap.id,
                        target_post_id: 0, // Will be created
                        language: lang,
                        title: gap.title,
                    });
                });
            });
            
            this.startTranslationQueue(items);
        }
        
        /**
         * Translate selected gaps
         */
        translateSelected() {
            if (!confirm(gaalAutoTranslate.strings.confirm_translate_all)) {
                return;
            }
            
            const items = [];
            this.selectedGaps.forEach(gap => {
                const gapData = this.gaps.find(g => g.id === gap.postId);
                gap.languages.forEach(lang => {
                    items.push({
                        source_post_id: gap.postId,
                        target_post_id: 0,
                        language: lang,
                        title: gapData ? gapData.title : 'Unknown',
                    });
                });
            });
            
            this.startTranslationQueue(items);
        }
        
        /**
         * Translate a single post
         */
        translateSingle(e) {
            const $btn = $(e.currentTarget);
            const postId = $btn.data('post-id');
            const languages = $btn.data('languages');
            const gap = this.gaps.find(g => g.id === postId);
            
            const items = languages.map(lang => ({
                source_post_id: postId,
                target_post_id: 0,
                language: lang,
                title: gap ? gap.title : 'Unknown',
            }));
            
            this.startTranslationQueue(items);
        }
        
        startTranslationQueue(items) {
            this.queue.clear();
            this.queue.addItems(items);
            this.showProgressSection();
            this.updateQueueTable();
            this.queue.start();
        }
        
        showProgressSection() {
            $('#progress-section').slideDown();
            this.switchTab('overview');
        }
        
        hideProgressSection() {
            $('#progress-section').slideUp();
        }
        
        updateProgressUI(stats) {
            const total = stats.total || 1;
            const completed = stats.completed || 0;
            const failed = stats.failed || 0;
            const percent = Math.round((completed / total) * 100);
            
            $('#overall-progress').css('width', percent + '%');
            $('#progress-completed').text(completed);
            $('#progress-total').text(total);
            $('#progress-failed').text(failed);
            
            if (failed > 0) {
                $('#progress-failed-container').show();
            }
            
            // Update queue stats
            $('#queue-pending').text(stats.pending || 0);
            $('#queue-processing').text(stats.current ? 1 : 0);
            $('#queue-completed').text(completed);
            $('#queue-failed').text(failed);
            
            // Update current item display
            if (stats.current) {
                let stepInfo = '';
                if (stats.currentStep) {
                    stepInfo = ` — ${stats.currentStep.message}`;
                }
                $('#current-item').html(`
                    <strong>${this.escapeHtml(stats.current.title)}</strong> 
                    → ${stats.current.language.toUpperCase()}${stepInfo}
                `);
            } else {
                $('#current-item').empty();
            }
            
            // Update pause/resume buttons
            if (stats.isPaused) {
                $('#btn-pause').hide();
                $('#btn-resume').show();
            } else {
                $('#btn-pause').show();
                $('#btn-resume').hide();
            }
            
            // Stop spinning if not running
            if (!stats.isRunning) {
                $('.gaal-spinning').removeClass('gaal-spinning');
            }
        }
        
        updateQueueTable() {
            const $tbody = $('#queue-tbody');
            const stats = this.queue.getStats();
            
            if (stats.total === 0) {
                $tbody.html('<tr class="gaal-empty-row"><td colspan="5">No items in queue.</td></tr>');
                return;
            }
            
            $tbody.empty();
            
            // Add pending items
            this.queue.queue.forEach(item => {
                $tbody.append(this.renderQueueRow(item, 'pending'));
            });
            
            // Add current item
            if (this.queue.currentItem) {
                $tbody.prepend(this.renderQueueRow(this.queue.currentItem, 'processing'));
            }
            
            // Add completed items
            this.queue.completed.forEach(item => {
                $tbody.prepend(this.renderQueueRow(item, 'completed'));
            });
            
            // Add failed items
            this.queue.failed.forEach(item => {
                $tbody.prepend(this.renderQueueRow(item, 'failed'));
            });
        }
        
        renderQueueRow(item, status) {
            const statusClass = {
                pending: '',
                processing: 'gaal-status-processing',
                completed: 'gaal-status-completed',
                failed: 'gaal-status-failed',
            }[status] || '';
            
            const statusLabel = {
                pending: 'Pending',
                processing: 'Processing...',
                completed: 'Complete',
                failed: 'Failed',
            }[status] || status;
            
            const progress = status === 'processing' && this.queue.currentStep
                ? `${this.queue.currentStep.stepIndex + 1} / ${this.queue.currentStep.totalSteps}`
                : '—';
            
            return `
                <tr class="${statusClass}">
                    <td class="column-title">${this.escapeHtml(item.title)}</td>
                    <td class="column-language"><span class="lang-badge">${item.language.toUpperCase()}</span></td>
                    <td class="column-status">${statusLabel}</td>
                    <td class="column-progress">${progress}</td>
                    <td class="column-actions">
                        ${status === 'failed' ? `<button class="button button-small btn-retry" data-item='${JSON.stringify(item)}'>Retry</button>` : ''}
                    </td>
                </tr>
            `;
        }
        
        pauseQueue() {
            this.queue.pause();
        }
        
        resumeQueue() {
            this.queue.resume();
        }
        
        cancelQueue() {
            if (confirm('Are you sure you want to cancel the translation queue?')) {
                this.queue.cancel();
                this.queue.clearState();
                this.hideProgressSection();
            }
        }
        
        onItemStart(item) {
            this.updateQueueTable();
        }
        
        onItemComplete(item) {
            this.updateQueueTable();
        }
        
        onItemError(item, error) {
            console.error('Translation error:', item, error);
            this.updateQueueTable();
        }
        
        onQueueComplete(result) {
            const { completed, failed, cancelled } = result;
            
            if (cancelled) {
                // User cancelled
                return;
            }
            
            $('#overall-progress').addClass('complete');
            
            let message = `Translation complete! ${completed.length} succeeded`;
            if (failed.length > 0) {
                message += `, ${failed.length} failed`;
            }
            
            alert(message);
            
            // Refresh gaps to show updated state
            this.scanForGaps();
            this.queue.clearState();
        }
        
        async loadHistory() {
            // TODO: Implement history loading from translation jobs
            console.log('Load history not yet implemented');
        }
        
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }
    
    // Initialize dashboard when DOM is ready
    $(document).ready(function() {
        window.gaalDashboard = new DashboardController();
    });
    
})(jQuery);
