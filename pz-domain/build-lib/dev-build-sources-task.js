var buildSources = require('pz-builder/build-lib/dev-build-sources-task');

module.exports = function(gulp) {
    return buildSources(gulp, 'pz-domain', 'pzDomain:dev:buildSources');
};
