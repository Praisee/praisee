module.exports = function healthCheckRoute(app: IApp) {
    app.get('/i/web-health', function(request, response) {
        response.send('success');
    });
};
