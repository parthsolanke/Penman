import { useEffect, useRef, useState } from 'react'
import { ZoomIn, ZoomOut, RefreshCcw } from 'lucide-react'

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
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (pathRef.current && svgPath) {
      pathRef.current.style.strokeDasharray = pathRef.current.getTotalLength().toString();
      pathRef.current.style.strokeDashoffset = '0';
    }
  }, [svgPath]);

  const handleClear = () => {
    onAbort?.();
    onClear?.();
  };

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
        className="flex-1 relative bg-white overflow-hidden"
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
        <svg 
          className="absolute inset-absolute inset-0 m-2 sm:m-6"
          width="100%" 
          height="100%" 
          viewBox={viewBox || `0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid contain"
          style={{ 
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            transition: 'transform 0.2s ease'
          }}
        >
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
        </svg>
      </div>
    </div>
  )
}
