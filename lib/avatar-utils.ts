const colors = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEEAD", // Yellow
  "#D4A5A5", // Pink
  "#9B59B6", // Purple
  "#3498DB", // Light Blue
  "#2ECC71", // Emerald
  "#F1C40F", // Sun Yellow
]

const patterns = [
  "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='COLOR'/%3E%3Cpath d='M0 0h100v100H0z' fill-opacity='0.1' fill='%23FFFFFF'/%3E%3Cpath d='M10 10h10v10H10zM30 10h10v10H30zM50 10h10v10H50zM70 10h10v10H70zM90 10h10v10H90zM20 20h10v10H20zM40 20h10v10H40zM60 20h10v10H60zM80 20h10v10H80zM10 30h10v10H10z' fill='%23FFFFFF' fill-opacity='0.2'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='COLOR'/%3E%3Ccircle cx='50' cy='50' r='40' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='30' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-opacity='0.15'/%3E%3Ccircle cx='50' cy='50' r='20' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-opacity='0.1'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='COLOR'/%3E%3Cpath d='M0 0l50 50-50 50z' fill='%23FFFFFF' fill-opacity='0.1'/%3E%3Cpath d='M100 0l-50 50 50 50z' fill='%23FFFFFF' fill-opacity='0.2'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='COLOR'/%3E%3Cpath d='M25,25 L75,25 L75,75 L25,75 Z' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-opacity='0.2'/%3E%3Cpath d='M40,40 L60,40 L60,60 L40,60 Z' fill='%23FFFFFF' fill-opacity='0.1'/%3E%3C/svg%3E",
]

export function generateRandomPatternAvatar(): string {
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const randomPattern = patterns[Math.floor(Math.random() * patterns.length)]
  return randomPattern.replace(/COLOR/g, randomColor.substring(1))
}

// Keep this for backward compatibility
export function generateAvatarUrl(firstName: string, lastName: string): string {
  return generateRandomPatternAvatar()
}
