// Generate a placeholder avatar URL based on user's name
export function generateAvatarUrl(firstName: string, lastName: string): string {
  // Use a service like DiceBear to generate avatars
  // This creates a unique but consistent avatar based on the name
  const name = encodeURIComponent(`${firstName} ${lastName}`)
  return `https://api.dicebear.com/7.x/micah/svg?seed=${name}&backgroundColor=4cc38a`
}
