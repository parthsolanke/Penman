interface HandwritingPreviewProps {
  svgPath: string
  width?: number
  height?: number
}

export default function HandwritingPreview({ svgPath, width = 300, height = 200 }: HandwritingPreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border h-full transition-shadow hover:shadow-md">
      <div 
        className="rounded-md h-full"
        style={{
          backgroundImage: `
            linear-gradient(#e5e7eb 1px, transparent 1px),
            linear-gradient(90deg, #e5e7eb 1px, transparent 1px),
            linear-gradient(#f3f4f6 0.5px, transparent 0.5px),
            linear-gradient(90deg, #f3f4f6 0.5px, transparent 0.5px)
          `,
          backgroundSize: '20px 20px, 20px 20px, 10px 10px, 10px 10px',
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
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