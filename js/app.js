/* ============================================
   MAIN APPLICATION LOGIC - INDEX PAGE
   ============================================ */

// Storage keys
const STORAGE_KEY = 'lixi2026_links';

// Generate unique ID
function generateUniqueId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${randomPart}`;
}

// Base64 encode/decode for URL safe data
function encodeData(data) {
    try {
        const jsonString = JSON.stringify(data);
        return btoa(unescape(encodeURIComponent(jsonString)));
    } catch (e) {
        console.error('Encode error:', e);
        return null;
    }
}

function decodeData(encoded) {
    try {
        const jsonString = decodeURIComponent(escape(atob(encoded)));
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('Decode error:', e);
        return null;
    }
}

// Get stored links
function getStoredLinks() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch (e) {
        return {};
    }
}

// Save link data
function saveLink(id, data) {
    const links = getStoredLinks();
    links[id] = {
        ...data,
        createdAt: Date.now(),
        used: false
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

// Create link button handler
document.getElementById('createLink')?.addEventListener('click', function() {
    const senderName = document.getElementById('senderName').value.trim() || 'Người gửi';
    const receiverName = document.getElementById('receiverName').value.trim() || 'Bạn';
    const message = document.getElementById('message').value.trim();
    
    // Generate unique link ID
    const linkId = generateUniqueId();
    
    // Create data object
    const linkData = {
        id: linkId,
        sender: senderName,
        receiver: receiverName,
        message: message
    };
    
    // Save to localStorage (for tracking used links)
    saveLink(linkId, linkData);
    
    // Create the URL with encoded data
    const encodedData = encodeData(linkData);
    const baseUrl = window.location.href.replace('index.html', '').replace(/\/$/, '');
    const fullUrl = `${baseUrl}/wheel.html?data=${encodedData}`;
    
    // Show result
    const resultDiv = document.getElementById('linkResult');
    const linkInput = document.getElementById('generatedLink');
    
    linkInput.value = fullUrl;
    resultDiv.style.display = 'block';
    
    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Animation
    resultDiv.style.animation = 'none';
    setTimeout(() => {
        resultDiv.style.animation = 'fadeIn 0.5s ease';
    }, 10);
});

// Copy link button
document.getElementById('copyLink')?.addEventListener('click', function() {
    const linkInput = document.getElementById('generatedLink');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(linkInput.value).then(() => {
        showToast('Đã sao chép link!');
    }).catch(() => {
        // Fallback
        document.execCommand('copy');
        showToast('Đã sao chép link!');
    });
});

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    toastMessage.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Share functions
function shareToFacebook() {
    const link = document.getElementById('generatedLink').value;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent('🧧 Tôi gửi cho bạn một Lì Xì May Mắn năm 2026! Hãy mở để xem bạn nhận được bao nhiêu! 🎊')}`;
    window.open(url, '_blank', 'width=600,height=400');
}

function shareToZalo() {
    const link = document.getElementById('generatedLink').value;
    const text = encodeURIComponent(`🧧 Tôi gửi cho bạn một Lì Xì May Mắn năm 2026! Hãy mở để xem bạn nhận được bao nhiêu! 🎊\n\n${link}`);
    window.open(`https://zalo.me/share?text=${text}`, '_blank');
}

function shareToMessenger() {
    const link = document.getElementById('generatedLink').value;
    const url = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(link)}&app_id=140586622674265&redirect_uri=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=400');
}

// Make functions global
window.shareToFacebook = shareToFacebook;
window.shareToZalo = shareToZalo;
window.shareToMessenger = shareToMessenger;

// Input animations
document.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});

// Add focused style
const focusStyle = document.createElement('style');
focusStyle.textContent = `
    .input-group.focused label {
        color: var(--gold);
        text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    }
`;
document.head.appendChild(focusStyle);
