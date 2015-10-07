'use strict';

var types = require('tau/models/board.customize.units/const.entity.types.names');
var sizes = require('tau/models/board.customize.units/const.card.sizes');
var openUnitEditor = require('tau/models/board.customize.units/board.customize.units.interaction').openUnitEditor;

var configuratorHelper = require('./configurator');

var shallowCopy = function(source) {

    return Object.keys(source || {}).reduce(function(res, key) {

        res[key] = source[key];

        return res;

    }, {});

};

var add = function(sourceUnit) {

    var unit = shallowCopy(sourceUnit);

    unit.types = unit.types || [
        types.ANY_TYPE
    ];
    unit.sizes = unit.sizes || Object.keys(sizes).map(function(k) {

        return sizes[k];

    });

    return configuratorHelper
        .getAppConfigurator()
        .then(function(configurator) {

            var registry = configurator.getUnitsRegistry();

            if (!unit.id) {

                throw new Error('Field "id" is required for custom unit config');

            }

            if (registry.units[unit.id]) {

                throw new Error('Custom unit with id "' + unit.id + '" has been already registered');

            }

            unit.name = unit.name || unit.id;

            unit.model = (unit.model || unit.sampleData) ? unit.model : {dummy: 1};

            if (typeof unit.model !== 'string' && typeof unit.model === 'object') {

                unit.model = Object.keys(unit.model).reduce(function(res, v) {

                    return res.concat(v + ':' + unit.model[v]);

                }, []).join(', ');

            }

            unit.sampleData = unit.sampleData || {};

            unit.template = (typeof sourceUnit.template === 'object') ? shallowCopy(unit.template) : (unit.template || {
                markup: ['<div class="tau-board-unit__value">' + unit.id + '</div>']
            });

            if (typeof unit.template === 'string') {

                unit.template = {
                    markup: [unit.template]
                };

            }

            if (typeof unit.template.markup === 'string') {

                unit.template.markup = [unit.template.markup];

            }

            if (unit.outerClassName) {

                unit.classId = unit.outerClassName;

            }

            if (unit.priority) {

                unit.priority = Number(unit.priority);

            }

            if (unit.isEditable) {

                unit.interactionConfig = {
                    isEditable: unit.isEditable
                };

                if (unit.editorHandler) {

                    unit.interactionConfig.handler = unit.editorHandler;

                } else {

                    unit.interactionConfig.handler = function(cardData, environment) {

                        var data = cardData.cardDataForUnit;
                        var editorComponentName = unit.editorComponentName instanceof Function ?
                            unit.editorComponentName(data) :
                            unit.editorComponentName;
                        var editor = openUnitEditor(editorComponentName, {});

                        if (unit.editorData) {

                            var cardDataForUnit = {};

                            Object.keys(unit.editorData).forEach(function(k) {

                                var v = unit.editorData[k];

                                cardDataForUnit[k] = v instanceof Function ? v(data) : data[v];

                            });

                            cardData.cardDataForUnit = cardDataForUnit;

                        }

                        return editor(cardData, environment);

                   };

                }

            }

            registry.units[unit.id] = registry.register([unit])[unit.id];

        });

};

module.exports = {
    types: types,
    sizes: sizes,
    add: add
};
