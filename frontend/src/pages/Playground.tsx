import { useRef, useState } from 'react'
import TextInputArea from '../components/TextInputArea'
import HandwritingPreview from '../components/HandwritingPreview'
import SettingsPanel from '../components/SettingsPanel' // Import SettingsPanel

export default function Playground() {
  const [text, setText] = useState('')
  const [svgPath, setSvgPath] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleTextChange = (newText: string) => {
    setText(newText)
    // Logic to generate svgPath from text
  }

  const handleGenerateClick = () => {
    setIsGenerating(true)
    // Logic to generate svgPath
    setIsGenerating(false)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <SettingsPanel previewRef={previewRef} /> {/* Pass previewRef to SettingsPanel */}
      </div>
      <div className="flex flex-1 overflow-hidden gap-6 p-6">
        <div className="w-1/2 overflow-auto">
          <TextInputArea 
            onTextChange={handleTextChange} 
            onGenerateClick={handleGenerateClick} 
            isGenerating={isGenerating} 
          />
        </div>
        <div className="w-1/2 overflow-auto" ref={previewRef}>
          <HandwritingPreview svgPath={svgPath} />
        </div>
      </div>
    </div>
  )
}
