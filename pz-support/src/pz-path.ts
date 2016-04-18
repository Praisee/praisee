export var pzPath: Function = require('pz-support/pz-path');

export default function pzBuildPath(pzModule, ...args) {
    return pzPath(pzModule, 'build', ...args);
};
