import path from 'node:path'
import { defineConfig, normalizePath } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const havokWasmPath = normalizePath(
  path.resolve(
    import.meta.dirname,
    './node_modules/@babylonjs/havok/lib/esm/HavokPhysics.wasm'
  )
)

export default defineConfig({
  base: './',
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: havokWasmPath,
          dest: normalizePath(
            path.resolve(import.meta.dirname, './public')
          )
        }
      ]
    })
  ],
  worker: {
    format: 'es'
  }
})
