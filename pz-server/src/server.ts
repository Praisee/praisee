import bootConfig from 'pz-server/src/boot-config';
import routesMiddelware from 'pz-server/src/middleware/routes';
import staticAssetsMiddelware from 'pz-server/src/middleware/static-assets';

var loopback = require('loopback');
var boot = require('loopback-boot');

var app = loopback();

routesMiddelware(app);
staticAssetsMiddelware(app);

app.start = function() {
    // start the web server
    return app.listen(function() {
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
boot(app, bootConfig, function(error: {message: string}) {
    if (error) {
        throw error;
    }

    app.start();
});
