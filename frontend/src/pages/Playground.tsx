import { useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Pen, Timer, Activity, Clock } from 'lucide-react'
import TextInputArea from '../components/TextInputArea'
import HandwritingPreview from '../components/HandwritingPreview'
import SettingsPanel from '../components/SettingsPanel'
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

  const { font, legibility, strokeWidth, strokeColor } = useSettings()

  const handleTextChange = useCallback((newText: string) => {
    setText(newText)
  }, [])

  const updateStats = useCallback((newStats: Partial<typeof stats>) => {
    setStats(prev => ({ ...prev, ...newStats }))
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
      stroke_color: strokeColor
    }

    let startTime = Date.now()
    let strokeCount = 0

    try {
      await streamHandwriting(
        config,
        (data) => {
          setViewBox(data.viewBox);
          setDimensions({
            width: data.width || 300,
            height: data.height || 200
          });
          startTime = Date.now()
        },
        (data) => {
          strokeCount++
          const elapsed = (Date.now() - startTime) / 1000
          updateStats({
            elapsedTime: elapsed,
            strokeCount,
            currentSpeed: strokeCount / elapsed,
            averageSpeed: strokeCount / elapsed
          })
          setSvgPath(prev => prev + ' ' + data.data)
        },
        (error) => console.error(error),
        abortController.current.signal
      );
    } finally {
      setIsGenerating(false);
    }
  }, [text, font, legibility, strokeWidth, strokeColor, updateStats])

  const handleAbort = useCallback(() => {
    abortController.current?.abort();
    setIsGenerating(false);
  }, []);

  const handleClear = useCallback(() => {
    handleAbort();
    setSvgPath('');
    setViewBox(undefined);
    setDimensions({ width: 300, height: 200 });
  }, [handleAbort]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
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
        
        {/* Stats Panel */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-2">
            <div className="flex justify-center gap-8">
              <StatsBox
                icon={<Clock className="w-4 h-4" />}
                label="Time"
                value={`${stats.elapsedTime.toFixed(1)}s`}
              />
              <StatsBox
                icon={<Activity className="w-4 h-4" />}
                label="Current Speed"
                value={`${stats.currentSpeed.toFixed(1)} strokes/s`}
              />
              <StatsBox
                icon={<Timer className="w-4 h-4" />}
                label="Average Speed"
                value={`${stats.averageSpeed.toFixed(1)} strokes/s`}
              />
            </div>
          </div>
        </div>

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

function StatsBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-full bg-gray-100">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}
