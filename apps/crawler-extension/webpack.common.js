const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const package = require('./package.json')
const webpack = require('webpack')

function modifyManifest(buffer) {
  const manifest = JSON.parse(buffer.toString())

  manifest.version = package.version.replace(/-.*/gm, '')
  manifest.version_name = package.version
  manifest.description = package.description
  manifest.author = package.author

  manifest_JSON = JSON.stringify(manifest, null, 2)
  return manifest_JSON
}

function handleInsertStyles(element) {
  // The similar code is in contentscript/index.ts
  const IS_OVERLAY_IFRAME = window.name.indexOf('dapplet-overlay') !== -1
  if (IS_OVERLAY_IFRAME) return

  const extensionHostID = 'dapplets-overlay-manager'
  let extensionHost = document.getElementById(extensionHostID)

  if (!extensionHost) {
    const CollapsedOverlayClass = 'dapplets-overlay-collapsed'
    const HiddenOverlayClass = 'dapplets-overlay-hidden'
    const DappletsOverlayManagerClass = 'dapplets-overlay-manager'
    const OverlayFrameClass = 'dapplets-overlay-frame'

    const panel = document.createElement(DappletsOverlayManagerClass)
    panel.id = 'dapplets-overlay-manager'
    panel.classList.add(OverlayFrameClass, CollapsedOverlayClass, HiddenOverlayClass)

    panel.attachShadow({ mode: 'open' })

    const container = document.createElement('div')
    container.id = 'dapplets-overlay-react-app'

    // Add style tag to shadow host
    panel.shadowRoot.appendChild(element)
    panel.shadowRoot.appendChild(container)
    document.body.appendChild(panel)
  } else {
    extensionHost.shadowRoot.appendChild(element)
  }
}

module.exports = {
  entry: {
    sidepanel: path.join(__dirname, 'src/sidepanel/index.tsx'),
    popup: path.join(__dirname, 'src/popup/index.tsx'),
    'service-worker': path.join(__dirname, 'src/background/index.ts'),
    contentscript: path.join(__dirname, 'src/contentscript/index.tsx'),
    options: path.join(__dirname, 'src/options/index.tsx'),
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: '[name].js',
    publicPath: '',
    chunkFormat: false,
  },
  module: {
    rules: [
      {
        include: path.resolve(__dirname, 'src'),
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
            options: {
              insert: handleInsertStyles,
            },
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                auto: (resourcePath) => resourcePath.endsWith('.module.scss'),
              },
            },
          },
          'sass-loader',
        ],
        include: path.resolve(__dirname, 'src/contentscript'),
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
        include: [path.resolve(__dirname, 'src'), /node_modules/],
      },
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.eot$/, /\.ttf$/, /\.woff$/, /\.woff2$/],
        type: 'asset/inline',
      },
      {
        test: /\.svg$/,
        oneOf: [
          {
            issuer: /\.tsx$/,
            use: ['@svgr/webpack', 'url-loader'],
          },
          {
            type: 'asset/inline',
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    fallback: {
      crypto: false,
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert-browserify'),
      http: false,
      https: false,
      zlib: false,
      'process/browser': false,
    },
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        'resources',
        {
          from: 'src/options/index.html',
          to: 'options.html',
        },
        {
          from: 'src/sidepanel/index.html',
          to: 'sidepanel.html',
        },
        {
          from: 'src/popup/index.html',
          to: 'popup.html',
        },
        {
          from: 'manifest.json',
          to: 'manifest.json',
          transform: (content) => modifyManifest(content),
        },
        {
          from: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
          to: 'bootstrap.min.css',
        },
      ],
    }),
    new webpack.DefinePlugin({
      EXTENSION_VERSION: JSON.stringify(package.version),
      DEFAULT_CRAWLER_API_URL: process.env.DEFAULT_CRAWLER_API_URL
        ? JSON.stringify(process.env.DEFAULT_CRAWLER_API_URL)
        : null,
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    new ForkTsCheckerWebpackPlugin(),
  ],
}
