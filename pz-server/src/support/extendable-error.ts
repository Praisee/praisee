var captureStackTrace = (Error as any).captureStackTrace;

export default class ExtendableError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        if (typeof captureStackTrace === 'function') {
            captureStackTrace.call(Error, this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}
