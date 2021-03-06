/*global before, describe, afterEach, it, assert*/
'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');

var register = sinon.spy(function(units) {
    var registered = {};

    units.forEach(function(unit) {
        registered[unit.id] = unit;
    });

    return registered;
});

var configurator = {
    getUnitsRegistry: sinon.spy(function() {
        return {
            units: {
                foo: {}
            },
            register: register
        };
    })
};

var proxyquire = require('proxyquire').noCallThru();
var customUnits = proxyquire('../lib/customUnits', {
    jQuery: {
        Deferred: function() {
            var resolvePromise;
            var rejectPromise;
            var promise = new Promise(function(resolve, reject) {
                resolvePromise = resolve;
                rejectPromise = reject;
            });

            return {
                resolve: function(data) {
                    resolvePromise(data);
                    return promise;
                },
                reject: function(data) {
                    rejectPromise(data);
                    return promise;
                }
            };
        }
    },
    './configurator': {
        getAppConfigurator: function() {
            return Promise.resolve(configurator);
        }
    },

    'tau/models/board.customize.units/const.entity.types.names': {
        ANY_TYPE: 'any',
        BUG: 'bug'
    },

    'tau/models/board.customize.units/const.card.sizes': {
        small: 'small',
        big: 'big'
    },

    'tau/models/board.customize.units/board.customize.units.interaction': {
        openUnitEditor: function() {
        }
    }
});

before(function() {
    process.on('unhandledRejection', function(err) {
        throw err;
    });
});

describe('.customUnits', function() {
    afterEach(function() {
        register.reset();
    });

    describe('.add()', function() {
        it('must have id', function(next) {
            customUnits
                .add()
                .then(
                    function() {
                        assert.fail(0, 1, 'Promise should be rejected');
                    },
                    function(e) {
                        expect(e.message)
                            .to.be.eql('Field "id" is required for custom unit config');
                    }
                )
                .then(next, next);
        });

        it('must have unique id', function(next) {
            customUnits
                .add({
                    id: 'foo'
                })
                .then(
                    function() {
                        assert.fail(0, 1, 'Promise should be rejected');
                    },
                    function(e) {
                        expect(e.message)
                            .to.be.eql('Custom unit with id "foo" has been already registered');
                    }
                )
                .then(next, next);
        });

        it('generates minimal default data for unit', function(next) {
            customUnits
                .add({
                    id: 'bar'
                })
                .then(function() {
                    expect(register)
                        .to.be.calledOnce;

                    expect(register.firstCall.args)
                        .to.have.length(1);

                    expect(register.firstCall.args[0])
                        .to.be.eql([{
                        id: 'bar',
                        name: 'bar',
                        template: {
                            markup: [
                                '<div class="tau-board-unit__value">bar</div>'
                            ]
                        },
                        model: 'dummy:1',
                        sampleData: {},
                        types: ['any'],
                        sizes: ['small', 'big']
                    }]);
                })
                .then(next, next);
        });

        it('processes unit data', function(next) {
            customUnits
                .add({
                    id: 'bar',
                    name: 'Bar Field',
                    template: {
                        markup: '<div class="tau-board-unit__value"><%= this.data.foo %></div>'
                    },
                    model: {
                        foo: 'foo',
                        bar: 'bar'
                    },
                    sampleData: {
                        foo: 'sample',
                        bar: 'sample'
                    },
                    types: ['bug'],
                    sizes: ['big']
                })
                .then(function() {
                    expect(register.firstCall.args[0])
                        .to.be.eql([{
                        id: 'bar',
                        name: 'Bar Field',
                        template: {
                            markup: [
                                '<div class="tau-board-unit__value"><%= this.data.foo %></div>'
                            ]
                        },
                        model: 'foo:foo, bar:bar',
                        sampleData: {
                            foo: 'sample',
                            bar: 'sample'
                        },
                        types: ['bug'],
                        sizes: ['big']
                    }]);

                })
                .then(next, next);
        });

        it('processes editable unit data', function(next) {
            customUnits
                .add({
                    id: 'bar',
                    model: {
                        foo: '"Hello"'
                    },
                    isEditable: true,
                    editor: 'text',
                    editorData: {
                        text: 'text'
                    }
                })
                .then(function() {
                    expect(register.firstCall.args[0][0].interactionConfig.isEditable)
                        .to.be.true;
                    expect(register.firstCall.args[0][0].interactionConfig.handler)
                        .to.be.instanceOf(Function);
                })
                .then(next, next);
        });

        it('processes priority', function(next) {
            customUnits
                .add({
                    id: 'bar',
                    priority: -10000
                })
                .then(function() {
                    expect(register.firstCall.args[0][0].priority)
                        .to.be.equal(-10000);
                })
                .then(next, next);
        });

        it('passes any additional fields', function(next) {
            customUnits
                .add({
                    id: 'bar',
                    something: 'wow'
                })
                .then(function() {
                    expect(register.firstCall.args[0][0].something)
                        .to.be.equal('wow');
                })
                .then(next, next);
        });
    });
});
