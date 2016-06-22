var getBabelRelayPlugin = require('babel-relay-plugin');
var paths = require('pz-client/build-lib/paths');
var schema = require(paths.relaySchema());

module.exports = getBabelRelayPlugin(schema.data);
