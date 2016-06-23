module.exports = function resolveModule(source) {
    if (/node_modules/.test(source)) {
        // Skip rewriting dependencies in node_module, these will not be transpiled
        return source;
    }
    
    return source.replace(/^(pz-[a-zA-Z0-9]+)/, '$1/build');
};
