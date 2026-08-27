import DOMPurify from 'isomorphic-dompurify'

/**
 * Strips anything executable out of an SVG.
 *
 * SVG is a full XML document format, not an image blob: it can carry
 * `<script>`, `on*` event handlers, `javascript:` URLs, `<foreignObject>` with
 * arbitrary HTML, and external references via `<use href>`. Stored SVGs are
 * rendered with `dangerouslySetInnerHTML`, so anything left in here executes in
 * every visitor's browser.
 *
 * This runs server-side on write. The admin panel also passes uploads through
 * `svgo`, but that is a client-side optimizer — it can be bypassed by posting
 * to the API directly, and optimizing is not sanitizing.
 */
export const sanitizeSvg = (svg: string): string =>
  DOMPurify.sanitize(svg, {
    USE_PROFILES: {
      svg: true,
      svgFilters: true,
    },
    FORBID_TAGS: [
      'script',
      'foreignObject',
      'iframe',
      'embed',
      'object',
      'animate',
      'set',
    ],
    FORBID_ATTR: [
      'onload',
      'onerror',
      'onclick',
      'onmouseover',
      'onfocus',
      'onbegin',
      'onend',
      'onrepeat',
    ],
  })
