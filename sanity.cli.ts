import { defineCliConfig } from 'sanity/cli';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || '894fyinb';
const dataset = process.env.SANITY_STUDIO_DATASET || process.env.VITE_SANITY_DATASET || 'production';

export default defineCliConfig({
  api: {
    projectId: projectId,
    dataset: dataset
  },
  // Tambahkan baris deployment di bawah sini:
  deployment: {
    appId: 'ov39y534uiudw71i0w26ju33'
  }
});
