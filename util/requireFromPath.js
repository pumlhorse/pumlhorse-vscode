var requireFromPath = require('pumlhorse/util/requireFromPath');
var resolvedPath = require.resolve('pumlhorse/util/requireFromPath');

require.cache[resolvedPath] = requireFromPathWrapper;

var _cachedModules = {};
function requireFromPathWrapper(moduleName, directory) {
    _cachedModules[moduleName] = true;

    return requireFromPath(moduleName, directory);
}

function clearCache() {
    for (var x in _cachedModules) {
        delete require.cache[x];
    }
    _cachedModules = {};
}

module.exports = {
    clear: clearCache
};