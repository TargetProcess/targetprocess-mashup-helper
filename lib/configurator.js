'use strict';

var configurator = require('tau/configurator');
var $ = require('jQuery');

var appConfiguratorDef = new $.Deferred();

configurator.getGlobalBus().on('configurator.ready', function(e, res) {

    /* eslint-disable no-underscore-dangle*/
    if (res._id && !res._id.match(/global/)) {

        appConfiguratorDef.resolve(res);

    }
    /* eslint-enable no-underscore-dangle*/

});

var getAppConfigurator = function getAppConfigurator() {

    return appConfiguratorDef.promise();

};

module.exports = {
    getAppConfigurator: getAppConfigurator
};
