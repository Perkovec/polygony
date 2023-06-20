import { createFilter, build } from 'vite';
import { dataToEsm } from '@rollup/pluginutils';

const filter = createFilter([
  '**/*.js?rawBundle',
  '**/*.ts?rawBundle',
]);

export default {
  name: 'vite-bundle-as-string',
  async transform(source, id) {
    if (!filter(id)) {
      return;
    }

    const res = await build({
      logLevel: 'silent',
      build: {
        lib: {
          entry: id,
          name: 'bundle',
          formats: ['es'],
        },
        write: false,
        rollupOptions: {
          external: ['./model.js'],
        },
      },
    });

    if (Array.isArray(res)) {
      const output = res[0].output[0].code;
      return dataToEsm(output);
    }
  },
};
