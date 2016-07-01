var path = require('path');

module.exports = function join() {
    var pzModuleName = arguments[0];
    
    var pzModule = pzModuleName === 'pz-root' ? __dirname : require.resolve(pzModuleName);
    
    if (arguments.length < 2) {
        return path.join(pzModule, '../');
    }
    
    var parts = Array.prototype.slice.call(arguments, 1);
    
    return path.join.apply(path, [pzModule, '../'].concat(parts));
};
