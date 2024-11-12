import { useState } from 'react'
import { Textarea } from "@/components/ui/textarea"
import GenerateButton from './GenerateButton'

const VALID_CHARACTERS = new Set([
  'T', 'Y', '\x00', '(', '-', 'L', 'e', 'B', 'j', 'x', 'y', '6', 'v', ' ', '"', 'g', 'l', 'p', 'z', 'c', '0',
  '7', 'P', ':', 'o', 'I', '1', 'E', 'G', 'C', 'h', '#', 'F', 'W', 'N', '5', 'a', 'O', '9', 'H', '!', ')', 'J',
  's', '4', ';', 'D', 'U', "'", ',', '.', 'V', 'f', '8', 'q', '?', 'i', 'K', 'b', 'R', 'd', 'k', 'n', 'r', 'A',
  't', 'S', 'w', '2', 'M', '3', 'm', 'u'
])

interface TextInputAreaProps {
  onTextChange: (text: string) => void
  onGenerateClick: () => void
  isGenerating: boolean
}

export default function TextInputArea({ onTextChange, onGenerateClick, isGenerating }: TextInputAreaProps) {
  const [text, setText] = useState('')
  const [invalidChars, setInvalidChars] = useState<{char: string, index: number}[]>([])

  const validateText = (input: string) => {
    const invalid = []
    for (let i = 0; i < input.length; i++) {
      if (!VALID_CHARACTERS.has(input[i])) {
        invalid.push({ char: input[i], index: i })
      }
    }
    return invalid
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    setText(newText)
    onTextChange(newText)
    const invalid = validateText(newText)
    setInvalidChars(invalid)
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm h-full transition-shadow hover:shadow-md">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Enter Text</h2>
        {invalidChars.length > 0 && (
          <div className="mt-2 text-sm text-red-500">
            Warning: Invalid characters found: {invalidChars.map(({char}, i) => 
              <span key={i} className="font-mono bg-red-100 px-1 rounded">{char}</span>
            )}
          </div>
        )}
      </div>
      <div className="relative h-[calc(100%-60px)]">
        <Textarea
          id="text-input"
          placeholder="Start typing your text here..."
          value={text}
          onChange={handleTextChange}
          className={`min-h-full h-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none ${
            invalidChars.length > 0 ? 'border-red-500' : ''
          }`}
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
