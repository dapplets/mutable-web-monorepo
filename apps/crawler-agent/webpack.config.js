const webpack = require('webpack')
const path = require('path')

const config = {
  entry: './dist/node/inpage.js',
  output: {
    path: path.resolve(__dirname, 'dist/inpage'),
    filename: 'index.js',
  },
  resolve: {
    fallback: {
      events: path.resolve(__dirname, 'node_modules/events')
    }
  }
}

module.exports = config
