import React from 'react';
import { Icon } from '@iconify/react';
import { codeInput } from '@sanity/code-input';
import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { markdownSchema } from 'sanity-plugin-markdown';

import { schemaTypes } from './schemas';

import './overrides.css';

export default defineConfig({
  name: 'default',
  title: 'daniel.heene.io',

  /* TODO:
    logo?: React.ComponentType
    icon?: React.ComponentType
  */

  projectId: 'ekrchhx4',
  basePath: '/studio',
  dataset: import.meta.env.SANITY_STUDIO_DATASET,

  document: {
    productionUrl: async (prev, context) => {
      const { document } = context;
      if (document._type.startsWith('settings')) return '';

      const params = new URLSearchParams();
      params.append('id', document._id);
      params.append('secret', import.meta.env.SANITY_STUDIO_PREVIEW_TOKEN);

      return [
        import.meta.env.SANITY_STUDIO_SITE_URL,
        '/api/preview?',
        params.toString(),
      ].join('');
    },
  },

  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Home')
              .icon(() =>
                React.createElement(Icon, {
                  icon: 'mdi:home-outline',
                })
              )
              .child(
                S.document()
                  .schemaType('singleton.home')
                  .documentId('singleton.home')
              ),
            S.divider(),
            // S.listItem()
            //   .title('Projects')
            //   .child(
            //     S.list()
            //       .title('Projects')
            //       .items([
            //         S.listItem()
            //           .title('Documents')
            //           .child(
            //             S.documentList()
            //               .title('Document')
            //               .filter('_type == "project.document"')
            //           ),
            //         S.listItem()
            //           .title('Categories')
            //           .child(
            //             S.documentList()
            //               .title('Category')
            //               .filter('_type == "project.category"')
            //           ),
            //         S.listItem()
            //           .title('Tags')
            //           .child(
            //             S.documentList()
            //               .title('Tag')
            //               .filter('_type == "project.tag"')
            //           ),
            //       ])
            //   ),

            // S.listItem()
            //   .title('Posts')
            //   .schemaType('post')
            //   .icon(() =>
            //     React.createElement(Icon, {
            //       icon: 'mdi:file-sign',
            //     })
            //   )
            //   .child(S.documentTypeList('post').title('Posts')),

            S.listItem()
              .title('Blog')
              .icon(() =>
                React.createElement(Icon, {
                  icon: 'mdi:newspaper-variant-outline',
                })
              )
              .child(
                S.list()
                  .title('Blog')
                  .items([
                    S.listItem()
                      .title('Posts')
                      .icon(() =>
                        React.createElement(Icon, {
                          icon: 'mdi:newspaper-variant-outline',
                        })
                      )
                      .child(S.documentTypeList('blog.post')),
                    S.listItem()
                      .title('Categories')
                      .icon(() =>
                        React.createElement(Icon, {
                          icon: 'mdi:shape-outline',
                        })
                      )
                      .child(S.documentTypeList('blog.category')),
                    S.listItem()
                      .title('Tags')
                      .icon(() =>
                        React.createElement(Icon, {
                          icon: 'mdi:tag-outline',
                        })
                      )
                      .child(S.documentTypeList('blog.tag')),
                  ])
              ),

            S.listItem()
              .title('Projects')
              .icon(() =>
                React.createElement(Icon, {
                  icon: 'mdi:code-braces-box',
                })
              )
              .child(
                S.list()
                  .title('Projects')
                  .items([
                    S.listItem()
                      .title('Projects')
                      .icon(() =>
                        React.createElement(Icon, {
                          icon: 'mdi:code-braces-box',
                        })
                      )
                      .child(S.documentTypeList('projects.project')),
                    S.listItem()
                      .title('Categories')
                      .icon(() =>
                        React.createElement(Icon, {
                          icon: 'mdi:shape-outline',
                        })
                      )
                      .child(S.documentTypeList('projects.category')),
                    S.listItem()
                      .title('Tags')
                      .icon(() =>
                        React.createElement(Icon, {
                          icon: 'mdi:tag-outline',
                        })
                      )
                      .child(S.documentTypeList('projects.tag')),
                  ])
              ),

            S.divider(),

            S.listItem()
              .title('Settings')
              .icon(() =>
                React.createElement(Icon, {
                  icon: 'mdi:cog',
                })
              )
              .child(
                S.list()
                  .title('Settings')
                  .items([
                    S.listItem()
                      .title('Main')
                      .id('settings.main')
                      .schemaType('settings.main')
                      .icon(() =>
                        React.createElement(Icon, {
                          icon: 'mdi:cog',
                        })
                      )
                      .child(
                        S.document()
                          .schemaType('settings.main')
                          .documentId('settings.main')
                          .title('Main')
                      ),
                    S.listItem()
                      .title('Navigation')
                      .schemaType('settings.navigation')
                      .icon(() =>
                        React.createElement(Icon, {
                          icon: 'mdi:navigation-variant-outline',
                        })
                      )
                      .child(
                        S.document()
                          .schemaType('settings.navigation')
                          .documentId('settings.navigation')
                          .title('Navigation')
                      ),
                    S.listItem()
                      .title('Meta')
                      .schemaType('settings.meta')
                      .icon(() =>
                        React.createElement(Icon, {
                          icon: 'mdi:web',
                        })
                      )
                      .child(
                        S.document()
                          .schemaType('settings.meta')
                          .documentId('settings.meta')
                          .title('Meta')
                      ),

                    S.divider(),

                    S.listItem()
                      .title('Imprint')
                      .icon(() =>
                        React.createElement(Icon, {
                          icon: 'mdi:scale-balance',
                        })
                      )
                      .child(
                        S.document()
                          .schemaType('singleton.imprint')
                          .documentId('singleton.imprint')
                          .title('Imprint')
                      ),
                    S.listItem()
                      .title('Privacy')
                      .icon(() =>
                        React.createElement(Icon, {
                          icon: 'ic:outline-privacy-tip',
                        })
                      )
                      .child(
                        S.document()
                          .schemaType('singleton.privacy')
                          .documentId('singleton.privacy')
                          .title('Privacy')
                      ),
                  ])
              ),

            ...S.documentTypeListItems().filter(
              (listItem) =>
                ![
                  'projects.project',
                  'projects.category',
                  'projects.tag',
                  'blog.post',
                  'blog.category',
                  'blog.tag',
                  'settings.main',
                  'settings.navigation',
                  'settings.meta',
                  'singleton.home',
                  'singleton.imprint',
                  'singleton.privacy',
                ].includes(listItem.getId() as string)
            ),
          ]),
    }),
    markdownSchema(),
    codeInput(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
