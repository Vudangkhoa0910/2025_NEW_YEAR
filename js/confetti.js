/* ============================================
   CONFETTI CELEBRATION EFFECT
   ============================================ */

class ConfettiSystem {
    constructor() {
        this.container = document.getElementById('confetti');
        this.colors = [
            '#FFD700', // Gold
            '#FF6B6B', // Red
            '#FF8E53', // Orange
            '#FFE66D', // Yellow
            '#4ECDC4', // Teal
            '#95E1D3', // Mint
            '#F38181', // Coral
            '#AA96DA', // Purple
            '#FCBAD3', // Pink
            '#FF0000', // Bright Red
            '#FFA500', // Orange
        ];
        this.shapes = ['square', 'circle', 'triangle', 'star'];
    }

    launch(intensity = 100) {
        for (let i = 0; i < intensity; i++) {
            setTimeout(() => this.createPiece(), i * 30);
        }
    }

    createPiece() {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
        const size = Math.random() * 10 + 8;
        const startX = Math.random() * 100;
        const duration = Math.random() * 2 + 2;
        const rotation = Math.random() * 720;
        
        let shapeStyle = '';
        switch(shape) {
            case 'square':
                shapeStyle = `
                    width: ${size}px;
                    height: ${size}px;
                    background: ${color};
                `;
                break;
            case 'circle':
                shapeStyle = `
                    width: ${size}px;
                    height: ${size}px;
                    background: ${color};
                    border-radius: 50%;
                `;
                break;
            case 'triangle':
                shapeStyle = `
                    width: 0;
                    height: 0;
                    border-left: ${size/2}px solid transparent;
                    border-right: ${size/2}px solid transparent;
                    border-bottom: ${size}px solid ${color};
                    background: transparent;
                `;
                break;
            case 'star':
                piece.innerHTML = '⭐';
                shapeStyle = `
                    font-size: ${size}px;
                    background: transparent;
                    filter: drop-shadow(0 0 3px ${color});
                `;
                break;
        }
        
        piece.style.cssText = `
            position: absolute;
            left: ${startX}%;
            top: -20px;
            ${shapeStyle}
            animation-duration: ${duration}s;
            transform: rotate(${rotation}deg);
            box-shadow: 0 0 5px ${color};
        `;
        
        this.container.appendChild(piece);
        
        // Remove after animation
        setTimeout(() => {
            if (piece.parentNode) {
                piece.parentNode.removeChild(piece);
            }
        }, duration * 1000);
    }

    celebrate() {
        // Multiple bursts
        this.launch(80);
        setTimeout(() => this.launch(60), 500);
        setTimeout(() => this.launch(40), 1000);
        setTimeout(() => this.launch(30), 1500);
    }
}

// Create global instance
window.confetti = new ConfettiSystem();
