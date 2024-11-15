import { useRef, useState, useCallback, useEffect } from 'react'
import TextInputArea from '../components/TextInputArea'
import HandwritingPreview from '../components/HandwritingPreview'
import SettingsPanel from '../components/SettingsPanel'
import StatsPanel from '../components/StatsPanel'
import Header from '../components/Header'
import { streamHandwriting } from '@/lib/api'
import { useSettings } from '@/contexts/SettingsContext'
import { fonts } from '@/lib/constants'

export default function Playground() {
  const [text, setText] = useState('')
  const [svgPath, setSvgPath] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [viewBox, setViewBox] = useState<string>()
  const previewRef = useRef<HTMLDivElement>(null)
  const abortController = useRef<AbortController>()
  const [dimensions, setDimensions] = useState({ width: 300, height: 200 });
  const [stats, setStats] = useState({
    elapsedTime: 0,
    currentSpeed: 0,
    averageSpeed: 0,
    strokeCount: 0
  })
  const animationFrameRef = useRef<number>()
  const generationStartTime = useRef<number>()

  const { font, legibility, strokeWidth, strokeColor } = useSettings()

  const handleTextChange = useCallback((newText: string) => {
    setText(newText)
  }, [])

  const resetStats = useCallback(() => {
    setStats({
      elapsedTime: 0,
      currentSpeed: 0,
      averageSpeed: 0,
      strokeCount: 0
    })
  }, [])

  const updateStatsLoop = useCallback(() => {
    if (!generationStartTime.current) return

    const elapsed = (Date.now() - generationStartTime.current) / 1000
    setStats(prev => ({
      ...prev,
      elapsedTime: elapsed,
      currentSpeed: prev.strokeCount / elapsed,
      averageSpeed: prev.strokeCount / elapsed
    }))
  }, [])

  useEffect(() => {
    let frameId: number
    
    if (isGenerating) {
      const tick = () => {
        updateStatsLoop()
        frameId = requestAnimationFrame(tick)
      }
      frameId = requestAnimationFrame(tick)
    }

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [isGenerating, updateStatsLoop])

  const handleGenerateClick = useCallback(async () => {
    if (!text.trim()) return;

    if (isGenerating) {
      abortController.current?.abort()
      setIsGenerating(false)
      return
    }

    setIsGenerating(true)
    setSvgPath('')
    resetStats()
    abortController.current = new AbortController()
    generationStartTime.current = Date.now()

    const config = {
      text_input: text,
      style: fonts.indexOf(font),
      bias: legibility,
      stroke_width: strokeWidth,
      stroke_color: strokeColor
    }

    try {
      await streamHandwriting(
        config,
        (data) => {
          setViewBox(data.viewBox);
          setDimensions({
            width: data.width || 300,
            height: data.height || 200
          });
        },
        (data) => {
          setStats(prev => ({
            ...prev,
            strokeCount: prev.strokeCount + 1
          }))
          setSvgPath(prev => prev + ' ' + data.data)
        },
        (error) => console.error(error),
        abortController.current.signal
      );
    } finally {
      setIsGenerating(false);
      generationStartTime.current = undefined;
    }
  }, [text, font, legibility, strokeWidth, strokeColor, isGenerating, resetStats])

  const handleAbort = useCallback(() => {
    abortController.current?.abort();
    setIsGenerating(false);
    cancelAnimationFrame(animationFrameRef.current!)
    resetStats()
  }, [resetStats]);

  const handleClear = useCallback(() => {
    handleAbort();
    setSvgPath('');
    setViewBox(undefined);
    setDimensions({ width: 300, height: 200 });
  }, [handleAbort]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-1 flex flex-col">
        <SettingsPanel previewRef={previewRef} />
        <StatsPanel stats={stats} />
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
