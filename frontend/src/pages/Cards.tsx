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
            width: cardSizes[selectedSize].width,
            height: cardSizes[selectedSize].height
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

  const constructSvgMarkup = (
    svgPath: string,
    viewBox: string | undefined,
    dimensions: { width: number; height: number },
    strokeWidth: number,
    strokeColor: string,
    backgroundTemplate?: string
  ) => {
    const background = backgroundTemplate
      ? `<g><image 
           href="${backgroundTemplate}" 
           x="0" 
           y="0" 
           width="${dimensions.width}" 
           height="${dimensions.height}" 
           preserveAspectRatio="xMidYMid meet"
         /></g>`
      : `
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="1"/>
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#f3f4f6" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"/>
      `;
  
    return `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        width="${dimensions.width}"
        height="${dimensions.height}"
        viewBox="${viewBox || `0 0 ${dimensions.width} ${dimensions.height}`}"
        preserveAspectRatio="xMidYMid meet"
      >
        ${background}
        <g transform="translate(${strokeWidth / 2},${strokeWidth / 2})">
          <path
            d="${svgPath}"
            fill="none"
            stroke="${strokeColor}"
            stroke-width="${strokeWidth}"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
      </svg>
    `;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-1 flex flex-col">
      <SettingsPanel
          page="cards"
          svgPath={svgPath}
          viewBox={viewBox}
          width={dimensions.width}
          height={dimensions.height}
          isGenerating={isGenerating}
          svgMarkupFromCards={svgPath ? constructSvgMarkup(
            svgPath,
            viewBox,
            dimensions,
            strokeWidth,
            strokeColor,
            resolvedTemplate
          ) : undefined}
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