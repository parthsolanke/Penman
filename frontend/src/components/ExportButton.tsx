import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import jsPDF from "jspdf";

type ExportButtonProps = {
  svgPath: string;
  strokeColor: string;
  strokeWidth: number;
  viewBox?: string;
  width: number;
  height: number;
  filename?: string;
};

const SCALE_FACTOR = 3;

const downloadFile = (url: string, filename: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const reconstructSvg = (
  svgPath: string,
  strokeColor: string,
  strokeWidth: number,
  width: number,
  height: number,
  viewBox?: string,
  backgroundColor?: string,
  responsive = false
) => {
  const backgroundRect = backgroundColor
    ? `<rect width="100%" height="100%" fill="${backgroundColor}" />`
    : "";

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      ${responsive ? 'width="100%" height="100%"' : `width="${width}" height="${height}"`}
      viewBox="${viewBox || `0 0 ${width} ${height}`}"
      preserveAspectRatio="xMidYMid meet"
      xmlns:xlink="http://www.w3.org/1999/xlink"
    >
      ${backgroundRect}
      <path
        d="${svgPath}"
        fill="none"
        stroke="${strokeColor}"
        stroke-width="${strokeWidth}"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
};

export default function ExportButton({
  svgPath,
  strokeColor,
  strokeWidth,
  viewBox,
  width,
  height,
  filename = "export",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPng = async (transparent = false) => {
    const svgMarkup = reconstructSvg(
      svgPath,
      strokeColor,
      strokeWidth,
      width,
      height,
      viewBox,
      transparent ? undefined : "#ffffff"
    );
    const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
  
    setIsExporting(true);
    try {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
  
      img.onload = () => {
        canvas.width = width * SCALE_FACTOR;
        canvas.height = height * SCALE_FACTOR;
  
        if (!transparent && ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
  
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL("image/png", 1.0);
        downloadFile(dataUrl, `${filename}${transparent ? "-transparent" : ""}.png`);
        URL.revokeObjectURL(url);
      };
  
      img.onerror = (error) => console.error("Error loading SVG for PNG export:", error);
      img.src = url;
    } catch (error) {
      console.error("Error exporting PNG:", error);
    }
    setIsExporting(false);
  };  

  const exportToPdf = async () => {
    const svgMarkup = reconstructSvg(svgPath, strokeColor, strokeWidth, width, height, viewBox, "#ffffff");
    const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    setIsExporting(true);
    try {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      await new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = width * SCALE_FACTOR;
          canvas.height = height * SCALE_FACTOR;

          if (ctx) {
            ctx.scale(SCALE_FACTOR, SCALE_FACTOR);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
          }

          const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
          const pdf = new jsPDF({
            orientation: width > height ? "landscape" : "portrait",
            unit: "px",
            format: [width, height],
          });
          pdf.addImage(dataUrl, "JPEG", 0, 0, width, height);
          pdf.save(`${filename}.pdf`);
          URL.revokeObjectURL(url);
          resolve(true);
        };

        img.onerror = (error) => {
          console.error("Error loading SVG for PDF export:", error);
          reject(error);
        };
        img.src = url;
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
    setIsExporting(false);
  };

  const exportToSvg = () => {
    const svgMarkup = reconstructSvg(svgPath, strokeColor, strokeWidth, width, height, viewBox, "#ffffff");
    const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    setIsExporting(true);
    try {
      downloadFile(url, `${filename}.svg`);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting SVG:", error);
    }
    setIsExporting(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[140px]" disabled={isExporting}>
          {isExporting ? "Exporting..." : "Export"}
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
  );
}
