export default {
  title: 'Imprint',
  content: {
    root: {
      type: 'root',
      children: [
        {
          tag: 'h3',
          type: 'heading',
          children: [
            {
              mode: 'normal',
              text: 'Angaben gem. § 5 TMG:',
              type: 'text',
              detail: 0,
              format: 0,
            },
          ],
        },
        {
          type: 'paragraph',
          children: [],
          textFormat: 0,
        },
        {
          tag: 'h4',
          type: 'heading',
          children: [
            {
              mode: 'normal',
              text: 'Anschrift:',
              type: 'text',
              detail: 0,
              format: 0,
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              mode: 'normal',
              text: 'Daniel Heene',
              type: 'text',
              detail: 0,
              format: 0,
            },
            {
              type: 'linebreak',
            },
            {
              mode: 'normal',
              text: 'Von-wSparr-Str. 62',
              type: 'text',
              detail: 0,
              format: 0,
            },
            {
              type: 'linebreak',
            },
            {
              mode: 'normal',
              text: '51063 Köln',
              type: 'text',
              detail: 0,
              format: 0,
            },
            {
              type: 'linebreak',
            },
            {
              mode: 'normal',
              text: 'Deutschland',
              type: 'text',
              detail: 0,
              format: 0,
            },
          ],
          textFormat: 0,
        },
        {
          type: 'paragraph',
          children: [],
          textFormat: 0,
        },
        {
          tag: 'h4',
          type: 'heading',
          children: [
            {
              mode: 'normal',
              text: 'Kontaktaufnahme:',
              type: 'text',
              detail: 0,
              format: 0,
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              mode: 'normal',
              text: 'E-Mail: ',
              type: 'text',
              detail: 0,
              format: 0,
            },
            {
              type: 'autolink',
              fields: {
                url: 'mailto:mail@danielheene.de',
                linkType: 'custom',
              },
              children: [
                {
                  mode: 'normal',
                  text: 'mail@danielheene.de',
                  type: 'text',
                  detail: 0,
                  format: 0,
                },
              ],
            },
          ],
          textFormat: 0,
        },
        {
          type: 'paragraph',
          children: [],
          textFormat: 0,
        },
        {
          tag: 'h4',
          type: 'heading',
          children: [
            {
              mode: 'normal',
              text: 'Umsatzsteuer-Identifikationsnummer gem. § 27 a Umsatzsteuergesetz:',
              type: 'text',
              detail: 0,
              format: 0,
            },
          ],
        },
        {
          type: 'paragraph',
          children: [
            {
              mode: 'normal',
              text: 'DE 348 610 586',
              type: 'text',
              format: 0,
            },
          ],
          textFormat: 0,
        },
        {
          type: 'paragraph',
          children: [],
          textFormat: 1,
        },
        {
          tag: 'h3',
          type: 'heading',
          children: [
            {
              mode: 'normal',
              text: 'Image Credits',
              type: 'text',
            },
          ],
        },
        {
          tag: 'ul',
          type: 'list',
          start: 1,
          children: [
            {
              type: 'listitem',
              value: 1,
              children: [
                {
                  mode: 'normal',
                  text: 'About Me Image on Home Page by ',
                  type: 'text',
                },
                {
                  type: 'link',
                  fields: {
                    url: 'mailto:marcus@sichtplan.de',
                    newTab: true,
                    linkType: 'custom',
                  },
                  children: [
                    {
                      mode: 'normal',
                      text: 'Marcus Becker',
                      type: 'text',
                    },
                  ],
                },
                {
                  mode: 'normal',
                  text: ' from ',
                  type: 'text',
                },
                {
                  type: 'link',
                  fields: {
                    url: 'https://www.sichtplan.de/',
                    newTab: true,
                    linkType: 'custom',
                  },
                  children: [
                    {
                      mode: 'normal',
                      text: 'Sichtplan',
                      type: 'text',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listitem',
              value: 2,
              children: [
                {
                  mode: 'normal',
                  text: 'Hero Image on Home Page by ',
                  type: 'text',
                },
                {
                  type: 'link',
                  fields: {
                    url: 'https://unsplash.com/@mvds',
                    newTab: true,
                    linkType: 'custom',
                  },
                  children: [
                    {
                      mode: 'normal',
                      text: 'Mads Schmidt Rasmussen',
                      type: 'text',
                    },
                  ],
                },
                {
                  mode: 'normal',
                  text: ' on ',
                  type: 'text',
                },
                {
                  type: 'link',
                  fields: {
                    url: 'https://unsplash.com/photos/ice-capped-mountain-at-daytime-xfngap_DToE',
                    newTab: true,
                    linkType: 'custom',
                  },
                  children: [
                    {
                      mode: 'normal',
                      text: 'Unsplash',
                      type: 'text',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listitem',
              value: 3,
              children: [
                {
                  mode: 'normal',
                  text: 'Hero Image on Imprint Page by ',
                  type: 'text',
                },
                {
                  type: 'link',
                  fields: {
                    url: 'https://unsplash.com/@tjerwin',
                    newTab: true,
                    linkType: 'custom',
                  },
                  children: [
                    {
                      mode: 'normal',
                      text: 'Trent Erwin',
                      type: 'text',
                    },
                  ],
                },
                {
                  mode: 'normal',
                  text: ' on ',
                  type: 'text',
                },
                {
                  type: 'link',
                  fields: {
                    url: 'https://unsplash.com/photos/black-framed-eyeglasses-and-black-pen-UgA3Xvi3SkA',
                    newTab: true,
                    linkType: 'custom',
                  },
                  children: [
                    {
                      mode: 'normal',
                      text: 'Unsplash',
                      type: 'text',
                    },
                  ],
                },
              ],
            },
          ],
          listType: 'bullet',
        },
      ],
    },
  },
  hero: '<HERO_IMAGE>',
  meta: {
    title: 'Imprint',
    description: null,
  },
  slug: 'imprint',
  _status: 'published',
}
