import bootConfig from 'pz-server/src/boot-config';
import routesMiddleware from 'pz-server/src/middleware/routes';
import staticAssetsMiddleware from 'pz-server/src/middleware/static-assets';

var loopback = require('loopback');
var boot = require('loopback-boot');
var consolidate = require('consolidate');

var app: IApp = loopback();

app.domain = {};

app.engine('hbs', consolidate.handlebars);
app.set('view engine', 'hbs');
app.set('views', __dirname);

staticAssetsMiddleware(app);
routesMiddleware(app);

app.start = function () {
    // start the web server
    return app.listen(function () {
        app.emit('started');
        var baseUrl = app.get('url').replace(/\/$/, '');
        console.log('Web server listening at: %s', baseUrl);
        if (app.get('loopback-component-explorer')) {
            var explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, bootConfig, function (error: TError) {
    if (error) {
        console.error('Boot failed', error);
        throw error;
    }

    app.start();
});
