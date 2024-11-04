import { createCliConfig } from 'sanity/cli';

export default createCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_API_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_API_DATASET || 'development',
  },
});
