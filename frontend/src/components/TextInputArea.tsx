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
    <div className="bg-card rounded-lg border shadow-sm h-full transition-shadow hover:shadow-md">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Enter Text</h2>
      </div>
      <div className="relative h-[calc(100%-60px)]">
        <Textarea
          id="text-input"
          placeholder="Start typing your text here..."
          value={text}
          onChange={handleTextChange}
          className="min-h-full h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none"
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
