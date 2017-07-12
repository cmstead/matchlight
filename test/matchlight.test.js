'use strict';

if (typeof exploreFunction !== 'function') {
    require('quokka-signet-explorer').before();
}

const assert = require('chai').assert;
const signet = require('signet')();
const matchlightFactory = require('../index.js');

describe('matchlight', function () {
    require('./test-utils/approvals-config');

    const matchlight = matchlightFactory(signet);

    describe('match', function () {

        it('should resolve first passing behavior', function () {
            let result = matchlight.match('foo', matchCase => {
                matchCase(() => false, () => 'ha!');
                matchCase(() => true, () => 'woo!');
                matchCase(() => true, () => 'blammo!');
            });

            assert.equal(result, 'woo!');
        });

        it('should throw an error if no cases pass', function () {
            function failingCase(matchCase) {
                matchCase(() => false, () => 'ha!');
                matchCase(() => false, () => 'woo!');
                matchCase(() => false, () => 'blammo!');
            }

            assert.throws(
                matchlight.match.bind(null, 'foo', failingCase),
                'All cases failed, perhaps a default could be provided.');
        });

        it('should call default action if no cases pass and default exists', function () {
            let result = matchlight.match('foo', (matchCase, matchDefault) => {
                matchCase(() => false, () => 'ha!');
                matchCase(() => false, () => 'woo!');
                matchCase(() => false, () => 'blammo!');
                matchDefault(() => 'default!');
            });

            assert.equal(result, 'default!');
        });

        it('should call default action if no cases pass and default exists', function () {
            function caseWrapper(matchCase, matchDefault) {
                matchCase(() => false, () => 'ha!');
                matchCase(() => false, () => 'woo!');
                matchCase(() => false, () => 'blammo!');
                matchDefault(() => 'default!');
                matchDefault(() => 'default2!');
            }

            assert.throws(
                matchlight.match.bind(null, 'foo', caseWrapper),
                'Cannot call matchDefault more than once');
        });

        it('should call action on type match', function () {
            let result = matchlight.match(-3, function (matchCase, matchDefault, byType) {
                matchCase(byType('leftBoundedInt<1>'), (value) => `${value} is a boundedInt`);
                matchCase(byType('int'), (value) => `${value} is an int`);
                matchCase(byType('number'), (value) => `${value} is a number`);
                matchDefault(() => 'I got to the default');
            });

            assert.equal(result, '-3 is an int');
        });

        it('should match against a primitive value', function () {
            let result = matchlight.match(2, function (matchCase) {
                matchCase(2, () => 'two');
            });

            assert.equal(result, 'two');
        });

        it('should match against an array of values', function () {
            let result = matchlight.match([4, [5]], function (matchCase, _, byType) {
                matchCase([4], ([x]) => x);
                matchCase([byType('int'), [5]], ([, [x]]) => x);
            });

            assert.equal(result, 5);
        });

        it('should match against an object', function () {
            let result = matchlight.match({ test: [1], foo: { bar: 'quux' } }, function (matchCase, _, byType) {
                matchCase({ test: 1 }, ({test}) => test);
                matchCase({ test: [byType('number')], foo: { bar: 'quux' } }, ({foo: {bar}}) => bar);
            });

            assert.equal(result, 'quux');
        });

        it('should allow for fibonacci computation', function () {
            function fib (n) {
                return matchlight.match(n, function (matchCase, matchDefault) {
                    matchCase(0, () => 1);
                    matchCase(1, () => 1);
                    matchDefault(() => fib(n-1) + fib(n-2));
                });
            }

            assert.equal(fib(10), 89);
        });

    });

});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
