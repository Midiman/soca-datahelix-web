import { defineConfig } from 'vite'
import path from 'path'
import { resolve } from "path"
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': {}
  },
  optimizeDeps: {
	entries: ['src/index.jsx'],
	include: ['react', 'react-dom'],
	exclude: ['monaco-editor', 'aws-sdk', 'firebase', 'three', '@mui/icons-material']
  },  
  base: '',
  server: {
	host: '0.0.0.0',
	port: 1600,
	https: false,
    fs: {
      strict: true,
      exclude: ['archive', 'node-red']
    }
  },
  resolve: {
	preserveSymlinks: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  plugins: [react({
    fastRefresh: false
  })],
  build: {
    sourcemap: false,
    target: 'modules',
    chunkSizeWarningLimit: 100,
    rollupOptions: {
	  external: [ 'public/Runtime.js','Runtime.js' ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      },
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        warn(warning);
      },
    },
//	minify: 'none',
	minify: 'terser',
	terserOptions: {
      format: {
        comments: false
      }
    }
  },
  esbuild: { legalComments: 'none' }
})

