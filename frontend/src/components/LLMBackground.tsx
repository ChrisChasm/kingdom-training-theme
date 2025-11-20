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

interface ColumnState {
    containerRef: React.RefObject<HTMLDivElement>;
    currentLineRef: React.MutableRefObject<number>;
    currentCharRef: React.MutableRefObject<number>;
    timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
}

export default function LLMBackground({ bottomOffset = 0 }: LLMBackgroundProps) {
    // Create three columns with different starting points
    // Column 1 starts at the beginning
    // Column 2 starts 1/3 through
    // Column 3 starts 2/3 through
    const column1 = {
        containerRef: useRef<HTMLDivElement>(null),
        currentLineRef: useRef<number>(0),
        currentCharRef: useRef<number>(0),
        timeoutRef: useRef<NodeJS.Timeout | null>(null),
    };

    const column2 = {
        containerRef: useRef<HTMLDivElement>(null),
        currentLineRef: useRef<number>(Math.floor(codeLines.length / 3)),
        currentCharRef: useRef<number>(0),
        timeoutRef: useRef<NodeJS.Timeout | null>(null),
    };

    const column3 = {
        containerRef: useRef<HTMLDivElement>(null),
        currentLineRef: useRef<number>(Math.floor((codeLines.length * 2) / 3)),
        currentCharRef: useRef<number>(0),
        timeoutRef: useRef<NodeJS.Timeout | null>(null),
    };

    const columns: ColumnState[] = [column1, column2, column3];

    // Create typing function for a column
    const createTypeCode = (column: ColumnState) => {
        return () => {
            const container = column.containerRef.current;
            if (!container) return;

            // Use modulo to wrap around, ensuring each column cycles independently
            const lineIndex = column.currentLineRef.current % codeLines.length;
            
            // Reset container if we've completed a full cycle
            if (column.currentLineRef.current > 0 && lineIndex === 0 && column.currentCharRef.current === 0) {
                container.innerHTML = '';
            }

            const lineText = codeLines[lineIndex];
            
            // Get or create line element - use a unique key based on lineIndex
            const existingLines = Array.from(container.children);
            let lineElement = existingLines.find((el) => {
                const elLineIndex = parseInt(el.getAttribute('data-line-index') || '-1');
                return elLineIndex === lineIndex;
            }) as HTMLElement | undefined;

            if (!lineElement) {
                lineElement = document.createElement('div');
                lineElement.className = 'code-line';
                lineElement.setAttribute('data-line-index', lineIndex.toString());
                container.appendChild(lineElement);
                
                // Auto scroll to bottom
                container.scrollTop = container.scrollHeight;
            }

            if (column.currentCharRef.current <= lineText.length) {
                const currentText = lineText.substring(0, column.currentCharRef.current);
                lineElement.textContent = currentText; // Type as plain text
                
                // Add cursor
                const existingCursor = lineElement.querySelector('.cursor');
                if (!existingCursor) {
                    const cursor = document.createElement('span');
                    cursor.className = 'cursor';
                    lineElement.appendChild(cursor);
                }

                column.currentCharRef.current++;
                
                // Typing speed: fast but variable (25% faster)
                const speed = (Math.random() * 30 + 20) * 0.75;
                column.timeoutRef.current = setTimeout(createTypeCode(column), speed);
            } else {
                // Line Finished
                // Replace content with highlighted HTML
                lineElement.innerHTML = highlightText(lineText);
                
                // Move to next line (will wrap around due to modulo)
                column.currentLineRef.current++;
                column.currentCharRef.current = 0;
                
                // Pause between lines (25% faster)
                column.timeoutRef.current = setTimeout(createTypeCode(column), (Math.random() * 300 + 100) * 0.75);
            }
        };
    };

    useEffect(() => {
        // Initialize all three columns with staggered delays
        columns.forEach((column, index) => {
            const delay = index * 500; // Stagger by 500ms
            column.timeoutRef.current = setTimeout(() => {
                createTypeCode(column)();
            }, delay);
        });

        return () => {
            // Cleanup all timeouts
            columns.forEach(column => {
                if (column.timeoutRef.current) {
                    clearTimeout(column.timeoutRef.current);
                }
            });
        };
    }, []);

    const baseContainerStyle: React.CSSProperties = {
        width: 'min(50vw, 600px)',
        paddingRight: '2rem',
        paddingLeft: '2rem',
        paddingTop: '4rem',
        paddingBottom: '4rem',
    };

    if (bottomOffset !== 0) {
        baseContainerStyle.bottom = `${-bottomOffset}px`;
        baseContainerStyle.top = 'auto';
        baseContainerStyle.height = '100%';
    } else {
        baseContainerStyle.top = '0';
    }

    // Column 1: Centered on mobile, left-aligned 1/3 width on md+
    const column1Style: React.CSSProperties = {
        ...baseContainerStyle,
        width: 'min(50vw, 600px)', // Mobile: centered, max 600px
    };

    // Columns 2 & 3: 1/3 width on md+ screens only
    const column2Style: React.CSSProperties = {
        ...baseContainerStyle,
        width: 'calc(33.333% - 1.33rem)',
        left: '33.333%',
    };

    const column3Style: React.CSSProperties = {
        ...baseContainerStyle,
        width: 'calc(33.333% - 1.33rem)',
        left: '66.666%',
    };

    return (
        <div className="llm-background absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Column 1 - Shows on mobile (centered), left-aligned 1/3 width on md+ */}
            <div 
                ref={column1.containerRef}
                className="code-container column-1 absolute h-full left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0"
                style={column1Style}
            />
            {/* Column 2 - Hidden on mobile, shows on md+ */}
            <div 
                ref={column2.containerRef}
                className="code-container absolute h-full hidden md:block"
                style={column2Style}
            />
            {/* Column 3 - Hidden on mobile and tablet, shows on lg+ */}
            <div 
                ref={column3.containerRef}
                className="code-container absolute h-full hidden lg:block"
                style={column3Style}
            />
        </div>
    );
}

