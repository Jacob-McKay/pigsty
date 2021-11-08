// For instructions about this file refer to
// webpack and webpack-hot-middleware documentation
var webpack = require('webpack');
const path = require('path');

module.exports = {
  entry: {
    main: './src/main.ts',
    components: './src/components/index.ts',
  },
   devtool: 'inline-source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  externals: {
    snapsvg: 'Snap',
  }, 
  output: {
    path: path.join(__dirname, 'app'),
    publicPath: '/',
    filename: 'dist/[name].bundle.js',
  },
  plugins: [new webpack.NoEmitOnErrorsPlugin()],
};