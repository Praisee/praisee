export class BadRequestError {
    constructor(message) {
        this.message = message;
    }
}

export class NotFoundError {
    constructor(message) {
        this.message = message;
    }
}

export function runOrSendError(callback) {
    console.log('1');
    return (req, res) => {
        try {
            console.log('2');
            callback(req, res);
            console.log('2.1');
        }
        catch (error) {
            console.log('3');
            if (error instanceof BadRequestError) {
                return res.status(400).send({ error: error.message });
            }
            console.log('3.1');
            if (error instanceof NotFoundError) {
                return res.status(404).send({ error: error.message });
            }
            console.log('3.2');
            return res.status(500).send({ error: error });
        }
    }
}