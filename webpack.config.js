const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD_VERSION = NODE_ENV === 'production';
const IS_DEV_VERSION = NODE_ENV === 'development';
const OUTPUT_PATH = path.join(__dirname, 'dist');
const SRC_DIR = path.join(__dirname, 'src');
const VENDOR_DIR = path.join(__dirname, 'vendor');
const TEMPLATES_DIR = path.join(__dirname, 'html');
const NODE_MODULES_DIR = path.join(__dirname, 'node_modules');

let config = {
  context: SRC_DIR,
  entry: './index.ts',
  output: {
    path: OUTPUT_PATH,
    filename: 'index.js',
    library: "TESTS",
    libraryTarget: "umd"
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV)
      }
    }),
    new HtmlWebpackPlugin({
      filename: path.join(OUTPUT_PATH, 'index.html'),
      template: path.join(TEMPLATES_DIR, 'index.ejs'),
      favicon: 'favicon.ico',
      inject: 'body',
      title: 'MST performance test',
      cache: false
    })
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [NODE_MODULES_DIR],
        include: [SRC_DIR, VENDOR_DIR],
        use: {
          loader: "ts-loader"
        }
      }
    ]
  },
  resolve: {
    modules: [SRC_DIR, VENDOR_DIR, NODE_MODULES_DIR],
  },
  resolveLoader: {
    modules: [NODE_MODULES_DIR]
  },

};

if (IS_DEV_VERSION) {
  config.devtool = 'cheap-source-map';
}

if (IS_PROD_VERSION) {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    output: {
      comments: false
    }
  }));
}

module.exports = config;
