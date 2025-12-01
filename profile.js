// QuickKeys Profile Page Logic
import { supabase, getCurrentUser, getProfile, updateProfile, uploadAvatar } from './supabase.js';

let currentUser = null;
let currentProfile = null;
let wpmChart = null;
let accuracyChart = null;

// === AUTH GUARD ===
async function authGuard() {
    currentUser = await getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// === INITIALIZATION ===
async function init() {
    console.log('🚀 Profile page initializing...');
    
    const isAuthed = await authGuard();
    if (!isAuthed) {
        console.log('❌ Not authenticated, redirecting to login...');
        return;
    }

    console.log('✅ User authenticated:', currentUser.email);
    showLoading();

    try {
        await loadProfile();
        hideLoading();
        console.log('✅ Profile loaded successfully');
    } catch (error) {
        console.error('❌ Error initializing profile:', error);
        showToast('Failed to load profile: ' + error.message, true);
        hideLoading();
    }

    setupEventListeners();
}

// === LOAD PROFILE ===
async function loadProfile() {
    try {
        currentProfile = await getProfile(currentUser.id);
        
        if (!currentProfile) {
            console.log('Profile not found, creating new profile...');
            // Auto-create profile if it doesn't exist
            await createInitialProfile();
            currentProfile = await getProfile(currentUser.id);
            
            if (!currentProfile) {
                showToast('Failed to create profile', true);
                return;
            }
        }

        updateDomWithProfile();
        renderStats();
        renderCharts();
        renderActivity();
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Error loading profile: ' + error.message, true);
    }
}

// === CREATE INITIAL PROFILE ===
async function createInitialProfile() {
    try {
        const username = currentUser.email.split('@')[0];
        const { data, error } = await supabase
            .from('profiles')
            .insert([{
                id: currentUser.id,
                email: currentUser.email,
                username: username,
                bio: '',
                avatar_url: null,
                best_wpm: 0,
                average_accuracy: 0,
                total_tests: 0,
                total_time: 0,
                wpm_history: [],
                acc_history: [],
                time_history: [],
                achievements: []
            }])
            .select()
            .single();
        
        if (error) throw error;
        console.log('Profile created successfully:', data);
    } catch (error) {
        console.error('Error creating profile:', error);
        throw error;
    }
}

// === UPDATE DOM WITH PROFILE DATA ===
function updateDomWithProfile() {
    // Update basic info
    document.getElementById('profileUsername').textContent = currentProfile.username || 'Anonymous User';
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileBio').textContent = currentProfile.bio || 'No bio yet';

    // Update avatar
    const avatarImage = document.getElementById('avatarImage');
    const avatarIcon = document.getElementById('avatarIcon');
    
    if (currentProfile.avatar_url) {
        avatarImage.src = currentProfile.avatar_url;
        avatarImage.style.display = 'block';
        avatarIcon.style.display = 'none';
    } else {
        avatarImage.style.display = 'none';
        avatarIcon.style.display = 'block';
    }
}

// === RENDER STATS ===
function renderStats() {
    const bestWpm = currentProfile.best_wpm || 0;
    const avgAccuracy = currentProfile.average_accuracy || 0;
    const totalTests = currentProfile.total_tests || 0;
    const totalTime = currentProfile.total_time || 0;

    document.getElementById('statBestWpm').textContent = bestWpm;
    document.getElementById('statAvgAccuracy').textContent = avgAccuracy.toFixed(1) + '%';
    document.getElementById('statTotalTests').textContent = totalTests;
    document.getElementById('statTotalTime').textContent = formatTime(totalTime);

    // Animate progress bars
    setTimeout(() => {
        document.getElementById('progressWpm').style.width = Math.min((bestWpm / 100) * 100, 100) + '%';
        document.getElementById('progressAccuracy').style.width = Math.min((avgAccuracy / 100) * 100, 100) + '%';
        document.getElementById('progressTests').style.width = Math.min((totalTests / 100) * 100, 100) + '%';
        document.getElementById('progressTime').style.width = Math.min((totalTime / 36000) * 100, 100) + '%';
    }, 100);
}

// === RENDER CHARTS ===
function renderCharts() {
    const wpmHistory = currentProfile.wpm_history || [];
    const accHistory = currentProfile.acc_history || [];

    // Prepare labels
    const labels = wpmHistory.map((_, i) => `Test ${i + 1}`);

    // WPM Chart
    const wpmCtx = document.getElementById('wpmChart').getContext('2d');
    if (wpmChart) wpmChart.destroy();
    
    wpmChart = new Chart(wpmCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'WPM',
                data: wpmHistory,
                borderColor: '#00f5ff',
                backgroundColor: 'rgba(0, 245, 255, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#00f5ff',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(10, 10, 15, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#b8b8b8',
                    borderColor: '#00f5ff',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (context) => 'WPM: ' + context.parsed.y
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(51, 52, 68, 0.3)' },
                    ticks: { color: '#b8b8b8' }
                },
                x: {
                    grid: { color: 'rgba(51, 52, 68, 0.3)' },
                    ticks: { color: '#b8b8b8', maxTicksLimit: 10 }
                }
            }
        }
    });

    // Accuracy Chart
    const accCtx = document.getElementById('accuracyChart').getContext('2d');
    if (accuracyChart) accuracyChart.destroy();
    
    accuracyChart = new Chart(accCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Accuracy',
                data: accHistory,
                borderColor: '#50fa7b',
                backgroundColor: 'rgba(80, 250, 123, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#50fa7b',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(10, 10, 15, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#b8b8b8',
                    borderColor: '#50fa7b',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (context) => 'Accuracy: ' + context.parsed.y.toFixed(1) + '%'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(51, 52, 68, 0.3)' },
                    ticks: {
                        color: '#b8b8b8',
                        callback: (value) => value + '%'
                    }
                },
                x: {
                    grid: { color: 'rgba(51, 52, 68, 0.3)' },
                    ticks: { color: '#b8b8b8', maxTicksLimit: 10 }
                }
            }
        }
    });
}

// === RENDER ACTIVITY ===
function renderActivity() {
    const wpmHistory = currentProfile.wpm_history || [];
    const accHistory = currentProfile.acc_history || [];
    const timeHistory = currentProfile.time_history || [];
    const activityList = document.getElementById('activityList');

    if (wpmHistory.length === 0) {
        activityList.innerHTML = `
            <div class="activity-empty">
                <i class="fas fa-inbox"></i>
                <p>No activity yet. Start typing to see your history!</p>
            </div>
        `;
        return;
    }

    // Get last 10 activities
    const activities = wpmHistory
        .map((wpm, i) => ({
            wpm,
            accuracy: accHistory[i] || 0,
            timestamp: timeHistory[i] || new Date().toISOString()
        }))
        .reverse()
        .slice(0, 10);

    activityList.innerHTML = activities.map((activity, index) => `
        <div class="activity-item">
            <div class="activity-info">
                <div class="activity-icon">
                    <i class="fas fa-keyboard"></i>
                </div>
                <div class="activity-details">
                    <h4>Typing Test ${wpmHistory.length - index}</h4>
                    <p>${getTimeAgo(activity.timestamp)}</p>
                </div>
            </div>
            <div class="activity-stats">
                <div class="activity-stat">
                    <div class="activity-stat-label">WPM</div>
                    <div class="activity-stat-value">${activity.wpm}</div>
                </div>
                <div class="activity-stat">
                    <div class="activity-stat-label">Accuracy</div>
                    <div class="activity-stat-value">${activity.accuracy.toFixed(1)}%</div>
                </div>
            </div>
        </div>
    `).join('');
}

// === MODAL FUNCTIONS ===
function openEditModal() {
    const modal = document.getElementById('editModal');
    const usernameInput = document.getElementById('editUsername');
    const bioInput = document.getElementById('editBio');
    const charCount = document.getElementById('bioCharCount');

    usernameInput.value = currentProfile.username || '';
    bioInput.value = currentProfile.bio || '';
    charCount.textContent = `${bioInput.value.length}/200`;

    modal.classList.add('active');
}

function closeEditModal() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('active');
    document.getElementById('modalError').style.display = 'none';
}

async function saveUsername() {
    const username = document.getElementById('editUsername').value.trim();
    const bio = document.getElementById('editBio').value.trim();
    const modalError = document.getElementById('modalError');
    const saveBtn = document.getElementById('saveProfileBtn');

    // Clear previous errors
    modalError.style.display = 'none';
    modalError.textContent = '';

    // Validation
    if (username.length < 3) {
        modalError.textContent = 'Username must be at least 3 characters';
        modalError.style.display = 'block';
        return;
    }

    if (bio.length > 200) {
        modalError.textContent = 'Bio must be 200 characters or less';
        modalError.style.display = 'block';
        return;
    }

    // Show loading
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
        await updateProfile(currentUser.id, { username, bio });
        
        currentProfile.username = username;
        currentProfile.bio = bio;

        document.getElementById('profileUsername').textContent = username;
        document.getElementById('profileBio').textContent = bio || 'No bio yet';

        closeEditModal();
        showToast('Profile updated successfully!');
        
        // Notify opener window to refresh if it exists (when opened from main app)
        if (window.opener && window.opener.quickKeysApp) {
            console.log('🔄 Notifying main window to refresh profile...');
            window.opener.quickKeysApp.refreshProfile();
        }
    } catch (error) {
        console.error('Error saving profile:', error);
        modalError.textContent = 'Failed to save profile. Please try again.';
        modalError.style.display = 'block';
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
    }
}

// === AVATAR UPLOAD ===
async function handleAvatarUpload(file) {
    if (!file) return;

    console.log('🖼️ Handling avatar upload:', file.name);

    // Validate file type
    if (!file.type.startsWith('image/')) {
        console.error('❌ Invalid file type:', file.type);
        showToast('Please select an image file (JPG, PNG, GIF)', true);
        return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        console.error('❌ File too large:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
        showToast('Image must be less than 5MB', true);
        return;
    }

    try {
        const changeBtn = document.getElementById('changeAvatarBtn');
        changeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        changeBtn.style.pointerEvents = 'none';

        console.log('📤 Starting upload to Supabase...');

        // Upload to Supabase Storage
        const avatarUrl = await uploadAvatar(currentUser.id, file);

        console.log('💾 Updating profile with new avatar URL...');

        // Update profile with new avatar URL
        await updateProfile(currentUser.id, { avatar_url: avatarUrl });
        currentProfile.avatar_url = avatarUrl;

        // Update UI
        const avatarImage = document.getElementById('avatarImage');
        const avatarIcon = document.getElementById('avatarIcon');
        
        avatarImage.src = avatarUrl;
        avatarImage.style.display = 'block';
        avatarIcon.style.display = 'none';

        console.log('✅ Avatar updated successfully!');
        showToast('Profile picture updated!');
    } catch (error) {
        console.error('❌ Error uploading avatar:', error);
        
        // Show more specific error messages
        let errorMessage = 'Failed to upload image';
        if (error.message) {
            if (error.message.includes('bucket')) {
                errorMessage = 'Storage bucket not configured. Please contact admin.';
            } else if (error.message.includes('policy')) {
                errorMessage = 'No permission to upload. Please login again.';
            } else if (error.message.includes('size')) {
                errorMessage = 'File size exceeds limit.';
            } else {
                errorMessage = `Upload failed: ${error.message}`;
            }
        }
        
        showToast(errorMessage, true);
    } finally {
        const changeBtn = document.getElementById('changeAvatarBtn');
        changeBtn.innerHTML = '<i class="fas fa-camera"></i>';
        changeBtn.style.pointerEvents = 'auto';
    }
}

// === EVENT LISTENERS ===
function setupEventListeners() {
    // Edit profile
    document.getElementById('editProfileBtn').addEventListener('click', openEditModal);
    document.getElementById('closeModalBtn').addEventListener('click', closeEditModal);
    document.getElementById('cancelBtn').addEventListener('click', closeEditModal);
    document.getElementById('saveProfileBtn').addEventListener('click', saveUsername);

    // Bio character count
    const bioInput = document.getElementById('editBio');
    bioInput.addEventListener('input', () => {
        const charCount = document.getElementById('bioCharCount');
        charCount.textContent = `${bioInput.value.length}/200`;
    });

    // Avatar upload
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const avatarInput = document.getElementById('avatarInput');
    
    changeAvatarBtn.addEventListener('click', () => avatarInput.click());
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleAvatarUpload(file);
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });

    // Close modal on outside click
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') closeEditModal();
    });
}

// === UTILITY FUNCTIONS ===
function showLoading() {
    document.getElementById('loadingScreen').style.display = 'flex';
    document.getElementById('profileContainer').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loadingScreen').style.display = 'none';
    document.getElementById('profileContainer').style.display = 'block';
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    
    if (isError) {
        toast.classList.add('error');
        toast.querySelector('i').className = 'fas fa-exclamation-circle';
    } else {
        toast.classList.remove('error');
        toast.querySelector('i').className = 'fas fa-check-circle';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
}

// === INITIALIZE ON LOAD ===
document.addEventListener('DOMContentLoaded', init);
