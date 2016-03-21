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
    return (req, res) => {
        
        return callback(req, res).catch((error) => {
                if (error instanceof BadRequestError) {
                    return res.status(400).send({ error: error.message });
                }
                if (error instanceof NotFoundError) {
                    return res.status(404).send({ error: error.message });
                }
                return res.status(500).send({ error: error });
            }
        );
    }
}