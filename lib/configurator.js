'use strict';

var configurator = require('tau/configurator');
var $ = require('jQuery');

var appConfiguratorDef = new $.Deferred();

configurator.getGlobalBus().once('configurator.ready', function(e, res) {

    appConfiguratorDef.resolve(res);

});

var getAppConfigurator = function getAppConfigurator() {

    return appConfiguratorDef.promise();

};

module.exports = {
    getAppConfigurator: getAppConfigurator
};
