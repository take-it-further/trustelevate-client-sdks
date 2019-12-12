const path = require('path');

const browserConfig = {
  mode: 'production',
  entry: {
    app: path.resolve(__dirname, 'src', 'client', 'index.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "veripass.js"
  },
  module: {
    rules: [
      {test: /\.(js|jsx)$/, exclude: [/node_modules/], loader: "babel-loader"},
      // {
      //   test: /\.css$/,
      //   use: ['style-loader', 'css-loader']
      // },
      // {
      //   test: /\.(jpg|svg|png)$/,
      //   use: ['file-loader']
      // }
    ]
  },
  resolve: {
    modules: [__dirname, 'node_modules'],
    extensions: ['*','.js','.jsx']
  }
};

module.exports = [browserConfig];