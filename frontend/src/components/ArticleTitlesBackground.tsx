import { useEffect, useRef } from 'react';
import { WordPressPost } from '@/lib/wordpress';

interface ArticleTitlesBackgroundProps {
  articles: WordPressPost[];
}

export default function ArticleTitlesBackground({ articles }: ArticleTitlesBackgroundProps) {
  const leftContainerRef = useRef<HTMLDivElement>(null);
  const rightContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Find the parent section element
    if (leftContainerRef.current) {
      sectionRef.current = leftContainerRef.current.closest('section');
    }

    const handleScroll = () => {
      if ((!leftContainerRef.current && !rightContainerRef.current) || !sectionRef.current) return;
      
      const scrollY = window.scrollY;
      const parallaxSpeed = 0.15; // Parallax intensity - slower movement
      
      // Simple parallax based on scroll position
      const offset = scrollY * parallaxSpeed;
      if (leftContainerRef.current) {
        leftContainerRef.current.style.transform = `translateY(${offset}px)`;
      }
      if (rightContainerRef.current) {
        rightContainerRef.current.style.transform = `translateY(${offset}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!articles || articles.length === 0) {
    return null;
  }

  // Strip HTML tags from titles
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Trim title to 36 characters
  const trimTitle = (title: string) => {
    const cleaned = stripHtml(title);
    if (cleaned.length > 36) {
      return cleaned.substring(0, 36).trim() + '...';
    }
    return cleaned;
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 'clamp(1.4rem, 2vw, 1.8rem)',
    lineHeight: '1.2',
    color: 'rgba(107, 114, 128, 0.15)', // gray-500 at 15% opacity
    fontWeight: 500,
    fontFamily: "'Courier New', Courier, 'Lucida Console', Monaco, monospace",
    maxHeight: '2.4em', // Approximately 2 lines
    overflow: 'hidden',
    overflowWrap: 'break-word',
    filter: 'blur(1px)',
    textShadow: '0 0 3px rgba(107, 114, 128, 0.15)',
  };

  return (
    <>
      {/* Left side - left aligned with right fade */}
      <div
        ref={leftContainerRef}
        className="absolute left-0 w-1/2 pointer-events-none overflow-hidden"
        style={{
          top: '-15%',
          bottom: '-15%',
          height: '130%',
          willChange: 'transform',
          zIndex: 0,
        }}
      >
        {/* Gradient fade overlay - fades to right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, white 0%, rgba(255, 255, 255, 0.8) 20%, rgba(255, 255, 255, 0.4) 40%, transparent 60%)',
            zIndex: 1,
          }}
        />
        <div className="h-full flex flex-col justify-start items-start pl-4 md:pl-8 lg:pl-16 pt-12 relative" style={{ zIndex: 0 }}>
          {articles.map((article) => (
            <div
              key={`left-${article.id}`}
              className="text-left mb-1 md:mb-1.5 max-w-[85%]"
              style={titleStyle}
            >
              {trimTitle(article.title.rendered)}
            </div>
          ))}
        </div>
      </div>

      {/* Right side - right aligned with left fade */}
      <div
        ref={rightContainerRef}
        className="absolute right-0 w-1/2 pointer-events-none overflow-hidden"
        style={{
          top: '-15%',
          bottom: '-15%',
          height: '130%',
          willChange: 'transform',
          zIndex: 0,
        }}
      >
        {/* Gradient fade overlay - fades to left */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, white 0%, rgba(255, 255, 255, 0.8) 20%, rgba(255, 255, 255, 0.4) 40%, transparent 60%)',
            zIndex: 1,
          }}
        />
        <div className="h-full flex flex-col justify-start items-end pr-4 md:pr-8 lg:pr-16 pt-12 relative" style={{ zIndex: 0 }}>
          {articles.map((article) => (
            <div
              key={`right-${article.id}`}
              className="text-right mb-1 md:mb-1.5 max-w-[85%]"
              style={titleStyle}
            >
              {trimTitle(article.title.rendered)}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

