import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

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
          Generate
          <Sparkles />
        </>
      )}
    </Button>
  )
}