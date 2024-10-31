const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = merge(common, {
  mode: 'production',
  optimization: {
    // splitChunks: {
    //   chunks(chunk) {
    //     // exclude `inpage`
    //     return chunk.name !== 'inpage'
    //   },
    //   name: 'common',
    // },
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        parallel: true,
        // fixes codemirror
        // https://stackoverflow.com/questions/49979397/chrome-says-my-content-script-isnt-utf-8
        terserOptions: {
          ecma: 6,
          output: {
            ascii_only: true,
          },
        },
      }),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      EXTENSION_ENV: JSON.stringify('production'),
    }),
  ],
})
