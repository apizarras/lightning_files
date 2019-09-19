const fs = require('fs-extra');
const packageJSON = require('./package.json');
const destination = packageJSON['deploy-path'];
const bundleName = packageJSON.name;

console.log('Copying resources to ' + destination);

fs.copySync('build', destination, {
  filter: file => {
    if (file === 'build' || !!~file.indexOf(bundleName)) {
      console.log('copying ' + file);
      return true;
    }
  }
});

console.log('Done');
