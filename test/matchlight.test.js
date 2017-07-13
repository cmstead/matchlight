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
                matchCase([byType('int'), [5]], ([, x]) => x[0]);
            });

            assert.equal(result, 5);
        });

        it('should match against an object', function () {
            let testData = { test: [1], foo: { bar: 'quux' } }
            let result = matchlight.match(testData, function (matchCase, _, byType) {
                matchCase({ test: 1 }, ({ test }) => test);

                const nestedCase = { test: [byType('number')], foo: { bar: 'quux' } };
                matchCase(nestedCase, ({ foo }) => foo.bar);
            });

            assert.equal(result, 'quux');
        });

        it('should allow for fibonacci computation', function () {
            function fib(n) {
                return matchlight.match(n, function (matchCase, matchDefault) {
                    matchCase(0, () => 1);
                    matchCase(1, () => 1);
                    matchDefault(() => fib(n - 1) + fib(n - 2));
                });
            }

            assert.equal(fib(10), 89);
        });

        it('should support rest type for arrays', function () {
            var testData = [1, 2, 3, 4, 5];

            let result = matchlight.match(testData, function (matchCase, _, byType) {
                matchCase([1, 2, 3, 4], ([x]) => x);
                matchCase([1, 2, 3, byType('...rest')], ([, , , ...rest]) => rest);
            });

            assert.equal(JSON.stringify(result), '[4,5]');
        });

        it('should support seek type for arrays', function () {
            var testData = [1, 2, 3, 4, 5];

            let result = matchlight.match(testData, function (matchCase, _, byType) {
                matchCase([1, 2, byType('...'), 5], ([, , , , x]) => x);
            });

            assert.equal(result, 5);
        });

        it('should properly check a single-valued, typed array', function () {
            function test() {
                return matchlight.match(['foo'], function (matchCase, _, byType) {
                    matchCase([byType('number')], () => 'no');
                });
            }

            assert.throws(test);
        });

    });

    describe('matchArguments', function () {

        it('should match against function arguments', function () {
            function add() {
                return matchlight.matchArguments(arguments, function (matchCase, matchDefault, byType) {
                    matchCase([byType('number')], ([a]) => b => a + b);
                    matchCase([byType('number'), byType('number')], ([a, b]) => a + b);
                    matchCase(byType('array<number>'), (values) => values.reduce((sum, value) => sum + value, 0));
                    matchDefault(() => { throw new Error('Add can only accept numbers.'); });
                });
            }

            assert.equal(add(5)(6), 11);
            assert.equal(add(6, 7), 13);
            assert.equal(add(1, 3, 5), 9);
            assert.throws(add.bind(null, 'foo'), 'Add can only accept numbers.');
        });

    });

});

if (typeof global.runQuokkaMochaBdd === 'function') {
    runQuokkaMochaBdd();
}
