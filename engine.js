/**
 * RSVP Engine
 * Handles word timing, ORP calculation, and playback control
 */

class RSVPEngine {
    constructor(onWordDisplay, onProgress, onComplete) {
        this.words = [];
        this.currentIndex = 0;
        this.wpm = CONFIG.DEFAULT_WPM;
        this.isPlaying = false;
        this.timeoutId = null;
        this.lastScheduledTime = 0;

        // Callbacks
        this.onWordDisplay = onWordDisplay || (() => {});
        this.onProgress = onProgress || (() => {});
        this.onComplete = onComplete || (() => {});
    }

    /**
     * Calculate the Optimal Recognition Point index for a word
     * @param {string} word - The word to analyze
     * @returns {number} - The 0-based index of the ORP character
     */
    calculateORP(word) {
        const length = word.length;

        for (const rule of CONFIG.ORP_RULES) {
            if (length <= rule.maxLength) {
                // Ensure ORP index doesn't exceed word length
                return Math.min(rule.orpIndex, length - 1);
            }
        }

        // Fallback (should never reach here due to Infinity rule)
        return Math.min(4, length - 1);
    }

    /**
     * Calculate display delay for a word based on WPM and punctuation
     * @param {string} word - The word to calculate delay for
     * @returns {number} - Delay in milliseconds
     */
    calculateDelay(word) {
        // Base delay: 60000ms per minute / WPM
        const baseDelay = 60000 / this.wpm;

        // Check for punctuation at end of word
        if (CONFIG.PUNCTUATION_REGEX.test(word)) {
            return baseDelay * CONFIG.PUNCTUATION_PAUSE_MULTIPLIER;
        }

        return baseDelay;
    }

    /**
     * Parse and load text into the engine
     * @param {string} text - The text to parse
     */
    setText(text) {
        // Split on whitespace and filter empty strings
        this.words = text.trim().split(/\s+/).filter(word => word.length > 0);
        this.currentIndex = 0;
        this.isPlaying = false;
        this.clearTimeout();

        // Display first word if available
        if (this.words.length > 0) {
            this.displayCurrentWord();
        }

        this.updateProgress();
    }

    /**
     * Get the current word and its ORP data
     * @returns {object|null} - Word data or null if no words
     */
    getCurrentWordData() {
        if (this.currentIndex >= this.words.length) {
            return null;
        }

        const word = this.words[this.currentIndex];
        const orpIndex = this.calculateORP(word);

        return {
            word,
            orpIndex,
            before: word.substring(0, orpIndex),
            orpChar: word[orpIndex],
            after: word.substring(orpIndex + 1)
        };
    }

    /**
     * Display the current word via callback
     */
    displayCurrentWord() {
        const wordData = this.getCurrentWordData();
        if (wordData) {
            this.onWordDisplay(wordData);
        }
    }

    /**
     * Update progress via callback
     */
    updateProgress() {
        const progress = this.words.length > 0
            ? (this.currentIndex / this.words.length) * 100
            : 0;
        this.onProgress(progress);
    }

    /**
     * Start or resume playback
     */
    start() {
        if (this.words.length === 0) return;
        if (this.isPlaying) return;

        // If at end, restart
        if (this.currentIndex >= this.words.length) {
            this.currentIndex = 0;
        }

        this.isPlaying = true;
        this.displayCurrentWord();
        this.scheduleNextWord();
    }

    /**
     * Pause playback
     */
    pause() {
        this.isPlaying = false;
        this.clearTimeout();
    }

    /**
     * Toggle between play and pause
     * @returns {boolean} - New playing state
     */
    toggle() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.start();
        }
        return this.isPlaying;
    }

    /**
     * Reset to the beginning
     */
    reset() {
        this.pause();
        this.currentIndex = 0;

        if (this.words.length > 0) {
            this.displayCurrentWord();
        }

        this.updateProgress();
    }

    /**
     * Set words per minute
     * @param {number} wpm - New WPM value
     */
    setWPM(wpm) {
        this.wpm = Math.max(CONFIG.MIN_WPM, Math.min(CONFIG.MAX_WPM, wpm));
    }

    /**
     * Get current progress percentage
     * @returns {number} - Progress from 0 to 100
     */
    getProgress() {
        if (this.words.length === 0) return 0;
        return (this.currentIndex / this.words.length) * 100;
    }

    /**
     * Clear any pending timeout
     */
    clearTimeout() {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    /**
     * Schedule the next word display with drift correction
     * @param {number} drift - Time drift from previous iteration to compensate
     */
    scheduleNextWord(drift = 0) {
        if (!this.isPlaying) return;

        const currentWord = this.words[this.currentIndex];
        const delay = Math.max(1, this.calculateDelay(currentWord) - drift);
        const startTime = performance.now();

        this.timeoutId = setTimeout(() => {
            if (!this.isPlaying) return;

            // Calculate actual drift
            const actualDelay = performance.now() - startTime;
            const newDrift = actualDelay - delay;

            // Move to next word
            this.currentIndex++;
            this.updateProgress();

            if (this.currentIndex >= this.words.length) {
                // Reached the end
                this.isPlaying = false;
                this.onComplete();
                return;
            }

            // Display and schedule next
            this.displayCurrentWord();
            this.scheduleNextWord(newDrift);
        }, delay);
    }

    /**
     * Check if engine has loaded text
     * @returns {boolean}
     */
    hasText() {
        return this.words.length > 0;
    }

    /**
     * Get total word count
     * @returns {number}
     */
    getWordCount() {
        return this.words.length;
    }
}
