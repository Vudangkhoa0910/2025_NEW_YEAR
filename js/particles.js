/* ============================================
   PARTICLE ANIMATION SYSTEM
   ============================================ */

class ParticleSystem {
    constructor() {
        this.container = document.getElementById('particles');
        this.particles = [];
        this.maxParticles = 30;
        this.init();
    }

    init() {
        // Create initial particles
        for (let i = 0; i < this.maxParticles; i++) {
            setTimeout(() => this.createParticle(), i * 200);
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 8 + 4;
        const startX = Math.random() * 100;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;
        
        // Random type (star, circle, sparkle)
        const types = ['✦', '✧', '⭐', '✨', '💫', '🌟'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        particle.innerHTML = type;
        particle.style.cssText = `
            position: absolute;
            left: ${startX}%;
            top: -20px;
            font-size: ${size}px;
            opacity: ${Math.random() * 0.5 + 0.3};
            animation: particleFall ${duration}s linear ${delay}s infinite;
            filter: drop-shadow(0 0 ${size/2}px rgba(255, 215, 0, 0.5));
        `;
        
        this.container.appendChild(particle);
        this.particles.push(particle);
        
        // Remove old particles if too many
        if (this.particles.length > this.maxParticles * 2) {
            const oldParticle = this.particles.shift();
            if (oldParticle && oldParticle.parentNode) {
                oldParticle.parentNode.removeChild(oldParticle);
            }
        }
    }
}

// Add particle animation CSS
const particleStyles = document.createElement('style');
particleStyles.textContent = `
    @keyframes particleFall {
        0% {
            transform: translateY(0) rotate(0deg) translateX(0);
            opacity: 0;
        }
        10% {
            opacity: 0.8;
        }
        90% {
            opacity: 0.8;
        }
        100% {
            transform: translateY(100vh) rotate(360deg) translateX(50px);
            opacity: 0;
        }
    }
    
    .particle {
        pointer-events: none;
        z-index: 1;
    }
`;
document.head.appendChild(particleStyles);

// Initialize particle system
document.addEventListener('DOMContentLoaded', () => {
    new ParticleSystem();
});
