// Vite's `?raw` suffix imports a file's contents as a string (the Colors docs read `_colors.css`)
declare module '*?raw' {
  const content: string
  export default content
}
