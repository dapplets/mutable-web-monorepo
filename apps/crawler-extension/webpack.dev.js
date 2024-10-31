const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = merge(common, {
  mode: 'development',
  devtool: 'source-map', // Use `false` for quick rebuild
  plugins: [
    new webpack.DefinePlugin({
      EXTENSION_ENV: JSON.stringify('development'),
    }),
    // create empty common.js
    // optimization in dev mode is disabled
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'manifest.json',
          to: 'common.js',
          transform: () => '',
        },
      ],
    }),
  ],
  optimization: {
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
})
