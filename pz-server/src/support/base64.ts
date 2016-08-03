export function fromBase64(base64String: string): string {
    return ((new Buffer(base64String, 'base64')).toString('ascii'));
}

export function toBase64(string: string): string {
    return ((new Buffer(string, 'ascii')).toString('base64'));
}
