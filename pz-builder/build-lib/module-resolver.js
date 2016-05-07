module.exports = function resolveModule(source) {
    return source.replace(/^(pz-[a-zA-Z0-9]+)/, '$1/build');
};
