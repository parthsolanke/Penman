'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type ExportButtonProps = {
  targetRef: React.RefObject<HTMLElement>
  filename?: string
}

export default function ExportButton({ targetRef, filename = 'export' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const exportToPng = async (transparent: boolean = false) => {
    if (!targetRef.current) return
    setIsExporting(true)
    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: transparent ? null : '#ffffff'
      })
      const dataUrl = canvas.toDataURL('image/png')
      downloadFile(dataUrl, `${filename}${transparent ? '-transparent' : ''}.png`)
    } catch (error) {
      console.error('Error exporting to PNG:', error)
    }
    setIsExporting(false)
  }

  const exportToPdf = async () => {
    if (!targetRef.current) return
    setIsExporting(true)
    try {
      const canvas = await html2canvas(targetRef.current)
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`${filename}.pdf`)
    } catch (error) {
      console.error('Error exporting to PDF:', error)
    }
    setIsExporting(false)
  }

  const exportToSvg = () => {
    if (!targetRef.current) return
    setIsExporting(true)
    try {
      const svgElement = targetRef.current.querySelector('svg')
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement)
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const svgUrl = URL.createObjectURL(svgBlob)
        downloadFile(svgUrl, `${filename}.svg`)
        URL.revokeObjectURL(svgUrl)
      } else {
        console.error('No SVG element found')
      }
    } catch (error) {
      console.error('Error exporting to SVG:', error)
    }
    setIsExporting(false)
  }

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[140px]" disabled={isExporting}>
          {isExporting ? 'Exporting...' : 'Export'}
          <Download className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => exportToPng()}>
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => exportToPng(true)}>
          Export as PNG (Transparent)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={exportToPdf}>
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={exportToSvg}>
          Export as SVG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Then, you can use the `ExportButton` component in your React application like this:

// import { useRef } from 'react'
// import ExportButton from './ExportButton'

// export default function YourComponent() {
//   const contentRef = useRef<HTMLDivElement>(null)

//   return (
//     <div>
//       <div ref={contentRef}>
//         {/* Your content to be exported goes here */}
//       </div>
//       <ExportButton targetRef={contentRef} filename="my-export" />
//     </div>
//   )
// }