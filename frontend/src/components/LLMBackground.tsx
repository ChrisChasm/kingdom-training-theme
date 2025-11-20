import { useEffect, useRef } from 'react';

const codeLines = [
    "// Initializing Kingdom Training Neural Network...",
    "import { Strategy, DiscipleMaking } from '@kingdom/core';",
    "import { Tools, Resources } from '@kingdom/inventory';",
    "",
    "/**",
    " * Configuration for the disciple making movement protocol.",
    " * Optimizes for reproducibility and spiritual depth.",
    " */",
    "class KingdomStrategy extends Strategy {",
    "    constructor() {",
    "        super({",
    "            objective: 'Great Commission',",
    "            methodology: 'Multiplication',",
    "            target: 'All Nations'",
    "        });",
    "    }",
    "",
    "    async deployTools() {",
    "        const toolset = await Tools.load(['DiscoveryBibleStudy', 'Zume', 'Training']);",
    "        ",
    "        console.log('Analyzing regional requirements...');",
    "        // Adapting strategy to local context",
    "        ",
    "        for (const tool of toolset) {",
    "             await this.implement(tool, {",
    "                 focus: 'Obedience',",
    "                 mode: 'Reproducible'",
    "             });",
    "        }",
    "        ",
    "        return true;",
    "    }",
    "}",
    "",
    "// Main Execution Context",
    "async function runSimulation() {",
    "    const movement = new DiscipleMaking();",
    "    const currentStrategy = new KingdomStrategy();",
    "    ",
    "    console.log('Starting generation...');",
    "    ",
    "    while (movement.isActive()) {",
    "        const metric = await movement.evaluate(currentStrategy);",
    "        ",
    "        if (metric.needsRefinement) {",
    "            // Adjusting approach based on feedback",
    "            currentStrategy.optimize();",
    "            await currentStrategy.deployTools();",
    "        }",
    "        ",
    "        // Generating equipping content",
    "        await new Promise(r => setTimeout(r, 100));",
    "    }",
    "}",
    "",
    "runSimulation();",
    "// Awaiting input streams...",
    "// Processing strategy vectors...",
    "// Optimizing tools for engagement...",
];

function highlightText(text: string): string {
    // Escape HTML
    let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Mask comments first
    const comments: string[] = [];
    html = html.replace(/(\/\/.*)/g, (match) => {
        comments.push(match);
        return `___COMMENT${comments.length - 1}___`;
    });

    // Mask strings
    const strings: string[] = [];
    html = html.replace(/('.*?'|".*?")/g, (match) => {
        strings.push(match);
        return `___STRING${strings.length - 1}___`;
    });

    // Highlight keywords
    html = html.replace(/\b(import|from|const|let|var|async|function|new|return|class|extends|constructor|super|while|if|await|for)\b/g, '<span class="keyword">$1</span>');
    
    // Highlight Classes
    html = html.replace(/\b(Strategy|DiscipleMaking|Tools|Resources|KingdomStrategy|Promise)\b/g, '<span class="class-name">$1</span>');

    // Highlight Functions
    html = html.replace(/\b(deployTools|load|log|implement|runSimulation|evaluate|optimize|isActive|setTimeout)\b/g, '<span class="function">$1</span>');

    // Restore Strings
    html = html.replace(/___STRING(\d+)___/g, (_match, i) => `<span class="string">${strings[parseInt(i)]}</span>`);

    // Restore Comments
    html = html.replace(/___COMMENT(\d+)___/g, (_match, i) => `<span class="comment">${comments[parseInt(i)]}</span>`);

    return html;
}

interface LLMBackgroundProps {
    bottomOffset?: number; // Offset in pixels to move the container up (negative) or down (positive)
}

export default function LLMBackground({ bottomOffset = 0 }: LLMBackgroundProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const currentLineRef = useRef<number>(0);
    const currentCharRef = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const typeCode = () => {
            if (!container) return;

            // Reset if we reached the end
            if (currentLineRef.current >= codeLines.length) {
                timeoutRef.current = setTimeout(() => {
                    if (container) {
                        container.innerHTML = '';
                        currentLineRef.current = 0;
                        currentCharRef.current = 0;
                        typeCode();
                    }
                }, 1500); // 25% faster: 2000 * 0.75 = 1500
                return;
            }

            const lineText = codeLines[currentLineRef.current];
            
            // Get or create line element
            let lineElement = container.children[currentLineRef.current] as HTMLElement;
            if (!lineElement) {
                lineElement = document.createElement('div');
                lineElement.className = 'code-line';
                container.appendChild(lineElement);
                
                // Auto scroll to bottom
                container.scrollTop = container.scrollHeight;
            }

            if (currentCharRef.current <= lineText.length) {
                const currentText = lineText.substring(0, currentCharRef.current);
                lineElement.textContent = currentText; // Type as plain text
                
                // Add cursor
                const existingCursor = lineElement.querySelector('.cursor');
                if (!existingCursor) {
                    const cursor = document.createElement('span');
                    cursor.className = 'cursor';
                    lineElement.appendChild(cursor);
                }

                currentCharRef.current++;
                
                // Typing speed: fast but variable (25% faster)
                const speed = (Math.random() * 30 + 20) * 0.75;
                timeoutRef.current = setTimeout(typeCode, speed);
            } else {
                // Line Finished
                // Replace content with highlighted HTML
                lineElement.innerHTML = highlightText(lineText);
                
                currentLineRef.current++;
                currentCharRef.current = 0;
                
                // Pause between lines (25% faster)
                timeoutRef.current = setTimeout(typeCode, (Math.random() * 300 + 100) * 0.75);
            }
        };

        // Initialize
        typeCode();

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const containerStyle: React.CSSProperties = {
        width: 'min(50vw, 600px)',
        paddingRight: '2rem',
        paddingTop: '4rem',
        paddingBottom: '4rem',
    };

    if (bottomOffset !== 0) {
        // Negative offset means move up, positive means move down
        // For CSS bottom, positive values move up from bottom
        containerStyle.bottom = `${-bottomOffset}px`;
        containerStyle.top = 'auto';
        containerStyle.height = '100%';
    } else {
        containerStyle.top = '0';
    }

    return (
        <div className="llm-background absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div 
                ref={containerRef}
                className="code-container absolute left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-0 h-full"
                style={containerStyle}
            />
        </div>
    );
}

