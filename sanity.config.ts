import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemas';

export default defineConfig({
  name: 'default',
  title: 'ANV Apparel CMS Studio',

  // Fallback to demo values if env vars are not set during studio execution
  projectId: 'your-sanity-project-id',
  dataset: 'production',

  plugins: [
    structureTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
