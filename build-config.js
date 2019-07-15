//Needed if we are hosting on Visual Force Page.

const rewire = require('rewire');
const path = require('path');
const packageJSON = require('./package.json');
const defaults = rewire('react-scripts/scripts/build.js');
const config = defaults.__get__('config');

// Consolidate chunk files instead
config.optimization.splitChunks = {
  cacheGroups: {
    default: false
  }
};
// Move runtime into bundle instead of separate file
config.optimization.runtimeChunk = false;

// JS
config.output.filename = `${packageJSON.name}.resource.js`;
// Global Variable TO call from bundle
config.output.library = `${packageJSON.name}`;
// Universal Module Definition
config.output.libraryTarget = 'umd';
// CSS. "5" is MiniCssPlugin
config.plugins[5].options.filename = `${packageJSON.name}_style.resource.css`;
// Entry Point for npm run build
config.entry = path.join(__dirname, 'src', 'index-lightning.js');
