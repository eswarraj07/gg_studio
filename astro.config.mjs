// @ts-check
import "dotenv/config";
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import node from '@astrojs/node';
import fs from 'fs';
import path from 'path';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  vite: {
    plugins: [tailwindcss()]
  },

  adapter: node({
    mode: 'standalone'
  }),

  integrations: [
    {
      name: 'copy-data-folder',
      hooks: {
        'astro:build:done': ({ dir }) => {
          const dataSource = path.join(process.cwd(), 'data');
          const dataDest = path.join(dir.pathname, '..', 'data');

          if (fs.existsSync(dataSource)) {
            if (!fs.existsSync(dataDest)) {
              fs.mkdirSync(dataDest, { recursive: true });
            }
            fs.cpSync(dataSource, dataDest, { recursive: true, force: true });
            console.log('✓ Copied data folder to build output');
          }
        }
      }
    }
  ]
});