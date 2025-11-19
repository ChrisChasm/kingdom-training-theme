import { useEffect, useRef } from 'react';

export default function NeuralBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width: number;
        let height: number;
        let animationFrameId: number;
        // Particle Class
        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;

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

                // Wrap around edges
                if (this.x < 0) this.x = width;
                if (this.x > width) this.x = 0;
                if (this.y < 0) this.y = height;
                if (this.y > height) this.y = 0;
            }

            draw(context: CanvasRenderingContext2D) {
                context.save();
                context.translate(this.x, this.y);

                context.fillStyle = this.color;
                context.beginPath();

                // Heart shape logic
                const scale = this.size / 100;
                context.scale(scale, scale);

                // Heart path
                context.moveTo(0, -30);
                context.bezierCurveTo(-30, -70, -80, -30, 0, 40);
                context.bezierCurveTo(80, -30, 30, -70, 0, -30);

                context.fill();
                context.restore();
            }
        }

        let particles: Particle[] = [];
        const particleCount = 80;
        const connectionDistance = 150;
        const rotationSpeed = 0.001; // Radians per frame
        let globalAngle = 0;

        // Resize handling - use parent dimensions if available, otherwise window
        const resize = () => {
            if (!canvas) return;
            const parent = canvas.parentElement;
            if (parent && parent.clientWidth > 0 && parent.clientHeight > 0) {
                width = parent.clientWidth;
                height = parent.clientHeight;
            } else {
                // Fallback to window dimensions
                width = window.innerWidth;
                height = window.innerHeight;
            }
            // Set canvas size (this also clears the canvas)
            canvas.width = width;
            canvas.height = height;
        };

        // Use ResizeObserver for more reliable parent dimension tracking
        let resizeObserver: ResizeObserver | null = null;
        
        // Set up ResizeObserver after ensuring parent exists
        const setupResizeObserver = () => {
            const parent = canvas.parentElement;
            if (parent && typeof ResizeObserver !== 'undefined') {
                resizeObserver = new ResizeObserver(() => {
                    resize();
                });
                resizeObserver.observe(parent);
            }
        };

        window.addEventListener('resize', resize);
        
        // Initial setup - ensure DOM is ready
        requestAnimationFrame(() => {
            resize(); // Set dimensions first
            setupResizeObserver(); // Then set up observer
            init(); // Then initialize particles
            animate(); // Finally start animation
        });

        function init() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function drawConnections() {
            if (!ctx) return;
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
            if (!ctx) return;

            ctx.clearRect(0, 0, width, height);

            ctx.save();
            ctx.translate(width / 2, height / 2);
            globalAngle += rotationSpeed;
            ctx.rotate(globalAngle);
            ctx.translate(-width / 2, -height / 2);

            drawConnections();

            particles.forEach(p => {
                p.update();
                p.draw(ctx);
            });

            ctx.restore();

            animationFrameId = requestAnimationFrame(animate);
        }

        return () => {
            window.removeEventListener('resize', resize);
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
        />
    );
}
