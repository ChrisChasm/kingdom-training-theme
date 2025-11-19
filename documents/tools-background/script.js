// Gear and App Icon SVG definitions
const gearSVGs = {
    standard: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Standard gear with 8 teeth -->
            <circle cx="50" cy="50" r="20" fill="currentColor" />
            <circle cx="50" cy="50" r="8" fill="#0f172a" />
            <!-- Teeth -->
            <rect x="47" y="15" width="6" height="12" rx="2" fill="currentColor" />
            <rect x="73" y="32" width="12" height="6" rx="2" fill="currentColor" transform="rotate(45 50 50)" />
            <rect x="73" y="47" width="12" height="6" rx="2" fill="currentColor" />
            <rect x="73" y="62" width="12" height="6" rx="2" fill="currentColor" transform="rotate(-45 50 50)" />
            <rect x="47" y="73" width="6" height="12" rx="2" fill="currentColor" />
            <rect x="15" y="62" width="12" height="6" rx="2" fill="currentColor" transform="rotate(45 50 50)" />
            <rect x="15" y="47" width="12" height="6" rx="2" fill="currentColor" />
            <rect x="15" y="32" width="12" height="6" rx="2" fill="currentColor" transform="rotate(-45 50 50)" />
            <!-- Highlight -->
            <circle cx="45" cy="45" r="5" fill="white" opacity="0.2" />
        </svg>
    `,
    industrial: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Industrial gear with thick teeth -->
            <circle cx="50" cy="50" r="22" fill="currentColor" />
            <circle cx="50" cy="50" r="10" fill="#0f172a" />
            <!-- 6 thick teeth -->
            <path d="M45 15 L45 28 L55 28 L55 15 Z" fill="currentColor" />
            <path d="M72 28 L63 37 L68 47 L80 42 Z" fill="currentColor" />
            <path d="M80 58 L68 53 L63 63 L72 72 Z" fill="currentColor" />
            <path d="M55 85 L55 72 L45 72 L45 85 Z" fill="currentColor" />
            <path d="M28 72 L37 63 L32 53 L20 58 Z" fill="currentColor" />
            <path d="M20 42 L32 47 L37 37 L28 28 Z" fill="currentColor" />
            <!-- Inner detail -->
            <circle cx="50" cy="50" r="15" fill="currentColor" opacity="0.5" />
            <!-- Bolts -->
            <circle cx="50" cy="38" r="2" fill="#0f172a" opacity="0.6" />
            <circle cx="59" cy="50" r="2" fill="#0f172a" opacity="0.6" />
            <circle cx="50" cy="62" r="2" fill="#0f172a" opacity="0.6" />
            <circle cx="41" cy="50" r="2" fill="#0f172a" opacity="0.6" />
        </svg>
    `,
    small: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Small cog with many teeth -->
            <circle cx="50" cy="50" r="18" fill="currentColor" />
            <circle cx="50" cy="50" r="7" fill="#0f172a" />
            <!-- 12 small teeth around edge -->
            <g>
                <rect x="48.5" y="20" width="3" height="10" rx="1" fill="currentColor" transform="rotate(0 50 50)" />
                <rect x="48.5" y="20" width="3" height="10" rx="1" fill="currentColor" transform="rotate(30 50 50)" />
                <rect x="48.5" y="20" width="3" height="10" rx="1" fill="currentColor" transform="rotate(60 50 50)" />
                <rect x="48.5" y="20" width="3" height="10" rx="1" fill="currentColor" transform="rotate(90 50 50)" />
                <rect x="48.5" y="20" width="3" height="10" rx="1" fill="currentColor" transform="rotate(120 50 50)" />
                <rect x="48.5" y="20" width="3" height="10" rx="1" fill="currentColor" transform="rotate(150 50 50)" />
                <rect x="48.5" y="20" width="3" height="10" rx="1" fill="currentColor" transform="rotate(180 50 50)" />
                <rect x="48.5" y="20" width="3" height="10" rx="1" fill="currentColor" transform="rotate(210 50 50)" />
                <rect x="48.5" y="20" width="3" height="10" rx="1" fill="currentColor" transform="rotate(240 50 50)" />
                <rect x="48.5" y="20" width="3" height="10" rx="1" fill="currentColor" transform="rotate(270 50 50)" />
                <rect x="48.5" y="20" width="3" height="10" rx="1" fill="currentColor" transform="rotate(300 50 50)" />
                <rect x="48.5" y="20" width="3" height="10" rx="1" fill="currentColor" transform="rotate(330 50 50)" />
            </g>
        </svg>
    `,
    large: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Large gear wheel -->
            <circle cx="50" cy="50" r="25" fill="currentColor" />
            <circle cx="50" cy="50" r="12" fill="#0f172a" />
            <!-- 10 teeth -->
            <g>
                <rect x="47" y="10" width="6" height="13" rx="2" fill="currentColor" transform="rotate(0 50 50)" />
                <rect x="47" y="10" width="6" height="13" rx="2" fill="currentColor" transform="rotate(36 50 50)" />
                <rect x="47" y="10" width="6" height="13" rx="2" fill="currentColor" transform="rotate(72 50 50)" />
                <rect x="47" y="10" width="6" height="13" rx="2" fill="currentColor" transform="rotate(108 50 50)" />
                <rect x="47" y="10" width="6" height="13" rx="2" fill="currentColor" transform="rotate(144 50 50)" />
                <rect x="47" y="10" width="6" height="13" rx="2" fill="currentColor" transform="rotate(180 50 50)" />
                <rect x="47" y="10" width="6" height="13" rx="2" fill="currentColor" transform="rotate(216 50 50)" />
                <rect x="47" y="10" width="6" height="13" rx="2" fill="currentColor" transform="rotate(252 50 50)" />
                <rect x="47" y="10" width="6" height="13" rx="2" fill="currentColor" transform="rotate(288 50 50)" />
                <rect x="47" y="10" width="6" height="13" rx="2" fill="currentColor" transform="rotate(324 50 50)" />
            </g>
            <!-- Spokes -->
            <line x1="50" y1="38" x2="50" y2="25" stroke="currentColor" stroke-width="3" opacity="0.6" />
            <line x1="62" y1="50" x2="75" y2="50" stroke="currentColor" stroke-width="3" opacity="0.6" />
            <line x1="50" y1="62" x2="50" y2="75" stroke="currentColor" stroke-width="3" opacity="0.6" />
            <line x1="38" y1="50" x2="25" y2="50" stroke="currentColor" stroke-width="3" opacity="0.6" />
        </svg>
    `,
    sprocket: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Sprocket/chain gear -->
            <circle cx="50" cy="50" r="23" fill="currentColor" />
            <circle cx="50" cy="50" r="16" fill="#0f172a" />
            <!-- Sprocket teeth (pointed) -->
            <g>
                <path d="M50 18 L54 27 L46 27 Z" fill="currentColor" transform="rotate(0 50 50)" />
                <path d="M50 18 L54 27 L46 27 Z" fill="currentColor" transform="rotate(45 50 50)" />
                <path d="M50 18 L54 27 L46 27 Z" fill="currentColor" transform="rotate(90 50 50)" />
                <path d="M50 18 L54 27 L46 27 Z" fill="currentColor" transform="rotate(135 50 50)" />
                <path d="M50 18 L54 27 L46 27 Z" fill="currentColor" transform="rotate(180 50 50)" />
                <path d="M50 18 L54 27 L46 27 Z" fill="currentColor" transform="rotate(225 50 50)" />
                <path d="M50 18 L54 27 L46 27 Z" fill="currentColor" transform="rotate(270 50 50)" />
                <path d="M50 18 L54 27 L46 27 Z" fill="currentColor" transform="rotate(315 50 50)" />
            </g>
            <!-- Inner holes -->
            <circle cx="50" cy="35" r="2.5" fill="#0f172a" />
            <circle cx="65" cy="50" r="2.5" fill="#0f172a" />
            <circle cx="50" cy="65" r="2.5" fill="#0f172a" />
            <circle cx="35" cy="50" r="2.5" fill="#0f172a" />
            <!-- Highlight -->
            <circle cx="46" cy="46" r="4" fill="white" opacity="0.25" />
        </svg>
    `
};

const appIconSVGs = {
    settings: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Rounded square app background -->
            <rect x="15" y="15" width="70" height="70" rx="16" fill="currentColor" opacity="0.95" />
            <!-- Settings gear icon -->
            <circle cx="50" cy="50" r="14" fill="#0f172a" opacity="0.9" />
            <circle cx="50" cy="50" r="6" fill="#0f172a" />
            <!-- 8 settings teeth -->
            <rect x="47.5" y="24" width="5" height="10" rx="2" fill="#0f172a" opacity="0.9" />
            <rect x="66" y="36" width="10" height="5" rx="2" fill="#0f172a" opacity="0.9" transform="rotate(45 50 50)" />
            <rect x="66" y="47.5" width="10" height="5" rx="2" fill="#0f172a" opacity="0.9" />
            <rect x="66" y="59" width="10" height="5" rx="2" fill="#0f172a" opacity="0.9" transform="rotate(-45 50 50)" />
            <rect x="47.5" y="66" width="5" height="10" rx="2" fill="#0f172a" opacity="0.9" />
            <rect x="24" y="59" width="10" height="5" rx="2" fill="#0f172a" opacity="0.9" transform="rotate(45 50 50)" />
            <rect x="24" y="47.5" width="10" height="5" rx="2" fill="#0f172a" opacity="0.9" />
            <rect x="24" y="36" width="10" height="5" rx="2" fill="#0f172a" opacity="0.9" transform="rotate(-45 50 50)" />
            <!-- Highlight shine -->
            <circle cx="42" cy="42" r="6" fill="white" opacity="0.15" />
        </svg>
    `,
    tools: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Rounded square app background -->
            <rect x="15" y="15" width="70" height="70" rx="16" fill="currentColor" opacity="0.95" />
            <!-- Wrench icon -->
            <path d="M35 55 L45 45 L42 42 L40 40 Q38 35 40 32 Q43 29 48 29 L45 32 L45 37 L50 37 L53 34 Q53 39 56 42 Q59 45 64 45 Q67 45 68 43 L62 37 L55 44 L45 54 L35 64 Q32 67 29 64 Q26 61 29 58 Z" fill="#0f172a" opacity="0.9" />
            <!-- Screwdriver icon -->
            <rect x="57" y="32" width="4" height="20" rx="2" fill="#0f172a" opacity="0.9" transform="rotate(45 59 42)" />
            <ellipse cx="65" cy="34" rx="3" ry="4" fill="#0f172a" opacity="0.9" transform="rotate(45 65 34)" />
            <!-- Highlight -->
            <circle cx="42" cy="42" r="6" fill="white" opacity="0.15" />
        </svg>
    `,
    dashboard: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Rounded square app background -->
            <rect x="15" y="15" width="70" height="70" rx="16" fill="currentColor" opacity="0.95" />
            <!-- Dashboard grid -->
            <rect x="28" y="28" width="18" height="18" rx="3" fill="#0f172a" opacity="0.8" />
            <rect x="54" y="28" width="18" height="18" rx="3" fill="#0f172a" opacity="0.8" />
            <rect x="28" y="54" width="18" height="18" rx="3" fill="#0f172a" opacity="0.8" />
            <rect x="54" y="54" width="18" height="18" rx="3" fill="#0f172a" opacity="0.8" />
            <!-- Mini icons in tiles -->
            <circle cx="37" cy="37" r="4" fill="currentColor" opacity="0.4" />
            <rect x="59" y="33" width="8" height="8" rx="1" fill="currentColor" opacity="0.4" />
            <path d="M32 63 L37 58 L42 63" stroke="currentColor" stroke-width="2" fill="none" opacity="0.4" />
            <rect x="59" y="59" width="8" height="8" rx="1" fill="currentColor" opacity="0.4" />
            <!-- Highlight -->
            <circle cx="42" cy="42" r="6" fill="white" opacity="0.12" />
        </svg>
    `,
    widget: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Rounded square app background -->
            <rect x="15" y="15" width="70" height="70" rx="16" fill="currentColor" opacity="0.95" />
            <!-- Widget puzzle piece shape -->
            <path d="M30 35 L40 35 Q40 30 45 30 Q50 30 50 35 L60 35 Q65 35 65 40 L65 50 Q70 50 70 55 Q70 60 65 60 L65 65 Q65 70 60 70 L40 70 Q35 70 35 65 L35 40 Q35 35 30 35 Z" 
                  fill="#0f172a" opacity="0.9" />
            <!-- Inner details -->
            <circle cx="47" cy="52" r="6" fill="currentColor" opacity="0.4" />
            <rect x="42" y="42" width="10" height="3" rx="1" fill="currentColor" opacity="0.3" />
            <rect x="42" y="57" width="10" height="3" rx="1" fill="currentColor" opacity="0.3" />
            <!-- Highlight -->
            <circle cx="40" cy="40" r="6" fill="white" opacity="0.15" />
        </svg>
    `,
    menu: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <!-- Rounded square app background -->
            <rect x="15" y="15" width="70" height="70" rx="16" fill="currentColor" opacity="0.95" />
            <!-- Hamburger menu icon with dots -->
            <circle cx="35" cy="38" r="3" fill="#0f172a" opacity="0.9" />
            <rect x="43" y="35" width="25" height="6" rx="3" fill="#0f172a" opacity="0.9" />
            <circle cx="35" cy="50" r="3" fill="#0f172a" opacity="0.9" />
            <rect x="43" y="47" width="25" height="6" rx="3" fill="#0f172a" opacity="0.9" />
            <circle cx="35" cy="62" r="3" fill="#0f172a" opacity="0.9" />
            <rect x="43" y="59" width="25" height="6" rx="3" fill="#0f172a" opacity="0.9" />
            <!-- Highlight -->
            <circle cx="42" cy="42" r="6" fill="white" opacity="0.12" />
        </svg>
    `
};

const container = document.getElementById('items-container');
const items = [];
const itemCount = 18;

// Gear and app icon types
const gearTypes = ['standard', 'industrial', 'small', 'large', 'sprocket'];
const appIconTypes = ['settings', 'tools', 'dashboard', 'widget', 'menu'];

class ToolItem {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'tool-item';
        
        // Random starting position
        this.x = Math.random() * (window.innerWidth - 400);
        this.y = Math.random() * (window.innerHeight - 400);
        
        // Random velocity (slower for smoother feel)
        this.vx = (Math.random() - 0.5) * 1.2;
        this.vy = (Math.random() - 0.5) * 1.2;
        
        // Random delay for animation
        this.delay = Math.random() * 5;
        
        // Start as gear or app icon (50/50 chance)
        this.isAppIcon = Math.random() > 0.5;
        this.transformationTimer = 0;
        this.transformationDuration = 5000 + Math.random() * 5000; // 5-10 seconds
        
        // Random gear/app icon type
        this.gearType = gearTypes[Math.floor(Math.random() * gearTypes.length)];
        this.appIconType = appIconTypes[Math.floor(Math.random() * appIconTypes.length)];
        
        // Random animation style
        const animationStyles = ['rotating', 'floating', 'transforming'];
        this.animationStyle = animationStyles[Math.floor(Math.random() * animationStyles.length)];
        
        // Random size variation
        this.scale = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
        
        this.updateVisual();
        this.updatePosition();
        
        // Set animation delay
        this.element.style.animationDelay = `${this.delay}s`;
        
        container.appendChild(this.element);
    }
    
    updateVisual() {
        if (this.isAppIcon) {
            this.element.className = `tool-item app-icon ${this.appIconType} ${this.animationStyle}`;
            this.element.innerHTML = appIconSVGs[this.appIconType];
        } else {
            this.element.className = `tool-item gear ${this.gearType} ${this.animationStyle}`;
            this.element.innerHTML = gearSVGs[this.gearType];
        }
        this.element.style.transform = `scale(${this.scale})`;
    }
    
    updatePosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
    
    update(deltaTime) {
        // Move across screen
        this.x += this.vx;
        this.y += this.vy;
        
        // Wrap around edges with larger buffer for smoother transitions
        if (this.x < -500) this.x = window.innerWidth + 200;
        if (this.x > window.innerWidth + 200) this.x = -500;
        if (this.y < -500) this.y = window.innerHeight + 200;
        if (this.y > window.innerHeight + 200) this.y = -500;
        
        this.updatePosition();
        
        // Transformation logic
        this.transformationTimer += deltaTime;
        
        if (this.transformationTimer >= this.transformationDuration) {
            // Transform between tool and app
            // Add a smooth transition class temporarily
            this.element.classList.add('morphing');
            
            setTimeout(() => {
                this.isAppIcon = !this.isAppIcon;
                
                if (this.isAppIcon) {
                    // Pick a new random app icon type
                    this.appIconType = appIconTypes[Math.floor(Math.random() * appIconTypes.length)];
                } else {
                    // Pick a new random gear type
                    this.gearType = gearTypes[Math.floor(Math.random() * gearTypes.length)];
                }
                
                // Change animation style occasionally
                if (Math.random() > 0.6) {
                    const animationStyles = ['rotating', 'floating', 'transforming'];
                    this.animationStyle = animationStyles[Math.floor(Math.random() * animationStyles.length)];
                }
                
                // Vary scale slightly
                this.scale = 0.7 + Math.random() * 0.6;
                
                this.updateVisual();
                
                setTimeout(() => {
                    this.element.classList.remove('morphing');
                }, 300);
            }, 200);
            
            this.transformationTimer = 0;
            this.transformationDuration = 5000 + Math.random() * 5000;
        }
    }
}

// Initialize items
function init() {
    for (let i = 0; i < itemCount; i++) {
        items.push(new ToolItem());
    }
}

// Animation loop with delta time
let lastTime = performance.now();

function animate(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    items.forEach(item => {
        item.update(deltaTime);
    });
    requestAnimationFrame(animate);
}

// Handle window resize
function handleResize() {
    items.forEach(item => {
        // Keep items within bounds
        if (item.x > window.innerWidth) item.x = window.innerWidth - 360;
        if (item.y > window.innerHeight) item.y = window.innerHeight - 360;
    });
}

window.addEventListener('resize', handleResize);

// Start animation
init();
animate();

