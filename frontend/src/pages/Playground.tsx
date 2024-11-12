import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pen } from 'lucide-react'
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
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-background">
        <Link className="flex items-center justify-center gap-2" to="/">
          <Pen className="h-6 w-6" />
          <span className="font-bold text-2xl">Penman</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" to="/">
            Home
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" to="/cards">
            Cards
          </Link>
        </nav>
      </header>
      <div className="flex-1 flex flex-col">
        <SettingsPanel previewRef={previewRef} />
        <div className="flex-1 container mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <TextInputArea 
              onTextChange={handleTextChange} 
              onGenerateClick={handleGenerateClick} 
              isGenerating={isGenerating} 
            />
            <div ref={previewRef} className="h-full">
              <HandwritingPreview svgPath={svgPath} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
