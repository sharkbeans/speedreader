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
        this.focusModeToggle = document.getElementById('focus-mode-toggle');
        this.focusOverlay = document.getElementById('focus-overlay');
        this.wordDisplay = document.querySelector('.word-display');
        this.loopToggle = document.getElementById('loop-toggle');

        // Settings elements
        this.settingsPanel = document.getElementById('settings-panel');
        this.settingsToggle = document.getElementById('settings-toggle');
        this.fontSelect = document.getElementById('font-select');
        this.fontSizeSlider = document.getElementById('font-size-slider');
        this.fontSizeValue = document.getElementById('font-size-value');
        this.themeSelect = document.getElementById('theme-select');
        this.orpColorPicker = document.getElementById('orp-color-picker');
        this.resetSettingsBtn = document.getElementById('reset-settings-btn');

        // Focus mode state
        this.isFocusMode = false;

        // Loop state
        this.isLoopEnabled = false;

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
        this.populateFontSelect();
        this.loadPreferences();
        this.bindEvents();
        this.updateWPMDisplay(this.engine.wpm);

        // Load sample text
        this.textInput.value = CONFIG.SAMPLE_TEXT;
        this.loadText();
    }

    /**
     * Populate font select dropdown
     */
    populateFontSelect() {
        CONFIG.FONTS.forEach((font, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = font.name;
            this.fontSelect.appendChild(option);
        });
    }

    /**
     * Load preferences from localStorage
     */
    loadPreferences() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        const prefs = saved ? JSON.parse(saved) : {};

        // WPM
        const wpm = prefs.wpm || CONFIG.DEFAULT_WPM;
        this.engine.setWPM(wpm);
        this.wpmSlider.value = wpm;

        // Font
        const fontIndex = prefs.fontIndex ?? CONFIG.DEFAULT_FONT;
        this.fontSelect.value = fontIndex;
        this.applyFont(fontIndex);

        // Font size
        const fontSize = prefs.fontSize || CONFIG.DEFAULT_FONT_SIZE;
        this.fontSizeSlider.value = fontSize;
        this.applyFontSize(fontSize);

        // Theme
        const theme = prefs.theme || CONFIG.DEFAULT_THEME;
        this.themeSelect.value = theme;
        this.applyTheme(theme);

        // Loop
        this.isLoopEnabled = prefs.loop || false;
        this.loopToggle.checked = this.isLoopEnabled;

        // ORP Color
        const orpColor = prefs.orpColor || '#FF4500';
        this.orpColorPicker.value = orpColor;
        this.applyOrpColor(orpColor);
    }

    /**
     * Save preferences to localStorage
     */
    savePreferences() {
        const prefs = {
            wpm: this.engine.wpm,
            fontIndex: parseInt(this.fontSelect.value, 10),
            fontSize: parseInt(this.fontSizeSlider.value, 10),
            theme: this.themeSelect.value,
            loop: this.isLoopEnabled,
            orpColor: this.orpColorPicker.value
        };
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(prefs));
    }

    /**
     * Apply font to word display
     * @param {number} fontIndex
     */
    applyFont(fontIndex) {
        const font = CONFIG.FONTS[fontIndex];
        if (font) {
            this.wordDisplay.style.fontFamily = font.value;
        }
    }

    /**
     * Apply font size to word display
     * @param {number} size
     */
    applyFontSize(size) {
        this.wordDisplay.style.fontSize = `${size}px`;
        this.fontSizeValue.textContent = `${size}px`;
    }

    /**
     * Apply theme
     * @param {string} theme
     */
    applyTheme(theme) {
        document.body.classList.toggle('light-theme', theme === 'light');
    }

    /**
     * Apply ORP (focus letter) color
     * @param {string} color - Hex color value
     */
    applyOrpColor(color) {
        this.orpChar.style.color = color;
    }

    /**
     * Reset all settings to defaults
     */
    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            location.reload();
        }
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
            this.savePreferences();
        });

        // Play/Pause button
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());

        // Reset button
        this.resetBtn.addEventListener('click', () => this.reset());

        // Focus mode toggle
        this.focusModeToggle.addEventListener('change', () => this.updateFocusMode());

        // Loop toggle
        this.loopToggle.addEventListener('change', () => {
            this.isLoopEnabled = this.loopToggle.checked;
            this.savePreferences();
        });

        // Settings panel toggle
        this.settingsToggle.addEventListener('click', () => {
            this.settingsPanel.classList.toggle('open');
        });

        // Font select
        this.fontSelect.addEventListener('change', (e) => {
            const fontIndex = parseInt(e.target.value, 10);
            this.applyFont(fontIndex);
            this.savePreferences();
        });

        // Font size slider
        this.fontSizeSlider.addEventListener('input', (e) => {
            const size = parseInt(e.target.value, 10);
            this.applyFontSize(size);
            this.savePreferences();
        });

        // Theme select
        this.themeSelect.addEventListener('change', (e) => {
            this.applyTheme(e.target.value);
            this.savePreferences();
        });

        // ORP color picker
        this.orpColorPicker.addEventListener('input', (e) => {
            this.applyOrpColor(e.target.value);
            this.savePreferences();
        });

        // Reset settings button
        this.resetSettingsBtn.addEventListener('click', () => this.resetSettings());

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
            case 'KeyF':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    this.toggleFocusMode();
                }
                break;
            case 'KeyL':
                if (!e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    this.toggleLoop();
                }
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
        if (this.isLoopEnabled) {
            this.engine.reset();
            this.engine.start();
            this.updatePlayPauseButton(true);
        } else {
            this.updatePlayPauseButton(false);
        }
    }

    /**
     * Toggle loop mode (called by keyboard shortcut)
     */
    toggleLoop() {
        this.loopToggle.checked = !this.loopToggle.checked;
        this.isLoopEnabled = this.loopToggle.checked;
        this.savePreferences();
    }

    /**
     * Toggle focus mode (called by keyboard shortcut)
     */
    toggleFocusMode() {
        this.focusModeToggle.checked = !this.focusModeToggle.checked;
        this.updateFocusMode();
    }

    /**
     * Update focus mode state (called by toggle change)
     */
    updateFocusMode() {
        const entering = this.focusModeToggle.checked;
        this.isFocusMode = entering;

        // Trigger the vignette animation
        this.focusOverlay.classList.remove('animating', 'animating-out');
        // Force reflow to restart animation
        void this.focusOverlay.offsetWidth;
        this.focusOverlay.classList.add(entering ? 'animating' : 'animating-out');

        // Apply focus mode class
        document.body.classList.toggle('focus-mode', this.isFocusMode);

        // Clean up animation class after it completes
        const duration = entering ? 800 : 500;
        setTimeout(() => {
            this.focusOverlay.classList.remove('animating', 'animating-out');
        }, duration);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.speedreader = new SpeedreaderUI();
});
