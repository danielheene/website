import { describe, expect, it } from 'vitest'

import {
  chance,
  codeBlock,
  createRandom,
  heading,
  horizontalRule,
  IS_BOLD,
  link,
  list,
  paragraph,
  pick,
  pickSome,
  quote,
  root,
  text,
  upload,
} from './lexical'

describe('text', () => {
  it('builds a plain text node with format 0 by default', () => {
    expect(text('hello')).toEqual({
      type: 'text',
      version: 1,
      detail: 0,
      format: 0,
      mode: 'normal',
      style: '',
      text: 'hello',
    })
  })

  it('sets the format bitmask when provided', () => {
    expect(text('bold', IS_BOLD)).toMatchObject({
      format: IS_BOLD,
      text: 'bold',
    })
  })
})

describe('paragraph', () => {
  it('wraps a plain string as a single text child', () => {
    const node = paragraph('hello') as {
      children: unknown[]
    }
    expect(node.children).toEqual([
      text('hello'),
    ])
  })

  it('passes an array of inline nodes through unchanged', () => {
    const children = [
      text('a'),
      text('b', IS_BOLD),
    ]
    const node = paragraph(children) as {
      children: unknown[]
    }
    expect(node.children).toBe(children)
  })
})

describe('heading', () => {
  it('defaults to h2', () => {
    const node = heading('Title') as {
      tag: string
    }
    expect(node.tag).toBe('h2')
  })

  it('accepts an explicit tag', () => {
    const node = heading('Title', 'h4') as {
      tag: string
    }
    expect(node.tag).toBe('h4')
  })
})

describe('link', () => {
  it("builds lexical's stock link-field shape with doc set to null", () => {
    const node = link('Docs', 'https://example.com') as {
      fields: {
        linkType: string
        url: string
        doc: null
        newTab: boolean
      }
    }
    expect(node.fields).toEqual({
      linkType: 'custom',
      doc: null,
      newTab: true,
      url: 'https://example.com',
    })
  })
})

describe('list', () => {
  it('builds an ordered list with tag "ol" for listType "number"', () => {
    const node = list(
      [
        'one',
        'two',
      ],
      'number',
    ) as {
      tag: string
      children: unknown[]
    }
    expect(node.tag).toBe('ol')
    expect(node.children).toHaveLength(2)
  })

  it('builds an unordered list with tag "ul" for listType "bullet"', () => {
    const node = list(
      [
        'one',
      ],
      'bullet',
    ) as {
      tag: string
    }
    expect(node.tag).toBe('ul')
  })

  it('alternates checked/unchecked for listType "check"', () => {
    const node = list(
      [
        'a',
        'b',
        'c',
      ],
      'check',
    ) as {
      children: {
        checked?: boolean
      }[]
    }
    expect(node.children.map((item) => item.checked)).toEqual([
      true,
      false,
      true,
    ])
  })
})

describe('codeBlock', () => {
  it('defaults to typescript', () => {
    const node = codeBlock('const x = 1') as {
      fields: {
        language: string
        code: string
        blockType: string
      }
    }
    expect(node.fields).toMatchObject({
      blockType: 'CodeBlock',
      language: 'typescript',
      code: 'const x = 1',
    })
  })
})

describe('upload', () => {
  it('builds an upload node for the given relation and id', () => {
    expect(upload('images', 'img-1')).toEqual({
      type: 'upload',
      version: 3,
      format: '',
      fields: null,
      relationTo: 'images',
      value: 'img-1',
    })
  })
})

describe('horizontalRule', () => {
  it('builds a horizontalrule node', () => {
    expect(horizontalRule()).toEqual({
      type: 'horizontalrule',
      version: 1,
    })
  })
})

describe('quote', () => {
  it('wraps the value as a single text child', () => {
    const node = quote('A quote') as {
      type: string
      children: unknown[]
    }
    expect(node.type).toBe('quote')
    expect(node.children).toEqual([
      text('A quote'),
    ])
  })
})

describe('root', () => {
  it('wraps the given children in a root node', () => {
    const children = [
      paragraph('hello'),
    ]
    const value = root(children) as unknown as {
      root: {
        type: string
        children: unknown[]
      }
    }
    expect(value.root.type).toBe('root')
    expect(value.root.children).toBe(children)
  })
})

describe('createRandom / pick / pickSome / chance', () => {
  it('is deterministic for a given seed', () => {
    const a = createRandom('same-seed')
    const b = createRandom('same-seed')
    expect(a()).toBe(b())
    expect(a()).toBe(b())
  })

  it('produces a different sequence for a different seed', () => {
    const a = createRandom('seed-a')()
    const b = createRandom('seed-b')()
    expect(a).not.toBe(b)
  })

  it('pick always returns an item from the input array', () => {
    const random = createRandom('pick-test')
    const items = [
      'x',
      'y',
      'z',
    ] as const
    for (let i = 0; i < 20; i += 1) {
      expect(items).toContain(pick(random, items))
    }
  })

  it('pickSome returns the requested count with no duplicates', () => {
    const random = createRandom('pickSome-test')
    const items = [
      1,
      2,
      3,
      4,
      5,
    ]
    const result = pickSome(random, items, 3)
    expect(result).toHaveLength(3)
    expect(new Set(result).size).toBe(3)
    for (const value of result) {
      expect(items).toContain(value)
    }
  })

  it('chance returns a boolean influenced by the probability', () => {
    const random = createRandom('chance-test')
    // probability 0 should (almost) never be true, probability 1 always true
    expect(chance(random, 0)).toBe(false)
    expect(chance(random, 1)).toBe(true)
  })
})
