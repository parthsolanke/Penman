import { useState, useEffect } from 'react'
import { Textarea } from "@/components/ui/textarea"
import GenerateButton from './GenerateButton'
import { VALID_CHARACTERS } from '@/lib/constants'

interface TextInputAreaProps {
  text: string
  onTextChange: (text: string) => void
  onGenerateClick: () => void
  isGenerating: boolean
}

export default function TextInputArea({ text, onTextChange, onGenerateClick, isGenerating }: TextInputAreaProps) {
  const [invalidChars, setInvalidChars] = useState<{char: string, index: number}[]>([])
  const [showLimitWarning, setShowLimitWarning] = useState(false)
  const CHARACTER_LIMIT = 650

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (text.length > CHARACTER_LIMIT * 0.95 || text.length === CHARACTER_LIMIT) {
      setShowLimitWarning(true);
      timeoutId = setTimeout(() => {
        setShowLimitWarning(false);
      }, 3000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [text.length]);

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
    if (newText.length <= CHARACTER_LIMIT) {
      const invalid = validateText(newText)
      setInvalidChars(invalid)
      onTextChange(newText)
    }
  }

  const isNearLimit = text.length > CHARACTER_LIMIT * 0.95
  const isAtLimit = text.length === CHARACTER_LIMIT

  return (
    <div className="bg-white rounded-lg border shadow-sm h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base">Enter Text</h2>
          <p className="text-sm text-gray-500 mt-0.5">Type or paste your text here</p>
        </div>
        <div className={`text-sm ${
          isAtLimit ? 'text-red-600 font-medium' : 
          isNearLimit ? 'text-yellow-600' : 
          'text-gray-500'
        }`}>
          {text.length}/{CHARACTER_LIMIT} characters
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

        {showLimitWarning && isAtLimit && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 transition-opacity duration-300">
            <p className="font-medium">
              Character limit reached (maximum {CHARACTER_LIMIT} characters)
            </p>
          </div>
        )}

        <Textarea
          id="text-input"
          value={text}
          onChange={handleTextChange}
          maxLength={CHARACTER_LIMIT}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (!e.shiftKey) {
                e.preventDefault();
                onGenerateClick(); 
              }
            }
          }}
          className={`flex-1 resize-none p-4 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none text-lg bg-transparent
            ${invalidChars.length > 0 ? 'border-red-500' : ''}
            ${isAtLimit ? 'border-red-300' : ''}`}
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
