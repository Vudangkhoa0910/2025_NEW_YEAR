/* ============================================
   WHEEL SPIN LOGIC
   ============================================ */

// API Base URL
const API_BASE = '/.netlify/functions/api';

// Prize segments
const PRIZES = [
    { value: 22000, label: '22K', color: '#FF6B6B' },
    { value: 55000, label: '55K', color: '#4ECDC4' },
    { value: 66000, label: '66K', color: '#45B7D1' },
    { value: 77000, label: '77K', color: '#96CEB4' },
    { value: 88000, label: '88K', color: '#FFEAA7' },
    { value: 99000, label: '99K', color: '#DDA0DD' },
    { value: 111000, label: '111K', color: '#FFD700' },
    { value: 138000, label: '138K', color: '#FF8A65' },
    { value: 168000, label: '168K', color: '#E91E63' },
    { value: 186000, label: '186K', color: '#9C27B0' },
    { value: 196000, label: '196K', color: '#00BCD4' }
];

const STORAGE_KEY = 'lixi2026_links';

// Store current prize globally
window.currentPrize = null;
window.qrBase64 = null;

// Decode data from URL
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

// Mark link as used (both locally and on server)
async function markLinkAsUsed(id) {
    // Local storage
    const links = getStoredLinks();
    if (links[id]) {
        links[id].used = true;
        links[id].usedAt = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    }
    
    // Server
    try {
        await fetch(`${API_BASE}/mark-used`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ linkId: id })
        });
    } catch (e) {
        console.log('Could not mark as used on server');
    }
}

// Check if link is used
async function isLinkUsed(id) {
    // Check local first
    const links = getStoredLinks();
    if (links[id]?.used === true) {
        return true;
    }
    
    // Check server
    try {
        const response = await fetch(`${API_BASE}/check-used/${encodeURIComponent(id)}`);
        const data = await response.json();
        return data.used === true;
    } catch (e) {
        return false;
    }
}

// Wheel class
class LuckyWheel {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.segments = PRIZES;
        this.currentRotation = 0;
        this.isSpinning = false;
        this.spinButton = document.getElementById('spinButton');
        
        this.init();
    }

    init() {
        this.draw();
        this.setupEvents();
    }

    draw() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.currentRotation);
        ctx.translate(-centerX, -centerY);
        
        const segmentAngle = (2 * Math.PI) / this.segments.length;
        
        this.segments.forEach((segment, i) => {
            const startAngle = i * segmentAngle - Math.PI / 2;
            const endAngle = startAngle + segmentAngle;
            
            // Draw segment
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            
            // Gradient fill
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, this.lightenColor(segment.color, 30));
            gradient.addColorStop(0.7, segment.color);
            gradient.addColorStop(1, this.darkenColor(segment.color, 20));
            
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Segment border
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + segmentAngle / 2);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px "Noto Sans", sans-serif';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.fillText(segment.label, radius - 25, 0);
            ctx.restore();
            
            // Draw icon at edge
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + segmentAngle / 2);
            ctx.font = '16px Arial';
            ctx.fillText('🧧', radius - 75, 0);
            ctx.restore();
        });
        
        ctx.restore();
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 +
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }

    setupEvents() {
        this.spinButton.addEventListener('click', () => this.spin());
    }

    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.spinButton.classList.add('spinning');
        
        // Determine winning segment (random)
        const winningIndex = Math.floor(Math.random() * this.segments.length);
        const segmentAngle = (2 * Math.PI) / this.segments.length;
        
        // Calculate final rotation
        // Pointer is at top (12 o'clock = -90 degrees = -PI/2)
        // We need the center of the winning segment to align with the pointer
        const spins = 5 + Math.random() * 3; // 5-8 full spins
        
        // Calculate the angle to rotate so winning segment aligns with pointer at top
        // Start angle of segment i is: i * segmentAngle - PI/2
        // Center of segment is: startAngle + segmentAngle/2
        // We want the center of winningIndex segment to be at the top (0 degrees after rotation)
        const segmentCenter = winningIndex * segmentAngle + segmentAngle / 2;
        const targetAngle = (spins * 2 * Math.PI) + (2 * Math.PI - segmentCenter);
        
        // Store winning index for later
        this.winningIndex = winningIndex;
        
        // Animate
        const startRotation = this.currentRotation % (2 * Math.PI);
        const duration = 5000 + Math.random() * 2000; // 5-7 seconds
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease out cubic)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            this.currentRotation = startRotation + (targetAngle * easeOut);
            this.draw();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.isSpinning = false;
                this.spinButton.classList.remove('spinning');
                
                // Get the actual segment at pointer position
                const finalRotation = this.currentRotation % (2 * Math.PI);
                const pointerAngle = (2 * Math.PI - finalRotation) % (2 * Math.PI);
                const actualIndex = Math.floor(pointerAngle / segmentAngle) % this.segments.length;
                
                this.onSpinComplete(this.segments[actualIndex]);
            }
        };
        
        requestAnimationFrame(animate);
    }

    onSpinComplete(prize) {
        // Mark link as used (skip in demo mode)
        if (window.linkData?.id && !window.isDemoMode) {
            markLinkAsUsed(window.linkData.id);
        }
        
        // Show confetti
        if (window.confetti) {
            window.confetti.celebrate();
        }
        
        // Wait a moment then show result
        setTimeout(() => {
            showResult(prize);
        }, 1000);
    }
}

// Show result screen
function showResult(prize) {
    const wheelScreen = document.getElementById('wheelScreen');
    const resultScreen = document.getElementById('resultScreen');
    
    // Store prize globally for later use
    window.currentPrize = prize;
    
    // Update result content
    document.getElementById('prizeAmount').textContent = prize.label;
    document.getElementById('prizeValue').textContent = prize.value.toLocaleString('vi-VN');
    document.getElementById('receiverResult').textContent = window.linkData?.receiver || 'Bạn';
    document.getElementById('senderResult').textContent = window.linkData?.sender || 'Người gửi';
    
    // Show/hide QR upload section based on demo mode
    const qrSection = document.getElementById('qrUploadSection');
    if (qrSection) {
        qrSection.style.display = window.isDemoMode ? 'none' : 'block';
    }
    
    // Setup QR upload handlers
    setupQRUpload();
    
    // Hide wheel, show result
    wheelScreen.style.display = 'none';
    resultScreen.style.display = 'block';
    
    // Continue confetti
    setTimeout(() => {
        if (window.confetti) {
            window.confetti.launch(40);
        }
    }, 500);
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');
    const isDemo = urlParams.get('demo') === 'true';
    
    // Demo mode - for testing locally OR when no data provided
    if (!encodedData || isDemo) {
        const demoData = {
            id: 'demo-' + Date.now(),
            sender: 'Người Gửi Lì Xì',
            receiver: 'Bạn',
            message: '🎊 Chúc Mừng Năm Mới 2026! Chúc bạn An Khang Thịnh Vượng! 🐴'
        };
        window.linkData = demoData;
        window.isDemoMode = true;
        
        document.getElementById('receiverDisplay').textContent = demoData.receiver;
        document.getElementById('senderDisplay').textContent = demoData.sender;
        
        const messageDiv = document.getElementById('customMessage');
        messageDiv.textContent = `"${demoData.message}"`;
        messageDiv.classList.add('show');
        
        showScreen('welcomeScreen');
        setupEnvelopeButton();
        return;
    }
    
    // Decode the data
    const linkData = decodeData(encodedData);
    
    if (!linkData || !linkData.id) {
        // Fallback to demo mode if decode fails
        window.linkData = {
            id: 'demo-' + Date.now(),
            sender: 'Người Gửi Lì Xì',
            receiver: 'Bạn',
            message: '🎊 Chúc Mừng Năm Mới 2026!'
        };
        window.isDemoMode = true;
        
        document.getElementById('receiverDisplay').textContent = 'Bạn';
        document.getElementById('senderDisplay').textContent = 'Người Gửi Lì Xì';
        
        showScreen('welcomeScreen');
        setupEnvelopeButton();
        return;
    }
    
    // Store link data globally
    window.linkData = linkData;
    
    // Check if link is already used (async)
    checkAndShowScreen(linkData);
});

// Async check and show appropriate screen
async function checkAndShowScreen(linkData) {
    const used = await isLinkUsed(linkData.id);
    
    if (used) {
        showScreen('usedScreen');
        return;
    }
    
    // Show welcome screen with personalized info
    document.getElementById('receiverDisplay').textContent = linkData.receiver || 'Bạn';
    document.getElementById('senderDisplay').textContent = linkData.sender || 'Người gửi';
    
    if (linkData.message) {
        const messageDiv = document.getElementById('customMessage');
        messageDiv.textContent = `"${linkData.message}"`;
        messageDiv.classList.add('show');
    }
    
    showScreen('welcomeScreen');
    setupEnvelopeButton();
}

// Setup envelope button
function setupEnvelopeButton() {
    document.getElementById('openEnvelope').addEventListener('click', () => {
        // Animate envelope
        const envelope = document.getElementById('redEnvelope');
        envelope.style.animation = 'envelopeOpen 0.8s ease forwards';
        
        // Show wheel after animation
        setTimeout(() => {
            showScreen('wheelScreen');
            
            // Initialize wheel
            window.wheel = new LuckyWheel('wheelCanvas');
        }, 800);
    });
}

// Show specific screen
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.style.display = 'none';
    });
    document.getElementById(screenId).style.display = 'block';
}

// Setup QR Upload handlers
function setupQRUpload() {
    const uploadBox = document.getElementById('qrUploadBox');
    const fileInput = document.getElementById('qrFileInput');
    
    if (!uploadBox || !fileInput) return;
    
    // Click to upload
    uploadBox.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File selected
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    // Drag and drop
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('dragover');
    });
    
    uploadBox.addEventListener('dragleave', () => {
        uploadBox.classList.remove('dragover');
    });
    
    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
}

// Handle file upload
function handleFileUpload(file) {
    if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        window.qrBase64 = e.target.result;
        
        // Show preview
        document.getElementById('uploadPlaceholder').style.display = 'none';
        document.getElementById('uploadPreview').style.display = 'block';
        document.getElementById('qrPreviewImg').src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Remove QR
function removeQR() {
    window.qrBase64 = null;
    document.getElementById('uploadPlaceholder').style.display = 'block';
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('qrFileInput').value = '';
}

// Submit bank info
async function submitBankInfo() {
    const bankName = document.getElementById('bankName').value.trim();
    const accountName = document.getElementById('accountName').value.trim();
    const accountNumber = document.getElementById('accountNumber').value.trim();
    
    if (!bankName || !accountName || !accountNumber) {
        alert('Vui lòng điền đầy đủ thông tin ngân hàng!');
        return;
    }
    
    const submitBtn = document.getElementById('submitQR');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Đang gửi...</span>';
    
    try {
        const response = await fetch(`${API_BASE}/save-result`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                linkId: window.linkData?.id,
                sender: window.linkData?.sender,
                receiver: window.linkData?.receiver,
                prize: window.currentPrize?.label,
                prizeValue: window.currentPrize?.value,
                qrCode: window.qrBase64 || null,
                bankInfo: {
                    bankName: bankName,
                    accountName: accountName,
                    accountNumber: accountNumber
                }
            })
        });
        
        if (response.ok) {
            // Show success
            document.getElementById('qrUploadSection').style.display = 'none';
            document.getElementById('submitSuccess').style.display = 'block';
            
            // More confetti!
            if (window.confetti) {
                window.confetti.celebrate();
            }
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        console.error('Submit error:', error);
        alert('Có lỗi xảy ra! Vui lòng thử lại.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Gửi Thông Tin Nhận Tiền</span>';
    }
}

// Make functions global
window.removeQR = removeQR;
window.submitBankInfo = submitBankInfo;

// Add envelope open animation
const envelopeStyle = document.createElement('style');
envelopeStyle.textContent = `
    @keyframes envelopeOpen {
        0% {
            transform: scale(1) rotateY(0);
        }
        50% {
            transform: scale(1.2) rotateY(90deg);
        }
        100% {
            transform: scale(0) rotateY(180deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(envelopeStyle);
