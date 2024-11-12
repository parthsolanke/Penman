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

  const handleGenerateClick = async () => {
    setIsGenerating(true)
    
    // Sample handwriting paths for demonstration
    const samplePaths = [
      'M 50 100 C 70 90, 90 110, 110 100 S 150 85, 170 100',  // wave-like curve
      'M 200 100 Q 225 50, 250 100 T 300 100',                // connected curves
      'M 320 80 L 340 120 L 360 80 M 380 80 L 380 120',      // zig-zag pattern
    ];

    // Simulate gradual path generation
    for (let path of samplePaths) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setSvgPath(prev => prev + ' ' + path);
    }

    setIsGenerating(false);
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
              <HandwritingPreview svgPath={svgPath} onClear={() => setSvgPath("")}  />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
