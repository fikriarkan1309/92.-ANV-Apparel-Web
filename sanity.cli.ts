import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: 'your-sanity-project-id',
    dataset: 'production'
  }
});
