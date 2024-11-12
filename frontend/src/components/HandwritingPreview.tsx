interface HandwritingPreviewProps {
  svgPath: string
  width?: number
  height?: number
  onClear?: () => void
}

export default function HandwritingPreview({ svgPath, width = 300, height = 200, onClear }: HandwritingPreviewProps) {
  return (
    <div className="bg-card rounded-lg border shadow-sm h-full transition-shadow hover:shadow-md">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold">Preview</h2>
        <button 
          onClick={onClear}
          className="rounded-full hover:bg-gray-100 transition-colors"
          title="Clear preview"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
        </button>
      </div>
      <div 
        className="p-6 h-[calc(100%-60px)]"
        style={{
          backgroundImage: `
            linear-gradient(#e5e7eb 1px, transparent 1px),
            linear-gradient(90deg, #e5e7eb 1px, transparent 1px),
            linear-gradient(#f3f4f6 0.5px, transparent 0.5px),
            linear-gradient(90deg, #f3f4f6 0.5px, transparent 0.5px)
          `,
          backgroundSize: '20px 20px, 20px 20px, 10px 10px, 10px 10px',
          backgroundColor: '#ffffff',
        }}
      >
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible p-4"
        >
          <path
            d={svgPath}
            fill="none"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
        </svg>
      </div>
    </div>
  )
}
