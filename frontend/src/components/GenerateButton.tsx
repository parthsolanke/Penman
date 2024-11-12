import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"

interface GenerateButtonProps {
  onClick: () => void
  isGenerating: boolean
}

export default function GenerateButton({ onClick, isGenerating }: GenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isGenerating}
      className="w-full max-w-md"
    >
      {isGenerating ? (
        <>Generating...</>
      ) : (
        <>
          Generate Handwriting
          <Pencil className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  )
}