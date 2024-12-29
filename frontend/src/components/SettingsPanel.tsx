import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, AlertCircle, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { fonts, colors } from "@/lib/constants"
import ExportButton from './ExportButton'
import { useSettings } from '@/contexts/SettingsContext'

const WarningTooltip = ({ children, message }: { children: React.ReactNode, message: string }) => (
  <TooltipProvider>
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <div className="relative w-full">
          {children}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-600">
            <AlertCircle className="h-4 w-4" />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{message}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

type SettingsPanelProps = {
  page: "playground" | "cards";
  svgPath: string;
  viewBox: string | undefined;
  width: number;
  height: number;
  isGenerating: boolean;
  svgMarkupFromCards?: string;
};

export default function SettingsPanel({
  page,
  svgPath,
  viewBox,
  width,
  height,
  isGenerating,
  svgMarkupFromCards,
}: SettingsPanelProps) {
  const {
    font,
    legibility,
    strokeWidth,
    strokeColor,
    setFont,
    setLegibility,
    setStrokeWidth,
    setStrokeColor
  } = useSettings()

  const warningMessage = "Changes cannot be applied while generation is in progress"

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label htmlFor="font-select" className="text-sm font-medium">Style</Label>
            {isGenerating ? (
              <WarningTooltip message={warningMessage}>
                <Button
                  variant="outline"
                  className="w-full h-9 justify-between opacity-50 cursor-not-allowed"
                  disabled
                >
                  {font}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </WarningTooltip>
            ) : (
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
                          src={`/fonts/${f.toLowerCase()}.svg`}
                          alt={`${f}`}
                          className="mr-2 h-5 w-20 object-contain"
                        />
                        {f === font && <Check className="ml-auto h-4 w-4" />}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <div className="flex-[2] min-w-[300px] grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div>
                <Label htmlFor="legibility-slider" className="text-sm font-medium mb-1.5">Legibility</Label>
                {isGenerating ? (
                  <WarningTooltip message={warningMessage}>
                    <div className="opacity-50">
                      <Slider
                        id="legibility-slider"
                        className="py-0.5"
                        min={0.15}
                        max={2.5}
                        step={0.05}
                        value={[legibility]}
                        disabled
                      />
                    </div>
                  </WarningTooltip>
                ) : (
                  <Slider
                    id="legibility-slider"
                    className="py-0.5"
                    min={0.15}
                    max={2.5}
                    step={0.05}
                    value={[legibility]}
                    onValueChange={(value: number[]) => setLegibility(value[0])}
                  />
                )}
              </div>
              <div>
                <Label htmlFor="stroke-width-slider" className="text-sm font-medium mb-1.5">Stroke Width</Label>
                <Slider
                  id="stroke-width-slider"
                  className="py-0.5"
                  min={1}
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
            {isGenerating ? (
              <WarningTooltip message={warningMessage}>
                <Button variant="outline" className="w-[140px] opacity-50" disabled>
                  Export
                  <Download className="ml-2 h-4 w-4" />
                </Button>
              </WarningTooltip>
            ) : (
              <ExportButton
                page = {page}
                svgPath={svgPath}
                strokeColor={strokeColor} 
                strokeWidth={strokeWidth} 
                viewBox={viewBox} 
                width={width} 
                height={height} 
                filename="penman-export" 
                svgMarkupFromCards={svgMarkupFromCards}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}