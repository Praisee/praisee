module.exports = function healthCheckRoute(app: IApp) {
    app.get('/i/health-check', function(request, response) {
        response.send('success');
    });
};
