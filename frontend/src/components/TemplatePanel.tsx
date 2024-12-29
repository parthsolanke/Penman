import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Grid, Layout } from 'lucide-react'
import { cardTemplates, cardSizes } from '@/lib/constants'
import styled from '@emotion/styled'

const ScrollContainer = styled.div`
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const sizes = ['A5', 'Square', 'Pano'] as const

interface TemplatePanelProps {
  selectedSize: keyof typeof cardSizes;
  onSizeChange: (size: keyof typeof cardSizes) => void;
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

export default function TemplatePanel({
  selectedSize,
  onSizeChange,
  selectedTemplate,
  onTemplateChange
}: TemplatePanelProps) {
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
          <TemplateSelection
            selectedTemplate={selectedTemplate}
            onTemplateChange={onTemplateChange}
          />
          <SizeSelection
            selectedSize={selectedSize}
            onSizeChange={onSizeChange}
          />
        </div>
      </div>
    </div>
  )
}

function TemplateSelection({ selectedTemplate, onTemplateChange }: { selectedTemplate: string, onTemplateChange: (template: string) => void }) {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="flex items-center gap-2 min-w-[100px]">
        <div className="p-2 rounded-full bg-gray-100">
          <Grid className="w-4 h-4" />
        </div>
        <p className="text-sm text-gray-500">Template</p>
      </div>
      <ScrollContainer className="w-[calc(100%-120px)] sm:w-[340px] overflow-auto scrollbar-hide">
        <ScrollArea className="w-full">
          <div className="flex space-x-4 p-2">
            {cardTemplates.map((template) => (
              <button
                key={template.id}
                className={`flex-shrink-0 rounded-md overflow-hidden transition-all ${
                  selectedTemplate === template.id 
                    ? 'ring-2 ring-primary ring-offset-2 scale-105 shadow-lg' 
                    : 'hover:scale-105 hover:shadow-md'
                }`}
                onClick={() => onTemplateChange(template.id)}
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center ${
                  selectedTemplate === template.id ? 'bg-primary/10' : 'bg-gray-100'
                }`}>
                  <img
                    src={template.svg}
                    alt={template.name}
                    className={`w-12 h-12 sm:w-16 sm:h-16 object-contain transition-all ${
                      selectedTemplate === template.id ? 'scale-110' : ''
                    }`}
                    onError={() => console.error(`Error loading SVG: ${template.svg}`)}
                  />
                </div>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </ScrollContainer>
    </div>
  )
}

function SizeSelection({ selectedSize, onSizeChange }: { selectedSize: keyof typeof cardSizes; onSizeChange: (size: keyof typeof cardSizes) => void }) {
  return (
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-full bg-gray-100">
        <Layout className="w-4 h-4" />
      </div>
      <div>
        <Select value={selectedSize} onValueChange={onSizeChange}>
          <SelectTrigger className="w-[90px] h-9">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}