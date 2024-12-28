
export const fonts = [
  "Fantasia", "Sansara", "Grotesque", "Mirage",
  "Cascade", "Shadow", "Pixel", "Harmony", "Classic",
  "Revival", "Minimal", "Vibes", "Nova"
]

export const cardTemplates = [
  { id: 'floral', name: 'floral', svg: '/templates/floral.svg' },
  { id: 'post', name: 'post', svg: '/templates/post.svg' },
  { id: 'nature', name: 'nature', svg: '/templates/nature.svg' },
  { id: 'mermaid', name: 'mermaid', svg: '/templates/mermaid.svg' },
  { id: 'watercolor', name: 'watercolor', svg: '/templates/watercolor.svg' },
  { id: 'geometric', name: 'geometric', svg: '/templates/geometric.svg' },
]

export const cardSizes = {
  'A6': { width: 400, height: 600 },
  'A5': { width: 600, height: 800 },
  'A4': { width: 800, height: 1200 },
  'Square': { width: 800, height: 800 },
  'Pano': { width: 1200, height: 600 }
}

export const colors = [
  "#000000", "#FFA500", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#00FFFF", "#FF00FF", "#C0C0C0", "#808080",
  "#800000", "#808000", "#008000", "#800080", "#008080", "#000080"
]

export const VALID_CHARACTERS = new Set([
  '\x00', ' ', '!', '"', '#', "'", '(', ')', ',', '-', '.',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';',
  '?', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K',
  'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V', 'W', 'Y',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
  'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
  'y', 'z', "\r", "\n", "\t"
])