import { css as cssImport } from '@emotion/react';
import { CSSInterpolation } from '@emotion/serialize';
import styledImport from '@emotion/styled';

declare module 'twin.macro' {
  const styled: typeof styledImport;
  const css: typeof cssImport;
}

declare module 'react' {
  interface DOMAttributes<T> {
    tw?: string;
  }

  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    css?: CSSInterpolation;
  }

  interface SVGProps<T> extends SVGProps<SVGSVGElement> {
    css?: CSSInterpolation;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      tw?: string;
    }

    interface IntrinsicElements {
      tw?: string;
    }
  }
}
