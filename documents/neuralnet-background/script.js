const canvas = document.getElementById('neural-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
const particleCount = 80;
const connectionDistance = 150;
const rotationSpeed = 0.001; // Radians per frame
let globalAngle = 0;

// Resize handling
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

// Particle Class
class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 3 + 2;
        // Cyber-heart colors: pinks, purples, cyans
        const colors = ['#ff4081', '#00e5ff', '#e040fb'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges (conceptually, but we'll wrap for smoother flow)
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }

    draw(context) {
        context.save();
        context.translate(this.x, this.y);
        // No rotation for individual hearts for now, they stay upright
        
        context.fillStyle = this.color;
        context.beginPath();
        
        // Heart shape logic
        // Scale down because the math produces a large heart
        const scale = this.size / 100; 
        context.scale(scale, scale);
        
        // Heart path
        // Top left curve
        context.moveTo(0, -30);
        context.bezierCurveTo(-30, -70, -80, -30, 0, 40);
        context.bezierCurveTo(80, -30, 30, -70, 0, -30);
        
        context.fill();
        context.restore();
    }
}

function init() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i];
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDistance) {
                const opacity = 1 - dist / connectionDistance;
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.2})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    // Clear with trail effect? Or just clear?
    // Let's just clear for now for crisp lines
    ctx.clearRect(0, 0, width, height);

    // Global Rotation logic
    // To rotate the whole scene, we can translate to center, rotate, translate back
    // But wait, if we rotate the canvas, the particles moving in x/y will look weird if they wrap.
    // Better approach: Rotate the *rendering* context, but keep simulation in standard x/y?
    // Or rotate the simulation coordinates?
    // Let's try rotating the canvas context around the center.
    
    ctx.save();
    ctx.translate(width / 2, height / 2);
    globalAngle += rotationSpeed;
    ctx.rotate(globalAngle);
    ctx.translate(-width / 2, -height / 2);

    // Draw connections first so they are behind nodes
    drawConnections();

    // Update and draw particles
    particles.forEach(p => {
        p.update();
        p.draw(ctx);
    });

    ctx.restore();

    requestAnimationFrame(animate);
}

init();
animate();
