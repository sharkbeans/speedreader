/**
 * Speedreader Configuration
 * Contains all settings and constants for the RSVP engine
 */

const CONFIG = {
    // WPM Settings
    DEFAULT_WPM: 300,
    MIN_WPM: 200,
    MAX_WPM: 1000,
    WPM_STEP: 25,

    // Timing
    PUNCTUATION_PAUSE_MULTIPLIER: 1.5,
    PUNCTUATION_REGEX: /[.!?;]$/,

    // ORP (Optimal Recognition Point) Rules
    // Maps word length ranges to ORP index (0-based)
    ORP_RULES: [
        { maxLength: 1, orpIndex: 0 },   // 0-1 letters: 1st letter
        { maxLength: 5, orpIndex: 1 },   // 2-5 letters: 2nd letter
        { maxLength: 9, orpIndex: 2 },   // 6-9 letters: 3rd letter
        { maxLength: 13, orpIndex: 3 },  // 10-13 letters: 4th letter
        { maxLength: Infinity, orpIndex: 4 }  // 14+ letters: 5th letter
    ],

    // Display
    ORP_HIGHLIGHT_COLOR: '#FF4500',

    // Sample text for initial display
    SAMPLE_TEXT: `Speed reading is a collection of methods for increasing reading speed without significantly reducing comprehension. It allows you to absorb written content faster than traditional reading. This technology uses RSVP to display words one at a time at a fixed focal point, eliminating the need for eye movement across the page.`
};

// Freeze config to prevent accidental modification
Object.freeze(CONFIG);
Object.freeze(CONFIG.ORP_RULES);
