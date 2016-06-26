import pzPath from 'pz-support/src/pz-path';

var consolidate = require('consolidate');

module.exports = function setupTemplateRenderer(app: IApp) {
    app.engine('hbs', consolidate.handlebars);
    app.set('view engine', 'hbs');
    app.set('views', pzPath('pz-server', 'src'));
};
