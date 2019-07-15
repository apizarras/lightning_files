const fs = require('fs');
const packageJSON = require('./package.json');

// destination.txt will be created or overwritten by default.
fs.copyFile(
  `build/${packageJSON.name}.resource.js`,
  `${packageJSON['deploy-path']}/${packageJSON.name}.resource`,
  err => {
    if (err) throw err;
    console.log(
      `build/${packageJSON.name}.resource.js was copied to ${
        packageJSON['deploy-path']
      }/${packageJSON.name}.resource`
    );
  }
);

fs.copyFile(
  `build/${packageJSON.name}_style.resource.css`,
  `${packageJSON['deploy-path']}/${packageJSON.name}_style.resource`,
  err => {
    if (err) throw err;
    console.log(
      `build/${packageJSON.name}_style.resource.css was copied to ${
        packageJSON['deploy-path']
      }/${packageJSON.name}_style.resource`
    );
  }
);
