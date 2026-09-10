import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  optimizeDeps: {
    noDiscovery: true,
    entries: ['index.html', 'src/irradiance/worker.js'],
    include: [
      'three-mesh-bvh',
      'three',
      'react',
      'react-dom/client',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'lucide-react',
      'zod',
    ],
  },
  server: {
    watch: { ignored: ['**/archive/**'] },
    fs: { deny: ['**/.git/**', '**/archive/**', '**/.env*'] },
  },
  worker: { format: 'es' },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.endsWith('/src/data/crop-catalog.json')) return 'crop-catalog';
          if (id.endsWith('/three/build/three.core.js')) return 'three-core';
          if (id.endsWith('/three/build/three.module.js')) return 'three-renderer';
          if (id.includes('/three-mesh-bvh/')) return 'mesh-bvh';
        },
      },
    },
  },
});
