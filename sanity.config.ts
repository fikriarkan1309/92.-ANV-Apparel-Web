import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemas';

// Fallback is helpfully structured to support environment variables during local or cloud builds
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || '894fyinb';
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.VITE_SANITY_DATASET || 'production';

export default defineConfig({
  name: 'default',
  title: 'ANV Apparel CMS Studio',

  projectId: projectId,
  dataset: dataset,

  plugins: [
    structureTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});

