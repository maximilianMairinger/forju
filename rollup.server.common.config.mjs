import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'


export default {
  input: 'server/src/server.ts',
  output: {
    file: 'server/dist/server.js',
    format: 'cjs'
  },
  plugins: [
    typescript({tsconfig: "./tsconfig.server.json", noEmitOnError: false}), 
    resolve({modulesOnly: true, preferBuiltins: true}),
    commonJS({
      include: 'node_modules/**'
    }),
    json()
  ]
};
