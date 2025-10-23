// Quick debug script - paste this in browser console to test Custom Mode

console.log('=== Custom Mode Debug ===');

// Check if engine loaded
console.log('1. CustomModeEngine loaded:', !!window.customModeEngine);

// Check localStorage
console.log('2. Saved text:', localStorage.getItem('quickkeys_custom_text'));
console.log('3. Saved timer:', localStorage.getItem('quickkeys_custom_timer'));

// Check DOM elements
console.log('4. Play button:', !!document.getElementById('play-now'));
console.log('5. Save button:', !!document.getElementById('save-challenge'));
console.log('6. Textarea:', !!document.getElementById('custom-text'));

// Test save function
if (window.customModeEngine) {
    const textarea = document.getElementById('custom-text');
    if (textarea && textarea.value.trim().length >= 20) {
        console.log('7. Text in textarea:', textarea.value.substring(0, 50) + '...');
        console.log('8. Ready to save!');
    } else {
        console.log('7. No text in textarea or too short');
    }
}

console.log('=== End Debug ===');
