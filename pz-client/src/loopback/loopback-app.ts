var loopback = require('loopback');
var loopbackBoot = require('loopback-boot');
import bootConfig from 'pz-client/src/loopback/boot-config';

var app = module.exports = loopback();
loopbackBoot(app, bootConfig);
