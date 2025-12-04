import { useEffect, useRef } from 'react';
import { getThemeAssetUrl } from '@/lib/utils';

// Text prompts that will cycle
const prompts = [
    "Create a discipleship training video that sparks movements in unreached communities...",
    "Generate an engaging video teaching biblical principles for multiplying disciples...",
    "Produce a testimony video showing how media catalyzes church planting movements...",
    "Make an interactive video equipping believers to share the Gospel through digital tools...",
    "Create a training series on facilitating discovery Bible studies in oral cultures...",
    "Generate content showing how one faithful disciple can multiply into thousands..."
];

interface Particle {
    element: HTMLDivElement;
    x: number;
    y: number;
    targetX: number;
    targetY: number;
    duration: number;
    startTime: number;
    size: number;
    opacity: number;
}

type Platform = 'desktop' | 'tablet' | 'mobile';

export default function GenMapBackground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const textPromptRef = useRef<HTMLDivElement>(null);
    const particlesContainerRef = useRef<HTMLDivElement>(null);
    const frameContainerRef = useRef<HTMLDivElement>(null);
    const playerScreenRef = useRef<HTMLDivElement>(null);
    const youtubeLayerRef = useRef<HTMLDivElement>(null);
    const platformRef = useRef<Platform>('desktop');
    
    const currentPromptIndexRef = useRef(0);
    const currentCharIndexRef = useRef(0);
    const isTypingRef = useRef(false);
    const particlesRef = useRef<Particle[]>([]);
    const frameCountRef = useRef(0);
    const maxFrames = 6;
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        // Particle class
        const spawnParticle = (type = 'data', forceLeft = false) => {
            if (!particlesContainerRef.current || !textPromptRef.current || !playerScreenRef.current) return;

            const element = document.createElement('div');
            element.className = `particle ${type}`;
            
            const textRect = textPromptRef.current.getBoundingClientRect();
            const containerRect = containerRef.current!.getBoundingClientRect();
            
            const x = textRect.left - containerRect.left + Math.random() * textRect.width;
            const y = textRect.top - containerRect.top + Math.random() * textRect.height;
            
            const targetY = type === 'create' 
                ? containerRect.height * 0.15
                : containerRect.height * 0.5;
            
            // 60% of particles go left, 40% go right (or force left if specified)
            let targetX;
            if (forceLeft || Math.random() < 0.6) {
                // Target left side of screen
                targetX = containerRect.width * 0.2 + (Math.random() - 0.5) * 200;
            } else {
                // Target right side of screen
                targetX = containerRect.width * 0.75 + (Math.random() - 0.5) * 100;
            }
            
            const particle: Particle = {
                element,
                x,
                y,
                targetX,
                targetY,
                duration: 2000 + Math.random() * 1000,
                startTime: performance.now(),
                size: 3 + Math.random() * 4,
                opacity: 0
            };
            
            element.style.width = `${particle.size}px`;
            element.style.height = `${particle.size}px`;
            element.style.left = `${particle.x}px`;
            element.style.top = `${particle.y}px`;
            element.style.opacity = '0';
            
            particlesContainerRef.current.appendChild(element);
            particlesRef.current.push(particle);
        };

        const updateParticle = (particle: Particle, currentTime: number): boolean => {
            const elapsed = currentTime - particle.startTime;
            const progress = Math.min(elapsed / particle.duration, 1);
            
            const easeProgress = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            const midX = (particle.x + particle.targetX) / 2 + (Math.random() - 0.5) * 100;
            particle.x = particle.x + (midX - particle.x) * easeProgress * 0.5;
            particle.y = particle.y + (particle.targetY - particle.y) * easeProgress;
            
            if (progress < 0.2) {
                particle.opacity = progress / 0.2;
            } else if (progress > 0.8) {
                particle.opacity = (1 - progress) / 0.2;
            } else {
                particle.opacity = 0.8;
            }
            
            particle.element.style.left = `${particle.x}px`;
            particle.element.style.top = `${particle.y}px`;
            particle.element.style.opacity = particle.opacity.toString();
            
            if (progress > 0.4 && progress < 0.5 && Math.random() > 0.95) {
                generateVideoFrame();
            }
            
            if (progress >= 1) {
                particle.element.remove();
                return false;
            }
            
            return true;
        };

        const generateVideoFrame = () => {
            if (!frameContainerRef.current || !playerScreenRef.current) return;
            
            if (frameCountRef.current >= maxFrames) {
                const frames = frameContainerRef.current.querySelectorAll('.video-frame');
                if (frames.length > 0) {
                    frames[0].remove();
                }
            }
            
            const frame = document.createElement('div');
            frame.className = 'video-frame';
            
            const angle = (frameCountRef.current * 137.5) * (Math.PI / 180);
            const radius = 120 + (frameCountRef.current * 15);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            frame.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(0)`;
            frame.style.opacity = '0';
            
            frameContainerRef.current.appendChild(frame);
            
            // Slower initial appearance - increased from 0.8s to 1.6s
            setTimeout(() => {
                frame.style.transition = 'all 1.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                frame.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1)`;
                frame.style.opacity = '1';
            }, 50);
            
            // Slower movement to YouTube player - increased delay from 2000ms to 3500ms and transition from 1.5s to 2.5s
            setTimeout(() => {
                const playerRect = playerScreenRef.current!.getBoundingClientRect();
                const containerRect = containerRef.current!.getBoundingClientRect();
                const frameRect = frame.getBoundingClientRect();
                
                const targetX = (playerRect.left - containerRect.left) + playerRect.width / 2 - (frameRect.left - containerRect.left) - frameRect.width / 2;
                const targetY = (playerRect.top - containerRect.top) + playerRect.height / 2 - (frameRect.top - containerRect.top) - frameRect.height / 2;
                
                frame.style.transition = 'all 2.5s cubic-bezier(0.4, 0.0, 0.2, 1)';
                frame.style.transform = `translate(-50%, -50%) translate(${targetX}px, ${targetY}px) scale(2.5)`;
                frame.style.opacity = '0';
                
                setTimeout(() => {
                    frame.remove();
                }, 2500);
            }, 3500);
            
            frameCountRef.current++;
        };

        const spawnFrameBurst = () => {
            const burstCount = 8 + Math.floor(Math.random() * 5);
            for (let i = 0; i < burstCount; i++) {
                setTimeout(() => {
                    generateVideoFrame();
                }, i * 80);
            }
            
            // Spawn 25 particles with bias toward left side
            for (let i = 0; i < 25; i++) {
                setTimeout(() => {
                    // Force left side for first 15 particles, then random
                    const forceLeft = i < 15;
                    spawnParticle('data', forceLeft);
                }, i * 40);
            }
        };

        const updatePlatform = () => {
            // Cycle through desktop, tablet, and mobile
            const platforms: Platform[] = ['desktop', 'tablet', 'mobile'];
            const currentIndex = platforms.indexOf(platformRef.current);
            const nextIndex = (currentIndex + 1) % platforms.length;
            platformRef.current = platforms[nextIndex];
            
            // Update the player appearance
            if (youtubeLayerRef.current) {
                youtubeLayerRef.current.setAttribute('data-platform', platformRef.current);
            }
        };

        const fadeYoutubeScreen = () => {
            if (!youtubeLayerRef.current) return;
            
            youtubeLayerRef.current.style.animation = 'none';
            void youtubeLayerRef.current.offsetWidth;
            
            youtubeLayerRef.current.style.transition = 'opacity 0.8s ease-out';
            youtubeLayerRef.current.style.opacity = '0.2';
            
            setTimeout(() => {
                if (youtubeLayerRef.current) {
                    youtubeLayerRef.current.style.opacity = '1';
                }
            }, 800);
        };

        const typeText = () => {
            if (isTypingRef.current || !textPromptRef.current) return;
            isTypingRef.current = true;
            
            updatePlatform();
            fadeYoutubeScreen();
            spawnFrameBurst();
            
            const prompt = prompts[currentPromptIndexRef.current];
            currentCharIndexRef.current = 0;
            
            const typingInterval = setInterval(() => {
                if (!textPromptRef.current) return;
                
                if (currentCharIndexRef.current < prompt.length) {
                    textPromptRef.current.textContent = prompt.substring(0, currentCharIndexRef.current + 1);
                    currentCharIndexRef.current++;
                    
                    if (currentCharIndexRef.current % 3 === 0) {
                        spawnParticle();
                    }
                } else {
                    clearInterval(typingInterval);
                    isTypingRef.current = false;
                    
                    setTimeout(() => {
                        if (!textPromptRef.current) return;
                        currentPromptIndexRef.current = (currentPromptIndexRef.current + 1) % prompts.length;
                        textPromptRef.current.style.opacity = '0';
                        setTimeout(() => {
                            if (!textPromptRef.current) return;
                            textPromptRef.current.textContent = '';
                            textPromptRef.current.style.opacity = '1';
                            typeText();
                        }, 1000);
                    }, 5000);
                }
            }, 50);
        };

        const animate = (currentTime: number) => {
            for (let i = particlesRef.current.length - 1; i >= 0; i--) {
                if (!updateParticle(particlesRef.current[i], currentTime)) {
                    particlesRef.current.splice(i, 1);
                }
            }
            
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        // Initialize
        setTimeout(() => {
            typeText();
            animationFrameRef.current = requestAnimationFrame(animate);
        }, 500);

        setTimeout(() => {
            if (youtubeLayerRef.current) {
                youtubeLayerRef.current.style.animation = 'none';
            }
        }, 5000);

        // Continuous particle spawning (increased frequency from 100ms to 80ms)
        const particleInterval = setInterval(() => {
            if (isTypingRef.current) {
                spawnParticle();
            }
        }, 80);

        // Generate frames periodically (slowed down from 800ms to 1200ms)
        const frameInterval = setInterval(() => {
            if (isTypingRef.current && Math.random() > 0.7) {
                generateVideoFrame();
            }
        }, 1200);

        // Spawn initial burst
        setTimeout(() => {
            for (let i = 0; i < 20; i++) {
                setTimeout(() => spawnParticle(), i * 50);
            }
        }, 1000);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            clearInterval(particleInterval);
            clearInterval(frameInterval);
            particlesRef.current.forEach(p => p.element.remove());
        };
    }, []);

    return (
        <div ref={containerRef} className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ opacity: 0.5 }}>
            <style>{`
                .genmap-bg-container .text-prompt {
                    font-size: 18px;
                    color: #e2e8f0;
                    line-height: 1.6;
                    text-align: left;
                    padding: 20px 30px;
                    background: rgba(15, 23, 42, 0.7);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    min-height: 60px;
                    position: relative;
                    transition: opacity 0.3s;
                }

                .genmap-bg-container .particle {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                    will-change: transform, opacity;
                }

                .genmap-bg-container .particle.data {
                    background: #3b82f6;
                    box-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.4);
                }

                .genmap-bg-container .particle.process {
                    background: #8b5cf6;
                    box-shadow: 0 0 10px rgba(139, 92, 246, 0.8), 0 0 20px rgba(139, 92, 246, 0.4);
                }

                .genmap-bg-container .particle.create {
                    background: #06b6d4;
                    box-shadow: 0 0 10px rgba(6, 182, 212, 0.8), 0 0 20px rgba(6, 182, 212, 0.4);
                }

                .genmap-bg-container .video-frame {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 160px;
                    height: 90px;
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    border: 2px solid rgba(139, 92, 246, 0.5);
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
                    opacity: 0;
                    will-change: transform, opacity;
                }

                .genmap-bg-container .video-frame::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 0;
                    height: 0;
                    border-style: solid;
                    border-width: 10px 0 10px 16px;
                    border-color: transparent transparent transparent rgba(139, 92, 246, 0.7);
                }

                .genmap-bg-container .youtube-layer {
                    opacity: 0;
                    animation: fadeInYoutube 2s ease-out 3s forwards;
                }

                @keyframes fadeInYoutube {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .genmap-bg-container .youtube-player {
                    background: #282828;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
                    transition: all 0.5s ease;
                    position: relative;
                }

                /* Platform-specific player styling */
                /* Desktop - Monitor screen */
                .genmap-bg-container .youtube-layer[data-platform="desktop"] .youtube-player {
                    background: #1a1a1a;
                    border-radius: 8px;
                    padding: 0;
                    box-shadow: 
                        0 8px 30px rgba(0, 0, 0, 0.5),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.1);
                    border: 2px solid rgba(60, 60, 60, 0.5);
                    position: relative;
                }

                /* Desktop monitor stand/base */
                .genmap-bg-container .youtube-layer[data-platform="desktop"] .youtube-player::after {
                    content: '';
                    position: absolute;
                    bottom: -20px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 200px;
                    height: 12px;
                    background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
                    border-radius: 4px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                }

                /* Tablet - iPad-like */
                .genmap-bg-container .youtube-layer[data-platform="tablet"] .youtube-player {
                    background: linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%) !important;
                    border-radius: 24px !important;
                    padding: 12px !important;
                    box-shadow: 
                        0 12px 40px rgba(0, 0, 0, 0.9), 
                        inset 0 0 0 5px rgba(255, 255, 255, 0.25),
                        inset 0 0 0 10px rgba(0, 0, 0, 0.6),
                        0 0 0 3px rgba(60, 60, 60, 0.8);
                    border: 3px solid rgba(100, 100, 100, 0.3);
                    transform: scale(0.95);
                    transition: all 0.5s ease;
                }

                /* Mobile - Portrait phone - Position in middle right, below text box */
                .genmap-bg-container .youtube-layer[data-platform="mobile"] {
                    top: 50% !important;
                    bottom: auto !important;
                    right: 5% !important;
                    width: 90% !important;
                    max-width: 360px !important;
                    transform: translateY(-50%) !important;
                }

                .genmap-bg-container .youtube-layer[data-platform="mobile"] .youtube-player {
                    background: linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%) !important;
                    border-radius: 40px !important;
                    padding: 16px 8px !important;
                    box-shadow: 
                        0 4px 15px rgba(0, 0, 0, 0.4), 
                        inset 0 0 0 6px rgba(255, 255, 255, 0.3),
                        inset 0 0 0 12px rgba(0, 0, 0, 0.7),
                        0 0 0 4px rgba(80, 80, 80, 0.9) !important;
                    border: 4px solid rgba(150, 150, 150, 0.4) !important;
                    transform: scale(0.85) !important;
                    max-width: 360px !important;
                    margin: 0 auto;
                    transition: all 0.5s ease;
                }

                /* Tablet Frame - iPad-like */
                .genmap-bg-container .mobile-phone-frame {
                    position: absolute;
                    top: -12px;
                    left: -12px;
                    right: -12px;
                    bottom: -12px;
                    pointer-events: none;
                    z-index: 15;
                    opacity: 0;
                    transition: opacity 0.5s ease;
                    border: 6px solid rgba(50, 50, 50, 0.95);
                    border-radius: 28px;
                    background: linear-gradient(135deg, rgba(60, 60, 60, 0.9) 0%, rgba(40, 40, 40, 0.9) 100%);
                    box-shadow: 
                        inset 0 0 0 2px rgba(255, 255, 255, 0.2),
                        0 0 0 2px rgba(0, 0, 0, 0.6),
                        0 8px 20px rgba(0, 0, 0, 0.8);
                }

                .genmap-bg-container .youtube-layer[data-platform="tablet"] .mobile-phone-frame {
                    opacity: 1;
                }

                /* Mobile Phone Frame - Portrait phone */
                .genmap-bg-container .youtube-layer[data-platform="mobile"] .mobile-phone-frame {
                    opacity: 1;
                    border: 8px solid rgba(50, 50, 50, 0.95);
                    border-radius: 44px;
                    top: -16px;
                    left: -8px;
                    right: -8px;
                    bottom: -16px;
                }

                /* Mobile phone notch */
                .genmap-bg-container .youtube-layer[data-platform="mobile"] .mobile-phone-frame::before {
                    content: '';
                    position: absolute;
                    top: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 120px;
                    height: 24px;
                    background: linear-gradient(135deg, rgba(50, 50, 50, 0.98) 0%, rgba(40, 40, 40, 0.98) 100%);
                    border-radius: 0 0 18px 18px;
                    z-index: 16;
                    border: 2px solid rgba(0, 0, 0, 0.3);
                    border-top: none;
                }

                .genmap-bg-container .mobile-status-bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 24px;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 12px;
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.95);
                    font-weight: 600;
                    z-index: 11;
                    backdrop-filter: blur(10px);
                    opacity: 0;
                    transition: opacity 0.5s ease;
                }

                .genmap-bg-container .youtube-layer[data-platform="tablet"] .mobile-status-bar,
                .genmap-bg-container .youtube-layer[data-platform="mobile"] .mobile-status-bar {
                    opacity: 1;
                }

                .genmap-bg-container .mobile-time {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    letter-spacing: 0.5px;
                }

                .genmap-bg-container .mobile-status-icons {
                    display: flex;
                    gap: 4px;
                    align-items: center;
                    font-size: 9px;
                }

                .genmap-bg-container .player-screen {
                    position: relative;
                    width: 100%;
                    padding-top: 56.25%;
                    background: #000;
                    overflow: hidden;
                }

                /* Mobile portrait aspect ratio */
                .genmap-bg-container .youtube-layer[data-platform="mobile"] .player-screen {
                    padding-top: 177.78%; /* 9:16 aspect ratio for portrait phone */
                }

                .genmap-bg-container .player-screen::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #1e1e1e 0%, #0a0a0a 100%);
                    opacity: 0.8;
                    transition: background 0.5s ease;
                }

                /* Platform-specific screen backgrounds */
                .genmap-bg-container .youtube-layer[data-platform="desktop"] .player-screen::before {
                    background: linear-gradient(135deg, #1e1e1e 0%, #0a0a0a 100%);
                }

                .genmap-bg-container .youtube-layer[data-platform="tablet"] .player-screen {
                    border-radius: 16px;
                    overflow: hidden;
                }

                .genmap-bg-container .youtube-layer[data-platform="tablet"] .player-screen::before {
                    background: linear-gradient(135deg, #0a0a0a 0%, #000000 100%);
                    border-radius: 16px;
                }

                .genmap-bg-container .youtube-layer[data-platform="mobile"] .player-screen {
                    border-radius: 24px;
                    overflow: hidden;
                    margin-top: 0;
                }

                .genmap-bg-container .youtube-layer[data-platform="mobile"] .player-screen::before {
                    background: linear-gradient(135deg, #0a0a0a 0%, #000000 100%);
                    border-radius: 24px;
                }

                .genmap-bg-container .gear-image-container {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 100;
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .genmap-bg-container .gear-image {
                    width: 160px;
                    height: 160px;
                    animation: rotateGear 3s linear infinite;
                    opacity: 0.9;
                    position: relative;
                    z-index: 101;
                }

                @keyframes rotateGear {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }


                .genmap-bg-container .player-controls {
                    background: #181818;
                    padding: 8px 12px;
                    transition: background 0.5s ease;
                }

                .genmap-bg-container .youtube-layer[data-platform="desktop"] .player-controls {
                    background: #181818;
                }

                .genmap-bg-container .youtube-layer[data-platform="tablet"] .player-controls {
                    background: #0a0a0a;
                    border-radius: 0 0 16px 16px;
                }

                .genmap-bg-container .youtube-layer[data-platform="mobile"] .player-controls {
                    background: #0a0a0a;
                    border-radius: 0 0 24px 24px;
                    margin-top: -1px;
                }

                .genmap-bg-container .progress-bar {
                    width: 100%;
                    height: 3px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 2px;
                    margin-bottom: 8px;
                    position: relative;
                    overflow: hidden;
                }

                .genmap-bg-container .progress-fill {
                    height: 100%;
                    background: #ff0000;
                    width: 0%;
                    border-radius: 2px;
                    animation: progressFill 8s linear infinite;
                    transition: background 0.5s ease;
                }

                /* Platform-specific progress colors */
                .genmap-bg-container .youtube-layer[data-platform="desktop"] .progress-fill {
                    background: #ff0000;
                }

                .genmap-bg-container .youtube-layer[data-platform="tablet"] .progress-fill {
                    background: #007aff;
                }

                .genmap-bg-container .youtube-layer[data-platform="mobile"] .progress-fill {
                    background: #007aff;
                }

                @keyframes progressFill {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }

                .genmap-bg-container .control-buttons {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    color: #fff;
                    font-size: 12px;
                }

                .genmap-bg-container .control-icon {
                    width: 24px;
                    height: 24px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                }

                .genmap-bg-container .time-display {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 12px;
                }

                .genmap-bg-container .right-controls {
                    display: flex;
                    gap: 8px;
                    margin-left: auto;
                }

                @media (max-width: 768px) {
                    .genmap-bg-container .text-prompt {
                        font-size: 14px;
                        padding: 15px 20px;
                    }
                    
                    .genmap-bg-container .video-frame {
                        width: 120px;
                        height: 68px;
                    }

                    .genmap-bg-container .gear-image {
                        width: 120px;
                        height: 120px;
                    }
                }

                @media (max-width: 480px) {
                    .genmap-bg-container .text-prompt {
                        font-size: 11px;
                        padding: 10px 14px;
                        min-height: 50px;
                    }
                    
                    .genmap-bg-container .video-frame {
                        width: 90px;
                        height: 51px;
                    }
                    
                    .genmap-bg-container .control-icon {
                        width: 20px;
                        height: 20px;
                    }

                    .genmap-bg-container .gear-image {
                        width: 90px;
                        height: 90px;
                    }
                }
            `}</style>
            <div className="genmap-bg-container w-full h-full">
                {/* Text Input Layer */}
                <div className="absolute" style={{ bottom: 'calc(19% - 15px)', right: '5%', width: '80%', maxWidth: '700px', zIndex: 10 }}>
                    <div ref={textPromptRef} className="text-prompt"></div>
                </div>
                
                {/* Processing Particles */}
                <div ref={particlesContainerRef} className="absolute inset-0" style={{ zIndex: 5 }}></div>
                
                {/* Video Generation Layer */}
                <div className="absolute" style={{ top: '48%', right: '5%', transform: 'translateY(-50%)', width: '600px', height: '340px', zIndex: 7 }}>
                    <div ref={frameContainerRef} className="relative w-full h-full"></div>
                </div>
                
                {/* Video Player Output Layer */}
                <div ref={youtubeLayerRef} className="youtube-layer absolute" data-platform="desktop" style={{ top: '8%', right: '5%', width: '90%', maxWidth: '640px', zIndex: 10 }}>
                    <div className="youtube-player">
                        {/* Mobile Phone Frame - shown when platform is 'mobile' */}
                        <div className="mobile-phone-frame"></div>
                        <div ref={playerScreenRef} className="player-screen">
                            {/* Mobile Status Bar - shown when platform is 'mobile' */}
                            <div className="mobile-status-bar">
                                <span className="mobile-time">9:41</span>
                                <div className="mobile-status-icons">
                                    <span className="mobile-signal">📶</span>
                                    <span className="mobile-wifi">📶</span>
                                    <span className="mobile-battery">🔋</span>
                                </div>
                            </div>
                            {/* Spinning Gear - visible in both video and mobile modes */}
                            <div className="gear-image-container">
                                <img 
                                    src={getThemeAssetUrl('gear.png')} 
                                    alt="Spinning gear" 
                                    className="gear-image"
                                />
                            </div>
                        </div>
                        <div className="player-controls">
                            <div className="progress-bar">
                                <div className="progress-fill"></div>
                            </div>
                            <div className="control-buttons">
                                <div className="control-icon"></div>
                                <div className="time-display">0:00 / 2:45</div>
                                <div className="right-controls">
                                    <div className="control-icon"></div>
                                    <div className="control-icon"></div>
                                    <div className="control-icon"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

