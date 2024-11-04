import {
  defaultComponents,
  mergeComponents,
  NodeType,
  PortableText as PortableTextBase,
  PortableTextComponents,
  toPlainText,
  PortableTextBlockComponent,
  PortableTextProps as PortableTextBaseProps,
  PortableTextComponent,
} from '@portabletext/react';
import React, { useMemo } from 'react';
import { Image } from '@components/Image';
import clsx, { ClassValue } from 'clsx';
import slugify from 'slugify';
import { log } from 'next-axiom';

const resolveId = (value): string =>
  slugify(toPlainText(value), {
    locale: 'de',
    lower: true,
    trim: true,
    strict: true,
  });

const LinkableH2: PortableTextBlockComponent = ({ children, value }) => (
  <h2 id={resolveId(value)}>{children}</h2>
);
const LinkableH3: PortableTextBlockComponent = ({ children, value }) => (
  <h3 id={resolveId(value)}>{children}</h3>
);
const LinkableH4: PortableTextBlockComponent = ({ children, value }) => (
  <h4 id={resolveId(value)}>{children}</h4>
);
const ImageComponent = ({ value, isInline }) => (
  <figure
    className='w-8/12 mx-auto relative'
    style={{ aspectRatio: value.dimensions.aspectRatio.toFixed(2) }}
  >
    <Image
      sizes='(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw'
      image={value}
    />
  </figure>
);

const ImageCarouselComponent = ({ value, isInline }) => (
  <figure
    className='w-8/12 mx-auto relative'
    style={{ aspectRatio: value.dimensions.aspectRatio.toFixed(2) }}
  >
    <Image image={value} />
  </figure>
);
const CodeComponent: PortableTextComponent<{
  code: string;
  language?: string;
}> = ({ value }) => (
  <pre data-language={value.language}>
    <code>{value.code}</code>
  </pre>
);

interface PortableTextProps extends PortableTextBaseProps {
  className?: ClassValue;
}

export const PortableText = ({ className, ...props }: PortableTextProps) => {
  const { value } = props;

  const components: PortableTextComponents = useMemo(
    () =>
      mergeComponents(defaultComponents, {
        block: {
          h2: LinkableH2,
          h3: LinkableH3,
          h4: LinkableH4,
        },
        types: {
          'object.image': ImageComponent,
          'object.images': ({ value, index, isInline, renderNode }) => (
            <Image key={value._key} image={value} />
          ),
          'object.code': CodeComponent,
        },
      }),

    []
  );

  return (
    <div
      className={clsx([
        'prose',
        'prose-base',
        'lg:prose-xl',
        'lg:prose-p:leading-snug',
        'dark:prose-invert',
        'prose-a:text-primary',
        'max-w-none',
      ])}
    >
      <PortableTextBase
        value={value}
        components={components}
        onMissingComponent={(
          message: string,
          options: { type: string; nodeType: NodeType }
        ) => log.error(message, options)}
      />
    </div>
  );
};
