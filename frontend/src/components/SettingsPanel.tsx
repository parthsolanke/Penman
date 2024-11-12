'use client'

import { useState } from 'react'
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import ExportButton from './ExportButton'

const fonts = [
  "Arial", "Helvetica", "Times New Roman", "Courier", "Verdana",
  "Georgia", "Palatino", "Garamond", "Bookman", "Comic Sans MS",
  "Trebuchet MS", "Arial Black", "Impact"
]

const colors = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#00FFFF", "#FF00FF", "#C0C0C0", "#808080",
  "#800000", "#808000", "#008000", "#800080", "#008080", "#000080"
]

interface SettingsPanelProps {
  previewRef: React.RefObject<HTMLElement>
}

export default function SettingsPanel({ previewRef }: SettingsPanelProps) {
  const [font, setFont] = useState(fonts[0])
  const [legibility, setLegibility] = useState(50)
  const [strokeWidth, setStrokeWidth] = useState(1)
  const [strokeColor, setStrokeColor] = useState(colors[0])

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label htmlFor="font-select" className="text-sm font-medium">Style</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full h-9 justify-between"
                  id="font-select"
                >
                  {font}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <div className="grid grid-cols-2 gap-1 p-1.5">
                  {fonts.map((f) => (
                    <Button
                      key={f}
                      variant="ghost"
                      className="justify-start font-normal"
                      onClick={() => setFont(f)}
                    >
                      <img
                        src={`/placeholder.svg?height=30&width=100&text=${f}`}
                        alt={`${f} preview`}
                        className="mr-2 h-5 w-20 object-cover"
                      />
                      {f === font && <Check className="ml-auto h-4 w-4" />}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex-[2] min-w-[300px] grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div>
                <Label htmlFor="legibility-slider" className="text-sm font-medium mb-1.5">Legibility</Label>
                <Slider
                  id="legibility-slider"
                  className="py-0.5"
                  min={0}
                  max={100}
                  step={1}
                  value={[legibility]}
                  onValueChange={(value: number[]) => setLegibility(value[0])}
                />
              </div>
              <div>
                <Label htmlFor="stroke-width-slider" className="text-sm font-medium mb-1.5">Stroke Width</Label>
                <Slider
                  id="stroke-width-slider"
                  className="py-0.5"
                  min={0.5}
                  max={5}
                  step={0.1}
                  value={[strokeWidth]}
                  onValueChange={(value) => setStrokeWidth(value[0])}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Stroke Color</Label>
              <RadioGroup
                value={strokeColor}
                onValueChange={setStrokeColor}
                className="grid grid-cols-8 gap-1.5"
              >
                {colors.map((color) => (
                  <div key={color} className="flex items-center">
                    <RadioGroupItem
                      value={color}
                      id={`color-${color}`}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={`color-${color}`}
                      className={cn(
                        "h-6 w-6 rounded-full cursor-pointer ring-offset-background transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        strokeColor === color && "ring-2 ring-ring ring-offset-2"
                      )}
                      style={{ backgroundColor: color }}
                    >
                      <span className="sr-only">{color}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
          <div className="flex-none">
            <ExportButton targetRef={previewRef} filename="penman-export" />
          </div>
        </div>
      </div>
    </div>
  )
}


// For the font previews, I've used placeholder images. In a real application, you would want to replace these with actual font previews. You could generate these previews using a canvas or by using pre-generated images for each font. Here's how you might generate a font preview using a canvas:

//  function FontPreview({ font, text }) {function FontPreview({ font, text }) {
//   const canvasRef = useRef(null)

//   useEffect(() => {
//     const canvas = canvasRef.current
//     const ctx = canvas.getContext('2d')
//     ctx.font = `16px ${font}`
//     ctx.fillText(text, 10, 20)
//   }, [font, text])

//   return <canvas ref={canvasRef} width={100} height={30} />
// }