const path = require('path');

module.exports = {
  entry: { app: ['./frontend/src/index.js'] },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/js/',
    filename: '[name].js',
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  modules: 'false', // commonjs,amd,umd,systemjs,auto
                  useBuiltIns: 'usage',
                  targets: '> 0.25%, not dead',
                  corejs: 3,
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'file-loader',
        options: { name: 'static/[name].[ext]' },
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
    ],
  },
  mode: 'development',
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    port: 3000,
    host: 'localhost',
  },
};
