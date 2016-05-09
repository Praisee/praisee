export default function importJson(path) {
    return require(path.replace(/^(pz-[a-zA-Z0-9]+)/, '$1/build'));
}
