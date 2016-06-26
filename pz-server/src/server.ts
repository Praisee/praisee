import defaultBootConfig from 'pz-server/src/boot-config';
import promisify from 'pz-support/src/promisify';

var loopback = require('loopback');
var loopbackBoot = require('loopback-boot');

export default class PzServer {
    bootConfig: {};
    app: IApp = loopback();
    listener = null;
    
    private _hasBooted = false;
    private _hasStartedWebServer = false;
    
    constructor(bootConfig = defaultBootConfig) {
        this.bootConfig = bootConfig;
        this.app.services = {};
        this.app.start = this.startWebServer.bind(this);
    }

    /**
     * Bootstrap the application, configure models, datasources and middleware.
     * Sub-apps like REST API are mounted via boot scripts.
     */
    boot() {
        return (promisify(loopbackBoot)(this.app, this.bootConfig)
            .then(() => {
                this._hasBooted = true;
            })
            .catch(error => {
                console.error('Boot failed', error);
                throw error;
            })
        );
    }
    
    startWebServer() {
        if (!this._hasBooted) {
            throw new Error('Server must be booted first');
        }
        
        // start the web server
        this.listener = this.app.listen(() => {
            this._hasStartedWebServer = true;
            this.app.emit('started');
            var baseUrl = this.app.get('url').replace(/\/$/, '');
            
            console.log('Web server listening at: %s', baseUrl);
            
            if (this.app.get('loopback-component-explorer')) {
                var explorerPath = this.app.get('loopback-component-explorer').mountPath;
                console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
            }
        });
        
        return this.listener;
    }

    /**
     * Boot the server and start the web server.
     */
    start() {
        this.boot().then(() => this.startWebServer());
    }
    
    stop() {
        if (this._hasStartedWebServer) {
            this.listener.close();
        }
    }
}
