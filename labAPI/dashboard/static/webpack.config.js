const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const mode = 'development'

const config = {
    entry:  __dirname + '/js/index.jsx',
    devtool: mode === 'production' ? false : 'source-map',
    output: {
        path: __dirname + '/dist',
        filename: 'bundle.js',
        library: 'index',
        libraryTarget: 'var'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    },
    mode: mode,
    module: {
      rules: [
        {
          test: /\.jsx?/,
          exclude: /node_modules/,
          use: 'babel-loader'
        }
      ]
    },
    plugins: [
      new BundleAnalyzerPlugin({analyzerPort: 4200})
    ]

};
module.exports = config;
