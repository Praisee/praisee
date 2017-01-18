module.exports = function (app: IApp) {
    app.use((request, response, next) => {
        const host = request.headers.host || '';
        const hostParts = host.split(':');
        const hostname = hostParts[0] || '';

        if (!hostname.startsWith('praisee.com')) {
            return next();
        }

        const protocol = request.headers['x-forwarded-proto'] || request.protocol;
        const path = request.url;
        const canonicalUrl = `${protocol}://www.praisee.com${path}`;

        response.writeHead(301, {
            Location: canonicalUrl
        });

        response.end();
    });
};
