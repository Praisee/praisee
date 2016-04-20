var buildSources = require('pz-builder/build-lib/dev-build-sources-task');

module.exports = function(gulp) {
    return buildSources(gulp, 'pz-support', 'pzSupport:dev:buildSources');
};
