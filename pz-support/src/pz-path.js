var path = require('path');

module.exports = function join() {
    var pzModule = require.resolve(arguments[0]);
    
    if (arguments.length < 2) {
        return path.join(pzModule, '../');
    }
    
    var parts = Array.prototype.slice.call(arguments, 1);
    
    return path.join.apply(path, [pzModule, '../'].concat(parts));
};