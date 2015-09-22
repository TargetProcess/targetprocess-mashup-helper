'use strict';

var expect = require('chai')
    .expect;

var sinon = require('sinon');
var getBusRegistry = sinon.spy(function() {});
var globalBusFire = sinon.spy(function() {});
var globalBus = {
    fire: globalBusFire
};
var getGlobalBus = sinon.spy(function() {

    return globalBus;

});

var proxyquire = require('proxyquire').noCallThru();
var debug = proxyquire('../lib/debug', {
    'tau/configurator': {
        getBusRegistry: getBusRegistry,
        getGlobalBus: getGlobalBus
    }
});

before(function() {

    process.on('unhandledRejection', function(err) {

        throw err;

    });

});

describe('.debug', function() {

    afterEach(function() {

        getBusRegistry.reset();

    });

    it('calls getBusRegistry on init', function() {

        expect(getBusRegistry.callCount)
            .to.be.equal(1);
        expect(getGlobalBus.callCount)
            .to.be.equal(0);

    });

    it('has API', function() {

        expect(debug)
            .to.have.keys('showComponentsNames', 'logBus');

    });

    describe('logBus()', function() {

        it('logs selected bus', function() {

            var logger = sinon.spy();

            debug.logBus('some bus', logger);

            globalBus.fire('afterRender', 42, {
                name: 'some bus'
            });

            globalBus.fire('afterRender', 42, {
                name: 'another bus'
            });

            globalBus.fire('afterRenderAll', 43, {
                id: 'some bus'
            });

            expect(getGlobalBus.callCount)
                .to.be.equal(1);
            expect(logger.callCount)
                .to.be.equal(2);
            expect(logger.getCall(0).args)
                .to.be.eql([
                    'some bus',
                    'afterRender',
                    42
                ]);
            expect(logger.getCall(1).args)
                .to.be.eql([
                    'some bus',
                    'afterRenderAll',
                    43
                ]);

            getGlobalBus.reset();
            globalBusFire.reset();

        });

        it('logs all buses', function() {

            var consoleLogSpy = sinon.stub(console, 'log', function() {});

            debug.logBus();

            globalBus.fire('afterRender', 42, {
                name: 'some bus'
            });

            globalBus.fire('afterRender', 42, {
                name: 'another bus'
            });

            globalBus.fire('afterRenderAll', 43, {
                name: 'some bus'
            });

            expect(consoleLogSpy.callCount)
                .to.be.equal(3);
            expect(consoleLogSpy.getCall(0).args)
                .to.be.eql([
                    'LOG BUS',
                    'some bus',
                    'afterRender',
                    42
                ]);

            consoleLogSpy.restore();

            getGlobalBus.reset();
            globalBusFire.reset();

        });

        it('logs by predicate', function() {

            var logger = sinon.spy(function() {});
            var predicate = sinon.spy(function(bus) {

                return bus.id === 'some bus';

            });

            debug.logBus(predicate, logger);

            globalBus.fire('afterRender', 42, {
                name: 'some bus'
            });

            globalBus.fire('afterRender', 42, {
                name: 'another bus'
            });

            globalBus.fire('afterRenderAll', 43, {
                id: 'some bus'
            });

            expect(predicate.callCount)
                .to.be.equal(3);

            expect(predicate.getCall(2).args)
                .to.be.eql([
                    {id: 'some bus'},
                    'afterRenderAll',
                    43
                ]);

            expect(logger.callCount)
                .to.be.equal(1);

            expect(logger.getCall(0).args)
                .to.be.eql([
                    'some bus',
                    'afterRenderAll',
                    43
                ]);

            getGlobalBus.reset();
            globalBusFire.reset();

        });

    });

});
