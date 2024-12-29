import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from 'lucide-react';
import jsPDF from "jspdf";

type ExportButtonProps = {
  page: "playground" | "cards";
  svgPath?: string;
  strokeColor?: string;
  strokeWidth?: number;
  viewBox?: string;
  width?: number;
  height?: number;
  filename?: string;
  svgMarkupFromCards?: string;
};

type LoadedImage = {
  element: HTMLImageElement;
  width: number;
  height: number;
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
      xmlns:xlink="http://www.w3.org/1999/xlink"
      preserveAspectRatio="xMidYMid meet"
      ${responsive ? 'width="100%" height="100%"' : `width="${width}" height="${height}"`}
      viewBox="${viewBox || `0 0 ${width} ${height}`}">
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
  page,
  svgPath,
  strokeColor = "#000",
  strokeWidth = 2,
  viewBox,
  width = 500,
  height = 500,
  filename = "export",
  svgMarkupFromCards,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);
  const [transparentSvgMarkup, setTransparentSvgMarkup] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [visibleWarning, setVisibleWarning] = useState<string | null>(null);

  useEffect(() => {
    if (page === "playground") {
      if (!svgPath) {
        setWarning("SVG path is missing! Cannot export.");
        return;
      }
      const normalMarkup = reconstructSvg(svgPath, strokeColor, strokeWidth, width, height, viewBox, "#ffffff");
      const transparentMarkup = reconstructSvg(svgPath, strokeColor, strokeWidth, width, height, viewBox, undefined);
      setSvgMarkup(normalMarkup);
      setTransparentSvgMarkup(transparentMarkup);
    } else if (page === "cards") {
      if (!svgMarkupFromCards) {
        setWarning("Pre-constructed SVG markup is missing! Cannot export.");
        return;
      }
      setSvgMarkup(svgMarkupFromCards);
    }
  }, [page, svgPath, strokeColor, strokeWidth, width, height, viewBox, svgMarkupFromCards]);

  const loadImage = (src: string): Promise<LoadedImage> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          element: img,
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  };

  const exportToPng = async (transparent = false) => {
    setVisibleWarning(null);
    const markup = transparent ? transparentSvgMarkup : svgMarkup;
    if (!markup) {
      setWarning("SVG markup is not available for export.");
      return;
    }

    setIsExporting(true);
    try {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(markup, 'image/svg+xml');
      const backgroundImage = svgDoc.querySelector('image');
      const backgroundUrl = backgroundImage?.getAttribute('href');

      const canvas = document.createElement("canvas");
      canvas.width = width * SCALE_FACTOR;
      canvas.height = height * SCALE_FACTOR;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Failed to get canvas context");

      if (!transparent) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (backgroundUrl) {
        try {
          const bgImage = await loadImage(backgroundUrl);
          const scale = Math.min(
            canvas.width / bgImage.width,
            canvas.height / bgImage.height
          );
          const x = (canvas.width - bgImage.width * scale) / 2;
          const y = (canvas.height - bgImage.height * scale) / 2;
          
          ctx.drawImage(
            bgImage.element,
            x, y,
            bgImage.width * scale,
            bgImage.height * scale
          );
        } catch (error) {
          console.error("Error loading background:", error);
        }
      }
      const blob = new Blob([markup], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      
      const svgImage = await loadImage(url);
      ctx.drawImage(
        svgImage.element,
        0, 0,
        canvas.width,
        canvas.height
      );

      const dataUrl = canvas.toDataURL("image/png", 1.0);
      downloadFile(dataUrl, `${filename}${transparent ? "-transparent" : ""}.png`);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting PNG:", error);
      setWarning("Failed to export PNG");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPdf = async () => {
    setVisibleWarning(null);
    if (!svgMarkup) {
      setWarning("SVG markup is not available for export.");
      return;
    }

    setIsExporting(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = width * SCALE_FACTOR;
      canvas.height = height * SCALE_FACTOR;
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Failed to get canvas context");

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgMarkup, 'image/svg+xml');
      const backgroundImage = svgDoc.querySelector('image');
      const backgroundUrl = backgroundImage?.getAttribute('href');
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (backgroundUrl) {
        try {
          const bgImage = await loadImage(backgroundUrl);
          const scale = Math.min(
            canvas.width / bgImage.width,
            canvas.height / bgImage.height
          );
          const x = (canvas.width - bgImage.width * scale) / 2;
          const y = (canvas.height - bgImage.height * scale) / 2;
          
          ctx.drawImage(
            bgImage.element,
            x, y,
            bgImage.width * scale,
            bgImage.height * scale
          );
        } catch (error) {
          console.error("Error loading background:", error);
        }
      }

      const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      
      const svgImage = await loadImage(url);
      ctx.drawImage(
        svgImage.element,
        0, 0,
        canvas.width,
        canvas.height
      );

      const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [width, height],
      });
      pdf.addImage(dataUrl, "JPEG", 0, 0, width, height);
      pdf.save(`${filename}.pdf`);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setWarning("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToSvg = () => {
    setVisibleWarning(null);
    if (!svgMarkup) {
      setWarning("SVG markup is not available for export.");
      return;
    }

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
    <div className="relative">
      {visibleWarning && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 text-red-800 text-sm rounded shadow-md">
          {visibleWarning}
        </div>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[140px]" disabled={isExporting}>
            {isExporting ? "Exporting..." : "Export"}
            <Download className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={() => {
            if (warning) {
              setVisibleWarning(warning);
              setTimeout(() => setVisibleWarning(null), 2000);
            } else {
              exportToPng();
            }
          }}>
            Export as PNG
          </DropdownMenuItem>
          {page === "playground" && (
            <DropdownMenuItem onSelect={() => {
              if (warning) {
                setVisibleWarning(warning);
                setTimeout(() => setVisibleWarning(null), 2000);
              } else {
                exportToPng(true);
              }
            }}>
              Export as PNG (Transparent)
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => {
            if (warning) {
              setVisibleWarning(warning);
              setTimeout(() => setVisibleWarning(null), 2000);
            } else {
              exportToPdf();
            }
          }}>
            Export as PDF
          </DropdownMenuItem>
          {page === "playground" && (
            <DropdownMenuItem onSelect={() => {
              if (warning) {
                setVisibleWarning(warning);
                setTimeout(() => setVisibleWarning(null), 2000);
              } else {
                exportToSvg();
              }
            }}>
              Export as SVG
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

