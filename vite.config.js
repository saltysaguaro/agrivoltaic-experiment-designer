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
    rollupOptions: { output: { manualChunks: { three: ['three', 'three-mesh-bvh'] } } },
  },
});
