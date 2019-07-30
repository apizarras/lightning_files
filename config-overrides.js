const packageJSON = require('./package.json');
const path = require('path');

module.exports = function override(config, env) {
  config.module.rules = [
    // salesforce dependencies
    // this will compile salesforce lightning as src, not as package
    {
      test: /\.jsx?$/,
      include: ['node_modules/@salesforce/design-system-react'].map(someDir =>
        path.resolve(process.cwd(), someDir)
      ),
      loader: require.resolve('babel-loader'),
      options: {
        presets: ['react-app']
      }
    }
  ].concat(config.module.rules);

  // don't split bundle
  config.optimization.splitChunks = {
    cacheGroups: {
      default: false
    }
  };
  // Move runtime into bundle instead of separate file
  config.optimization.runtimeChunk = false;

  // Entry Point for npm run build
  config.entry = path.join(__dirname, 'src', 'index-lightning.js');
  // Global Variable TO call from bundle
  config.output.library = `${packageJSON.name}`;
  // Universal Module Definition
  config.output.libraryTarget = 'umd';
  // JS
  config.output.filename = `${packageJSON.name}.resource`;
  // CSS. "5" is MiniCssPlugin
  config.plugins[5].options.filename = `${packageJSON.name}_style.resource.css`;

  return config;
};
