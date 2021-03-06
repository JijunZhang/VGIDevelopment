import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default {
  entry: './src/server.js',
  format: 'iife',
  dest: './dist/bundle.js',
  moduleName: 'test', // rename into you own project namespace
  plugins: [
    resolve(),
    babel({
            // exclude: 'node_modules/**'
    })]
}
