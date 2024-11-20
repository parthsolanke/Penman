import { useEffect, useRef, useState } from 'react'
import { ZoomIn, ZoomOut, RefreshCcw, Loader2 } from 'lucide-react'

interface HandwritingPreviewProps {
  svgPath: string
  width?: number
  height?: number
  onClear?: () => void
  viewBox?: string
  isGenerating?: boolean
  strokeWidth: number
  strokeColor: string
  onAbort?: () => void
}

export default function HandwritingPreview({ 
  svgPath, 
  width = 300, 
  height = 200, 
  onClear,
  viewBox,
  isGenerating,
  strokeWidth,
  strokeColor,
  onAbort
}: HandwritingPreviewProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (pathRef.current && svgPath) {
      pathRef.current.style.strokeDasharray = pathRef.current.getTotalLength().toString();
      pathRef.current.style.strokeDashoffset = '0';
    }
  }, [svgPath]);

  const handleClear = () => {
    onAbort?.();
    onClear?.();
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only check for left click
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return; // Only check for dragging state
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleMouseLeave = () => setIsDragging(false);
    const container = containerRef.current;
    
    if (container) {
      container.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg border shadow-sm h-full flex flex-col min-h-[300px]">
      <div className="p-2 sm:p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div>
          <h2 className="font-semibold text-base">Preview</h2>
          <p className="text-sm text-gray-500 mt-0.5">Generated handwriting output</p>
        </div>
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button 
            onClick={() => setScale(s => Math.max(1, s - 0.1))}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <div className="w-12 sm:w-16 text-center">
            <span className="text-xs sm:text-sm font-medium">{(scale * 100).toFixed(0)}%</span>
          </div>
          <button 
            onClick={() => setScale(s => Math.min(3, s + 0.1))}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <div className="w-px h-5 sm:h-6 bg-gray-200 mx-1.5" />
          <button 
            onClick={handleClear}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors text-black hover:text-gray-900"
            title="Clear preview"
          >
            <RefreshCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 relative bg-white overflow-auto cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          backgroundImage: `
            linear-gradient(#e5e7eb 1px, transparent 1px),
            linear-gradient(90deg, #e5e7eb 1px, transparent 1px),
            linear-gradient(#f3f4f6 0.5px, transparent 0.5px),
            linear-gradient(90deg, #f3f4f6 0.5px, transparent 0.5px)
          `,
          backgroundSize: '20px 20px, 20px 20px, 10px 10px, 10px 10px',
        }}
      >
        {!svgPath && isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Initializing handwriting generation...</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            width="100%" 
            height="100%" 
            viewBox={viewBox || `0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ 
              width: '100%',
              height: '100%',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          >
            <g 
              transform={`translate(${position.x}, ${position.y}) scale(${scale})`}
              style={{ 
                transition: isDragging ? 'none' : 'transform 0.2s ease',
                transformOrigin: 'center'
              }}
            >
              <g transform={`translate(${strokeWidth/2},${strokeWidth/2})`}>
                <path
                  ref={pathRef}
                  d={svgPath}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    animationName: isGenerating ? 'draw' : 'none',
                    animationDuration: '0.01s',
                    animationTimingFunction: 'ease',
                    animationFillMode: 'forwards',
                    animationDelay: '25ms'
                  }}
                />
              </g>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
