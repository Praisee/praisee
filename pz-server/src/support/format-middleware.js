// Example taken from:
// https://github.com/expressjs/express/blob/master/examples/content-negotiation/index.js

export default function formatMiddleware(handler) {
    return (request, response) => {
        return response.format(handler(request, response));
    }
};