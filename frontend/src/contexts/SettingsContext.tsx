
import { createContext, useContext, useState } from 'react'

interface SettingsContextType {
  font: string
  legibility: number
  strokeWidth: number
  strokeColor: string
  setFont: (font: string) => void
  setLegibility: (value: number) => void
  setStrokeWidth: (value: number) => void
  setStrokeColor: (color: string) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [font, setFont] = useState('Fantasia')
  const [legibility, setLegibility] = useState(0.85)
  const [strokeWidth, setStrokeWidth] = useState(1.5)
  const [strokeColor, setStrokeColor] = useState('#000000')

  return (
    <SettingsContext.Provider value={{
      font,
      legibility,
      strokeWidth,
      strokeColor,
      setFont,
      setLegibility,
      setStrokeWidth,
      setStrokeColor
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}