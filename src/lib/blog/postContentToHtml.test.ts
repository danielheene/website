import { describe, expect, it } from 'vitest'

import { BlockSlug } from '@/types/blocks'
import { CollectionSlug } from '@/types/collections'

import { postContentToHtml, toAbsoluteUrl } from './postContentToHtml'

const text = (value: string, format = 0) => ({
  type: 'text',
  version: 1,
  text: value,
  format,
  detail: 0,
  mode: 'normal',
  style: '',
})

const paragraph = (...children: object[]) => ({
  type: 'paragraph',
  version: 1,
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
})

const doc = (...children: object[]) =>
  ({
    root: {
      type: 'root',
      version: 1,
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
    },
  }) as unknown as Parameters<typeof postContentToHtml>[0]

const link = (fields: object, label = 'label') => ({
  type: 'link',
  version: 3,
  fields,
  children: [text(label)],
  direction: 'ltr',
  format: '',
  indent: 0,
})

describe('toAbsoluteUrl', () => {
  it('resolves relative URLs against SERVER_URL', () => {
    expect(toAbsoluteUrl('/api/images/file/a.png')).toBe(
      `${process.env.SERVER_URL}/api/images/file/a.png`,
    )
  })

  it('keeps absolute URLs and drops empty ones', () => {
    expect(toAbsoluteUrl('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png')
    expect(toAbsoluteUrl('')).toBeNull()
    expect(toAbsoluteUrl(null)).toBeNull()
  })
})

describe('postContentToHtml', () => {
  it('returns an empty string for empty content', () => {
    expect(postContentToHtml(null)).toBe('')
    expect(postContentToHtml(doc())).toBe('')
  })

  it('renders paragraphs without wrappers or inline styles', () => {
    expect(postContentToHtml(doc(paragraph(text('Hello '), text('world', 1))))).toBe(
      '<p>Hello <strong>world</strong></p>',
    )
  })

  it('makes internal links absolute', () => {
    const html = postContentToHtml(
      doc(
        paragraph(
          link({
            linkType: 'internal',
            doc: {
              relationTo: CollectionSlug.BlogPosts,
              value: {
                id: '1',
                title: 'Other',
                slug: 'other-post',
              },
            },
          }),
        ),
      ),
    )

    expect(html).toBe(`<p><a href="${process.env.SERVER_URL}/blog/post/other-post">label</a></p>`)
  })

  it('drops unsafe link protocols but keeps the text', () => {
    const html = postContentToHtml(
      doc(
        paragraph(
          link({
            linkType: 'custom',
            url: 'javascript:alert(1)',
          }),
        ),
      ),
    )

    expect(html).toBe('<p>label</p>')
  })

  it('renders image uploads with absolute URLs and escaped alt text', () => {
    const html = postContentToHtml(
      doc({
        type: 'upload',
        version: 3,
        relationTo: CollectionSlug.MediaImages,
        value: {
          url: '/api/images/file/cat.png',
          alt: 'A "cat"',
          width: 800,
          height: 600,
        },
        fields: {},
        format: '',
      }),
    )

    expect(html).toBe(
      `<img src="${process.env.SERVER_URL}/api/images/file/cat.png" alt="A &quot;cat&quot;" width="800" height="600"/>`,
    )
  })

  it('drops uploads with a non-http(s) URL', () => {
    expect(
      postContentToHtml(
        doc({
          type: 'upload',
          version: 3,
          relationTo: CollectionSlug.MediaImages,
          value: {
            url: 'javascript:alert(1)',
            width: 10,
            height: 10,
          },
          fields: {},
          format: '',
        }),
      ),
    ).toBe('')
  })

  it('skips unpopulated uploads', () => {
    expect(
      postContentToHtml(
        doc({
          type: 'upload',
          version: 3,
          relationTo: CollectionSlug.MediaImages,
          value: 'abc123',
          fields: {},
          format: '',
        }),
      ),
    ).toBe('')
  })

  it('renders code blocks as escaped pre/code', () => {
    const html = postContentToHtml(
      doc({
        type: 'block',
        version: 2,
        format: '',
        fields: {
          blockType: BlockSlug.Code,
          language: 'tsx',
          code: 'const a = <b>1</b>',
        },
      }),
    )

    expect(html).toBe('<pre><code class="language-tsx">const a = &lt;b&gt;1&lt;/b&gt;</code></pre>')
  })

  it('renders link groups as a list', () => {
    const html = postContentToHtml(
      doc({
        type: 'block',
        version: 2,
        format: '',
        fields: {
          blockType: BlockSlug.LinkGroup,
          links: [
            {
              link: {
                linkType: 'custom',
                url: 'https://example.com',
                text: 'Example & co',
                newTab: true,
              },
            },
          ],
        },
      }),
    )

    expect(html).toBe(
      '<ul><li><a href="https://example.com/" target="_blank" rel="noopener noreferrer">Example &amp; co</a></li></ul>',
    )
  })

  it('drops decorative icons', () => {
    expect(
      postContentToHtml(
        doc(
          paragraph(text('a'), {
            type: 'icon',
            version: 1,
            iconName: 'mdi:star',
          }),
        ),
      ),
    ).toBe('<p>a</p>')
  })
})
