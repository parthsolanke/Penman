import { useState } from 'react'
import { Textarea } from "@/components/ui/textarea"
import GenerateButton from './GenerateButton'

const VALID_CHARACTERS = new Set([
  '\x00', ' ', '!', '"', '#', "'", '(', ')', ',', '-', '.',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';',
  '?', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
  'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'Y',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
  'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
  'y', 'z'
])

interface TextInputAreaProps {
  text: string
  onTextChange: (text: string) => void
  onGenerateClick: () => void
  isGenerating: boolean
}

export default function TextInputArea({ text, onTextChange, onGenerateClick, isGenerating }: TextInputAreaProps) {
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
    const invalid = validateText(newText)
    setInvalidChars(invalid)
    onTextChange(newText)
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base">Enter Text</h2>
          <p className="text-sm text-gray-500 mt-0.5">Type or paste your text here</p>
        </div>
        <div className="text-sm text-gray-500">
          {text.length} characters
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        {invalidChars.length > 0 && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
            <p className="font-medium flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12" y2="16"/>
              </svg>
              Invalid characters detected
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {invalidChars.map(({char}, i) => 
                <span key={i} className="font-mono bg-red-100 px-2 py-0.5 rounded">
                  {char}
                </span>
              )}
            </div>
          </div>
        )}

        <Textarea
          id="text-input"
          value={text}
          onChange={handleTextChange}
          className={`flex-1 resize-none p-4 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none text-lg bg-transparent
            ${invalidChars.length > 0 ? 'border-red-500' : ''}`}
        />

        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
          <GenerateButton 
            onClick={onGenerateClick} 
            isGenerating={isGenerating}
          />
        </div>
      </div>
    </div>
  )
}
