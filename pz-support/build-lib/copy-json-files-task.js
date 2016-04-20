var copyJsonFiles = require('pz-builder/build-lib/copy-json-files-task');

module.exports = function(gulp) {
    return copyJsonFiles(gulp, 'pz-support', 'pzSupport:copyJsonFiles');
};

