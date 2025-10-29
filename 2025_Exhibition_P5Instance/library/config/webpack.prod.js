const path = require('./paths')
const { merge } = require('webpack-merge')
const common = require('./webpack.common')
const fs = require('fs')
const nodePath = require('path')

class CopyBuildPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('CopyBuildPlugin', () => {
      const src = compiler.options.output.path
      const dest = path.build2 || nodePath.resolve(src + '2')
      try {
        // remove previous dest (safe) and copy build
        fs.rmSync(dest, { recursive: true, force: true })
        fs.cpSync(src, dest, { recursive: true })
        console.log(`[CopyBuildPlugin] Copied build from "${src}" to "${dest}"`)
      } catch (err) {
        console.error(`[CopyBuildPlugin] Failed to copy build to "${dest}":`, err)
      }
    })
  }
}

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  output: {
    path: path.build,
    publicPath: '/',
  },
  optimization: {
    minimize: true,
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  plugins: [
    new CopyBuildPlugin()
  ]
})
