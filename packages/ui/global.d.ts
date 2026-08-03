// `<style jsx>` in Toasty is styled-jsx, which Next enables implicitly. Outside
// the Next compilation the JSX augmentation has to be pulled in by hand.
/// <reference types="styled-jsx" />

// Mirrors the app's global.d.ts for the CSS imports these components rely on.
// The app's copy does not apply here — each package is typechecked on its own.
declare module '*.css';

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}
