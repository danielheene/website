/**
 * Ambient declarations for the CSS side-effect imports Storybook's preview
 * pulls in.
 *
 * TypeScript cannot resolve a bare `.css` specifier on its own — Vite handles
 * those at build time — so each stylesheet is declared here as a module with
 * no exports.
 */
declare module '@website/storybook/storybook.css' {
  const content: string
  export default content
}

declare module '@website/font-pp-frama/css' {
  const content: string
  export default content
}

declare module '@website/font-pp-frama-text/css' {
  const content: string
  export default content
}

declare module '@website/font-pp-supply-mono/css' {
  const content: string
  export default content
}

declare module '@website/font-pp-supply-sans/css' {
  const content: string
  export default content
}
