export var pzPath: Function = require('pz-support/pz-path');

export function pzBuildPath(pzModule, ...args) {
    return pzPath(pzModule, 'build', ...args);
}

export default pzBuildPath;
