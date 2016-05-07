var transpile = require('pz-builder/build-lib/dev-build-sources-task');

module.exports = function(gulp) {
    return transpile(gulp, 'pz-client', 'pzClient:transpile');
};
