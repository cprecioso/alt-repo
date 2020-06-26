export const colorFromString = (str: string) => {
  let hash = 0
  for (const codepoint of str)
    hash = codepoint.charCodeAt(0) + ((hash << 5) - hash)

  const colorCode = hash & 0x00ffffff
  return colorCode.toString(16).padStart(6, "0")
}
