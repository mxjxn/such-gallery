export function convertToKebabCase(str: string): string {
  // Convert to lowercase and replace unwanted characters and spaces with hyphens
  let result = str.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  // Remove leading or trailing hyphens
  result = result.replace(/^-|-$/g, "");
  // Limit to 5 words
  let words = result.split("-");
  if (words.length > 5) {
    result = words.slice(0, 5).join("-");
  }
  return result;
}
