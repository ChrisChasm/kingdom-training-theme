import { useEffect, useRef } from 'react';

// Books configuration
const bookConfigs = [
    { type: 'standard', color: 'color-1' },
    { type: 'tall', color: 'color-2' },
    { type: 'wide', color: 'color-3' },
    { type: 'standard', color: 'color-1' },
    { type: 'thin', color: 'color-2' },
    { type: 'tall', color: 'color-3' },
    { type: 'standard', color: 'color-1' },
    { type: 'wide', color: 'color-2' },
];

// Spark particle system
class Spark {
    element: HTMLDivElement;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    lifetime: number;
    age: number;
    delay: number;
    delayed: boolean;
    opacity: number;
    blur: number;
    colorClass: string;

    constructor(container: HTMLDivElement, initialAge?: number, initialY?: number) {
        this.element = document.createElement('div');
        this.element.className = 'spark';
        
        // Random color
        const colors = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5'];
        this.colorClass = colors[Math.floor(Math.random() * colors.length)];
        this.element.classList.add(this.colorClass);
        
        // Random starting position near books (bottom of screen)
        const bookAreaStart = window.innerWidth * 0.2;
        const bookAreaEnd = window.innerWidth * 0.8;
        this.x = bookAreaStart + Math.random() * (bookAreaEnd - bookAreaStart);
        
        // Use initialY if provided, otherwise random position
        if (initialY !== undefined) {
            this.y = initialY;
        } else {
            this.y = window.innerHeight * 0.7 + Math.random() * (window.innerHeight * 0.25);
        }
        
        // Random velocity - rising upward with some horizontal drift
        this.vx = (Math.random() - 0.5) * 0.8; // Horizontal drift
        this.vy = -2 - Math.random() * 2; // Upward movement (negative Y)
        
        // Random size
        this.size = 2 + Math.random() * 3;
        this.element.style.width = `${this.size}px`;
        this.element.style.height = `${this.size}px`;
        
        // Random lifetime
        this.lifetime = 3000 + Math.random() * 4000; // 3-7 seconds
        
        // Use initialAge if provided, otherwise start at 0
        this.age = initialAge !== undefined ? initialAge : 0;
        
        // No delay for pre-initialized sparks
        this.delay = 0;
        this.delayed = true; // Skip delay for pre-initialized sparks
        
        // Fade and blur properties
        this.opacity = 0;
        this.blur = 0;
        
        // If pre-initialized, update immediately to set correct opacity/blur
        if (initialAge !== undefined && initialAge > 0) {
            const progress = this.age / this.lifetime;
            const heightProgress = (window.innerHeight - this.y) / window.innerHeight;
            
            if (progress < 0.1) {
                this.opacity = progress / 0.1;
            } else if (progress > 0.8) {
                this.opacity = (1 - progress) / 0.2;
            } else {
                this.opacity = 0.6 + Math.sin(progress * Math.PI * 4) * 0.2;
            }
            
            this.blur = heightProgress * 3;
            const breathe = 0.7 + Math.sin(this.age / 500) * 0.3;
            this.element.style.opacity = (this.opacity * breathe * 0.6).toString();
            this.element.style.filter = `blur(${this.blur}px)`;
        }
        
        this.updatePosition();
        container.appendChild(this.element);
    }
    
    updatePosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
    
    update(deltaTime: number): boolean {
        // Handle initial delay
        if (!this.delayed) {
            this.delay -= deltaTime;
            if (this.delay > 0) {
                this.element.style.opacity = '0';
                return true;
            }
            this.delayed = true;
        }
        
        this.age += deltaTime;
        
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Add some turbulence/wind effect
        this.vx += (Math.random() - 0.5) * 0.1;
        this.vy += (Math.random() - 0.5) * 0.05;
        
        // Damping to prevent excessive speed
        this.vx *= 0.99;
        this.vy *= 0.995;
        
        // Calculate opacity based on age and position
        const progress = this.age / this.lifetime;
        const heightProgress = (window.innerHeight - this.y) / window.innerHeight;
        
        // Fade in at start, fade out at end
        if (progress < 0.1) {
            this.opacity = progress / 0.1;
        } else if (progress > 0.8) {
            this.opacity = (1 - progress) / 0.2;
        } else {
            this.opacity = 0.6 + Math.sin(progress * Math.PI * 4) * 0.2; // Subtle pulsing
        }
        
        // Increase blur as it rises (fading out of focus)
        this.blur = heightProgress * 3;
        
        // Apply opacity and blur with breathing effect
        const breathe = 0.7 + Math.sin(this.age / 500) * 0.3;
        this.element.style.opacity = (this.opacity * breathe * 0.6).toString();
        this.element.style.filter = `blur(${this.blur}px)`;
        
        this.updatePosition();
        
        // Remove if expired or off screen
        if (this.age >= this.lifetime || this.y < -50 || this.x < -50 || this.x > window.innerWidth + 50) {
            this.element.remove();
            return false;
        }
        
        return true;
    }
}

export default function IdeasBackground() {
    const booksContainerRef = useRef<HTMLDivElement>(null);
    const sparksContainerRef = useRef<HTMLDivElement>(null);
    const sparksRef = useRef<Spark[]>([]);
    const animationFrameRef = useRef<number>();
    const lastTimeRef = useRef<number>(performance.now());
    const lastSpawnTimeRef = useRef<number>(0);
    const maxSparks = 2500; // Increased by 400% (from 500 to 2500)
    const spawnInterval = 20; // Spawn new spark every 20ms

    useEffect(() => {
        // Create books
        if (booksContainerRef.current) {
            bookConfigs.forEach((config) => {
                const book = document.createElement('div');
                book.className = `book ${config.type} ${config.color}`;
                booksContainerRef.current!.appendChild(book);
            });
        }

        // Pre-populate sparks immediately at various stages
        function initializeSparks() {
            if (!sparksContainerRef.current) return;
            
            const initialSparkCount = Math.min(maxSparks, 2000); // Pre-populate up to 2000 sparks
            
            for (let i = 0; i < initialSparkCount; i++) {
                // Create spark at bottom
                const spark = new Spark(sparksContainerRef.current);
                
                // Skip delay for pre-initialized sparks
                spark.delayed = true;
                spark.delay = 0;
                
                // Give each spark a random age so they're at different stages
                const maxAge = 5000; // Max age in ms (less than lifetime to avoid expired sparks)
                spark.age = Math.random() * maxAge;
                
                // Simulate movement for the initial age
                // Run multiple small updates to approximate where the spark would be
                const steps = 50;
                const stepTime = spark.age / steps;
                for (let step = 0; step < steps; step++) {
                    // Simulate position update
                    spark.x += spark.vx * (stepTime / 16.67); // Approximate frame time
                    spark.y += spark.vy * (stepTime / 16.67);
                    
                    // Apply damping
                    spark.vx *= 0.99;
                    spark.vy *= 0.995;
                    
                    // Add some turbulence
                    spark.vx += (Math.random() - 0.5) * 0.1 * (stepTime / 16.67);
                    spark.vy += (Math.random() - 0.5) * 0.05 * (stepTime / 16.67);
                }
                
                // Update visual properties based on current age and position
                const progress = spark.age / spark.lifetime;
                const heightProgress = (window.innerHeight - spark.y) / window.innerHeight;
                
                if (progress < 0.1) {
                    spark.opacity = progress / 0.1;
                } else if (progress > 0.8) {
                    spark.opacity = (1 - progress) / 0.2;
                } else {
                    spark.opacity = 0.6 + Math.sin(progress * Math.PI * 4) * 0.2;
                }
                
                spark.blur = heightProgress * 3;
                const breathe = 0.7 + Math.sin(spark.age / 500) * 0.3;
                spark.element.style.opacity = (spark.opacity * breathe * 0.6).toString();
                spark.element.style.filter = `blur(${spark.blur}px)`;
                spark.updatePosition();
                
                sparksRef.current.push(spark);
            }
        }

        // Initialize sparks immediately
        initializeSparks();

        // Animation loop
        function animate(currentTime: number) {
            const deltaTime = currentTime - lastTimeRef.current;
            lastTimeRef.current = currentTime;
            
            // Spawn new sparks periodically
            if (sparksContainerRef.current && currentTime - lastSpawnTimeRef.current >= spawnInterval) {
                if (sparksRef.current.length < maxSparks) {
                    const spark = new Spark(sparksContainerRef.current);
                    sparksRef.current.push(spark);
                }
                lastSpawnTimeRef.current = currentTime;
            }
            
            // Update all sparks
            for (let i = sparksRef.current.length - 1; i >= 0; i--) {
                const spark = sparksRef.current[i];
                if (!spark.update(deltaTime)) {
                    sparksRef.current.splice(i, 1);
                }
            }
            
            animationFrameRef.current = requestAnimationFrame(animate);
        }

        animationFrameRef.current = requestAnimationFrame(animate);

        // Handle window resize
        function handleResize() {
            // Remove sparks that are now off-screen
            sparksRef.current.forEach((spark, index) => {
                if (spark.x < -100 || spark.x > window.innerWidth + 100) {
                    spark.element.remove();
                    sparksRef.current.splice(index, 1);
                }
            });
        }

        window.addEventListener('resize', handleResize);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            window.removeEventListener('resize', handleResize);
            // Clean up sparks
            sparksRef.current.forEach(spark => spark.element.remove());
            sparksRef.current = [];
        };
    }, []);

    return (
        <div className="ideas-background absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div ref={booksContainerRef} className="books-container" />
            <div ref={sparksContainerRef} className="sparks-container" />
        </div>
    );
}

