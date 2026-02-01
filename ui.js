/**
 * UI Controller
 * Handles DOM manipulation and user interactions
 */

class SpeedreaderUI {
    constructor() {
        // DOM Elements
        this.textInput = document.getElementById('text-input');
        this.beforeOrp = document.getElementById('before-orp');
        this.orpChar = document.getElementById('orp-char');
        this.afterOrp = document.getElementById('after-orp');
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text');
        this.wpmSlider = document.getElementById('wpm-slider');
        this.wpmValue = document.getElementById('wpm-value');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.wordCount = document.getElementById('word-count');

        // Initialize engine with callbacks
        this.engine = new RSVPEngine(
            (wordData) => this.renderWord(wordData),
            (progress) => this.updateProgress(progress),
            () => this.onComplete()
        );

        this.init();
    }

    /**
     * Initialize the UI
     */
    init() {
        this.bindEvents();
        this.updateWPMDisplay(CONFIG.DEFAULT_WPM);

        // Load sample text
        this.textInput.value = CONFIG.SAMPLE_TEXT;
        this.loadText();
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Text input
        this.textInput.addEventListener('input', () => this.onTextChange());

        // WPM slider
        this.wpmSlider.addEventListener('input', (e) => {
            const wpm = parseInt(e.target.value, 10);
            this.engine.setWPM(wpm);
            this.updateWPMDisplay(wpm);
        });

        // Play/Pause button
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());

        // Reset button
        this.resetBtn.addEventListener('click', () => this.reset());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e
     */
    handleKeyboard(e) {
        // Ignore if typing in textarea
        if (e.target === this.textInput) return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'KeyR':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    this.reset();
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.adjustWPM(CONFIG.WPM_STEP);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.adjustWPM(-CONFIG.WPM_STEP);
                break;
        }
    }

    /**
     * Adjust WPM by a delta
     * @param {number} delta - Amount to adjust
     */
    adjustWPM(delta) {
        const newWPM = Math.max(
            CONFIG.MIN_WPM,
            Math.min(CONFIG.MAX_WPM, this.engine.wpm + delta)
        );
        this.wpmSlider.value = newWPM;
        this.engine.setWPM(newWPM);
        this.updateWPMDisplay(newWPM);
    }

    /**
     * Handle text input changes
     */
    onTextChange() {
        // Debounce for performance
        clearTimeout(this.textChangeTimeout);
        this.textChangeTimeout = setTimeout(() => this.loadText(), 150);
    }

    /**
     * Load text from input into engine
     */
    loadText() {
        const text = this.textInput.value;
        this.engine.setText(text);
        this.updateWordCount();
        this.updatePlayPauseButton(false);
    }

    /**
     * Render a word in the redicle
     * @param {object} wordData - Word data from engine
     */
    renderWord(wordData) {
        this.beforeOrp.textContent = wordData.before;
        this.orpChar.textContent = wordData.orpChar;
        this.afterOrp.textContent = wordData.after;
    }

    /**
     * Clear the word display
     */
    clearWord() {
        this.beforeOrp.textContent = '';
        this.orpChar.textContent = '';
        this.afterOrp.textContent = '';
    }

    /**
     * Update the progress bar
     * @param {number} percent - Progress percentage (0-100)
     */
    updateProgress(percent) {
        this.progressBar.style.width = `${percent}%`;
        this.progressText.textContent = `${Math.round(percent)}%`;
    }

    /**
     * Update the WPM display
     * @param {number} wpm - Words per minute
     */
    updateWPMDisplay(wpm) {
        this.wpmValue.textContent = `${wpm} WPM`;
    }

    /**
     * Update word count display
     */
    updateWordCount() {
        const count = this.engine.getWordCount();
        this.wordCount.textContent = `${count} word${count !== 1 ? 's' : ''}`;
    }

    /**
     * Update play/pause button state
     * @param {boolean} isPlaying
     */
    updatePlayPauseButton(isPlaying) {
        this.playPauseBtn.textContent = isPlaying ? 'Pause' : 'Start';
        this.playPauseBtn.classList.toggle('playing', isPlaying);
    }

    /**
     * Toggle play/pause state
     */
    togglePlayPause() {
        if (!this.engine.hasText()) return;

        const isPlaying = this.engine.toggle();
        this.updatePlayPauseButton(isPlaying);
    }

    /**
     * Reset to beginning
     */
    reset() {
        this.engine.reset();
        this.updatePlayPauseButton(false);
    }

    /**
     * Called when playback completes
     */
    onComplete() {
        this.updatePlayPauseButton(false);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.speedreader = new SpeedreaderUI();
});
