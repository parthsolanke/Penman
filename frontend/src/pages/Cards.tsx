import { useRef, useState, useCallback } from 'react'
import TextInputArea from '../components/TextInputArea'
import HandwritingPreview from '../components/HandwritingPreview'
import SettingsPanel from '../components/SettingsPanel'
import TemplatePanel from '../components/TemplatePanel'
import Header from '../components/Header'
import { streamHandwriting } from '@/lib/api'
import { useSettings } from '@/contexts/SettingsContext'
import { fonts } from '@/lib/constants'
import { cardSizes, cardTemplates } from '@/lib/constants'


export default function Cards() {
  const [text, setText] = useState('')
  const [svgPath, setSvgPath] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [viewBox, setViewBox] = useState<string>()
  const [selectedTemplate, setSelectedTemplate] = useState<string>('floral')
  const [selectedSize, setSelectedSize] = useState<keyof typeof cardSizes>('A5')
  const previewRef = useRef<HTMLDivElement>(null)
  const abortController = useRef<AbortController>()
  const [dimensions, setDimensions] = useState(cardSizes['A5'])

  const { font, legibility, strokeWidth, strokeColor } = useSettings()
  const resolvedTemplate = cardTemplates.find(template => template.id === selectedTemplate)?.svg;

  const handleTextChange = useCallback((newText: string) => {
    setText(newText)
  }, [])

  const handleSizeChange = useCallback((size: keyof typeof cardSizes) => {
    setSelectedSize(size)
    setDimensions(cardSizes[size])
  }, [])

  const handleTemplateChange = useCallback((template: string) => {
    setSelectedTemplate(template)
  }, [])

  const handleGenerateClick = useCallback(async () => {
    if (!text.trim()) return;

    if (isGenerating) {
      abortController.current?.abort()
      setIsGenerating(false)
      return
    }

    setIsGenerating(true)
    setSvgPath('')
    abortController.current = new AbortController()

    const config = {
      text_input: text,
      style: fonts.indexOf(font),
      bias: legibility,
      stroke_width: strokeWidth,
      stroke_color: strokeColor,
      card_size: selectedSize,
      template: selectedTemplate
    }

    try {
      await streamHandwriting(
        config,
        (data) => {
          setViewBox(data.viewBox);
          setDimensions({
            width: data.width || cardSizes[selectedSize].width,
            height: data.height || cardSizes[selectedSize].height
          });
        },
        (data) => {
          setSvgPath(prev => prev + ' ' + data.data)
        },
        (error) => console.error(error),
        abortController.current.signal
      );
    } finally {
      setIsGenerating(false);
    }
  }, [text, font, legibility, strokeWidth, strokeColor, selectedSize, selectedTemplate])

  const handleAbort = useCallback(() => {
    abortController.current?.abort();
    setIsGenerating(false);
  }, []);

  const handleClear = useCallback(() => {
    handleAbort();
    setSvgPath('');
    setViewBox(undefined);
    setDimensions(cardSizes[selectedSize]);
  }, [handleAbort, selectedSize]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-1 flex flex-col">
        <SettingsPanel
          svgPath={svgPath}
          viewBox={viewBox}
          width={dimensions.width}
          height={dimensions.height}
          isGenerating={isGenerating}
        />
        <TemplatePanel 
          selectedSize={selectedSize}
          onSizeChange={handleSizeChange}
          selectedTemplate={selectedTemplate}
          onTemplateChange={handleTemplateChange}
        />
        <div className="flex-1 container mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ height: 'calc(100vh - 280px)' }}>
            <TextInputArea 
              text={text}
              onTextChange={handleTextChange} 
              onGenerateClick={handleGenerateClick} 
              isGenerating={isGenerating} 
            />
            <div ref={previewRef} className="h-full">
              <HandwritingPreview 
                svgPath={svgPath} 
                onClear={handleClear}
                onAbort={handleAbort}
                viewBox={viewBox}
                width={dimensions.width}
                height={dimensions.height}
                isGenerating={isGenerating}
                strokeWidth={strokeWidth}
                strokeColor={strokeColor}
                backgroundTemplate={resolvedTemplate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}