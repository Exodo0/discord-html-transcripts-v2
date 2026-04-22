import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  splitting: false,
  treeshake: true,
  // TSX/JSX support
  esbuildOptions(options) {
    options.jsx = 'transform';
    options.jsxFactory = 'React.createElement';
    options.jsxFragment = 'React.Fragment';
    // Make sure we inline React import for the CJS output
    options.define = {
      ...options.define,
    };
  },
  // These are peerDependencies or optionalDependencies — don't bundle them
  external: [
    'discord.js',
    'react',
    'react-dom',
    'react-dom/static',
    '@derockdev/discord-components-core',
    '@derockdev/discord-components-core/hydrate',
    '@derockdev/discord-components-react',
    'sharp',
  ],
  banner: {
    js: '/* discord-html-transcripts-v2 v4 — https://github.com/Exodo0/discord-html-transcripts-v2 */',
  },
});
