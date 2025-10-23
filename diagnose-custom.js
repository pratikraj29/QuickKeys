/**
 * Quick diagnostic script to paste into browser console
 * This will verify that Custom Mode is working correctly
 */

console.log('🔍 QuickKeys Custom Mode Diagnostic Starting...\n');

// Test 1: Check if custom-mode-engine is loaded
console.log('📦 TEST 1: Custom Mode Engine');
if (typeof window.customModeEngine !== 'undefined') {
    console.log('✅ customModeEngine is loaded');
    console.log('   - Type:', typeof window.customModeEngine);
    console.log('   - Has startCustomGame:', typeof window.customModeEngine.startCustomGame === 'function');
} else {
    console.log('❌ customModeEngine NOT found!');
}

// Test 2: Check main app
console.log('\n📦 TEST 2: Main App');
if (typeof window.quickKeysApp !== 'undefined') {
    console.log('✅ quickKeysApp is loaded');
    console.log('   - Has showScreen:', typeof window.quickKeysApp.showScreen === 'function');
} else {
    console.log('❌ quickKeysApp NOT found!');
}

// Test 3: Check for old enhanced-custom-mode conflicts
console.log('\n📦 TEST 3: Checking for Conflicts');
if (typeof EnhancedCustomMode !== 'undefined') {
    console.log('⚠️  WARNING: EnhancedCustomMode is still loaded (old file)');
    console.log('   This may cause conflicts! Remove enhanced-custom-mode.js');
} else {
    console.log('✅ No old EnhancedCustomMode detected');
}

// Test 4: Check DOM elements
console.log('\n📦 TEST 4: DOM Elements');
const playBtn = document.getElementById('play-now');
const saveBtn = document.getElementById('save-challenge');
const textArea = document.getElementById('custom-text');

if (playBtn) {
    console.log('✅ Play Now button found');
    // Check event listeners count
    console.log('   - Button exists in DOM');
} else {
    console.log('❌ Play Now button NOT found!');
}

if (saveBtn) {
    console.log('✅ Save Challenge button found');
} else {
    console.log('❌ Save Challenge button NOT found!');
}

if (textArea) {
    console.log('✅ Custom text area found');
    console.log('   - Current value length:', textArea.value.length);
} else {
    console.log('❌ Custom text area NOT found!');
}

// Test 5: localStorage
console.log('\n📦 TEST 5: localStorage');
const savedText = localStorage.getItem('quickkeys_custom_text');
const savedTimer = localStorage.getItem('quickkeys_custom_timer');

if (savedText) {
    console.log('✅ Saved text found:', savedText.substring(0, 50) + '...');
    console.log('   - Length:', savedText.length, 'characters');
} else {
    console.log('ℹ️  No saved text in localStorage yet');
}

if (savedTimer) {
    console.log('✅ Saved timer found:', savedTimer, 'seconds');
} else {
    console.log('ℹ️  No saved timer in localStorage yet');
}

// Test 6: Quick functional test
console.log('\n📦 TEST 6: Functional Test');
console.log('Run these commands to test manually:');
console.log('');
console.log('// 1. Set some test text:');
console.log('document.getElementById("custom-text").value = "The quick brown fox jumps over the lazy dog.";');
console.log('');
console.log('// 2. Save it:');
console.log('customModeEngine.saveCustomChallenge();');
console.log('');
console.log('// 3. Start the game:');
console.log('customModeEngine.startCustomGame();');
console.log('');

console.log('\n✅ Diagnostic Complete!\n');
console.log('If you see any ❌ or ⚠️  above, that indicates the problem.');
console.log('After hard refresh (Ctrl+F5), all tests should show ✅');
