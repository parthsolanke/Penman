import { useState } from 'react'
import { Textarea } from "@/components/ui/textarea"
import GenerateButton from './GenerateButton'

interface TextInputAreaProps {
  onTextChange: (text: string) => void
  onGenerateClick: () => void
  isGenerating: boolean
}

export default function TextInputArea({ onTextChange, onGenerateClick, isGenerating }: TextInputAreaProps) {
  const [text, setText] = useState('')

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)
    onTextChange(newText)
  }

  return (
    <div className="w-full h-full space-y-4">
      <div className="relative h-full bg-white rounded-lg shadow-sm border transition-shadow hover:shadow-md">
        <Textarea
          id="text-input"
          placeholder="Start typing your text here..."
          value={text}
          onChange={handleTextChange}
          className="min-h-[200px] h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg"
        />
        <div className="absolute bottom-4 right-4">
          <GenerateButton 
            onClick={onGenerateClick} 
            isGenerating={isGenerating} 
          />
        </div>
      </div>
    </div>
  )
}
