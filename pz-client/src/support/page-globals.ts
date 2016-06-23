export function getCachedRequestData() {
    try {
        return window['__praiseeData'] && window['__praiseeData'].cachedRequestData;
    } catch(error) {
        return null;
    }
}
