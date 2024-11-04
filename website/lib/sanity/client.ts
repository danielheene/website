import { createClient, SanityClient } from 'next-sanity';

const sanityConfig = (() => {
  if (!process.env.SANITY_AUTH_TOKEN) {
    throw Error('The API Token is not set. Check your environment variables.');
  }

  return {
    dataset: process.env.SANITY_STUDIO_DATASET || 'development',
    apiVersion: process.env.SANITY_STUDIO_API_VERSION || '2021-10-21',
    projectId: 'ekrchhx4',
    token: process.env.SANITY_AUTH_TOKEN,
    useCdn: process.env.NODE_ENV === 'production',
  };
})();

export const defaultClient: SanityClient = createClient(sanityConfig);
export const previewClient: SanityClient = createClient({
  ...sanityConfig,
  useCdn: false,
});

export const getClient = (usePreview: boolean = false): SanityClient =>
  usePreview ? previewClient : defaultClient;
