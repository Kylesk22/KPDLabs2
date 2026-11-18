const path = require('path');
const webpack = require('webpack');
module.exports = {
  mode: 'development', devtool: false, entry: './tests/preview_entry.js',
  output: { path: path.resolve(__dirname, '../.preview'), filename: 'preview.js' },
  module: { rules: [
    { test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' },
    { test: /\.css$/, use: ['style-loader', 'css-loader'] }
  ] },
  plugins: [new webpack.DefinePlugin({ 'process.env.BACKEND_URL': JSON.stringify('/api') })]
};
