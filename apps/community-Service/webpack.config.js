const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const path = require('path'); // full import for both join and resolve

module.exports = {
  output: {
    path: path.join(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      '@packages': path.resolve(__dirname, '../../packages'),
    },
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
