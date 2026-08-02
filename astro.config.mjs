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

  server: {
    host: '0.0.0.0'
  },

  security: {
    // Trust X-Forwarded-Proto/Host from Railway's proxy for these hosts;
    // without this the CSRF origin check sees http:// and rejects form POSTs.
    allowedDomains: [
      { hostname: 'localhost' },
      { hostname: '127.0.0.1' },
      { hostname: '**.up.railway.app', protocol: 'https' }
    ]
  },

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