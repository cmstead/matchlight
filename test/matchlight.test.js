'use strict';

const assert = require('chai').assert;
const {
    matcher,
    match,
    matchArguments,
    types: { NUMBER, STRING, ARRAY }
} = require('../index.js');

describe('matchlight', function () {
    describe('match', function () {

        it('should resolve first passing behavior', function () {
            let result = match('foo', onCase => {
                onCase(() => false, () => 'ha!');
                onCase(() => true, () => 'woo!');
                onCase(() => true, () => 'blammo!');
            });

            assert.equal(result, 'woo!');
        });

        it('should throw an error if no cases pass', function () {
            function failingCase(onCase) {
                onCase(() => false, () => 'ha!');
                onCase(() => false, () => 'woo!');
                onCase(() => false, () => 'blammo!');
            }

            assert.throws(
                match.bind(null, 'foo', failingCase),
                'All cases failed, perhaps a default could be provided.');
        });

        it('should call default action if no cases pass and default exists', function () {
            let result = match('foo', (onCase, orDefault) => {
                onCase(() => false, () => 'ha!');
                onCase(() => false, () => 'woo!');
                onCase(() => false, () => 'blammo!');
                orDefault(() => 'default!');
            });

            assert.equal(result, 'default!');
        });

        it('should call default action if no cases pass and default exists', function () {
            function caseWrapper(onCase, orDefault) {
                onCase(() => false, () => 'ha!');
                onCase(() => false, () => 'woo!');
                onCase(() => false, () => 'blammo!');
                orDefault(() => 'default!');
                orDefault(() => 'default2!');
            }

            assert.throws(
                match.bind(null, 'foo', caseWrapper),
                'Cannot match on more than one default');
        });

        it('should call action on type match', function () {
            let result = match(-3, function (onCase, orDefault) {
                onCase(NUMBER, (value) => `${value} is a number`);
                onCase(STRING, (value) => `${value} is a string`);
                orDefault(() => 'I got to the default');
            });

            assert.equal(result, '-3 is a number');
        });

        it('should match against a primitive value', function () {
            let result = match(2, function (onCase) {
                onCase(2, () => 'two');
            });

            assert.equal(result, 'two');
        });

        it('should handle regex as a first-class citizen', function () {
            let result = match('This is a test', function (onCase) {
                onCase(/test/, () => 'Okay!');
            });

            assert.equal(result, 'Okay!');
        });

        it('should match against an array of values', function () {
            let result = match([4, [5]], function (onCase) {
                onCase([4], ([x]) => x);
                onCase([NUMBER, [5]], ([, x]) => x[0]);
            });

            assert.equal(result, 5);
        });

        it('should match against an object', function () {
            let testData = { test: [1], foo: { bar: 'quux' } }
            let result = match(testData, function (onCase) {
                onCase({ test: 1 }, ({ test }) => test);
                onCase({ test: [NUMBER], foo: { bar: 'quux' } }, ({ foo }) => foo.bar);
            });

            assert.equal(result, 'quux');
        });

        it('should allow for fibonacci computation', function () {
            function fib(n) {
                return match(n, function (onCase, orDefault) {
                    onCase(0, () => 1);
                    onCase(1, () => 1);
                    orDefault(() => fib(n - 1) + fib(n - 2));
                });
            }

            assert.equal(fib(10), 89);
        });

        it('should treat undefined (empty element) as "any" in an array', function () {
            var testData = [1, 2, 3, 4];

            let result = match(testData, function (onCase) {
                onCase([1, , , 4], ([,,,x]) => x);
                onCase([1, 2, 3, matcher('...rest')], ([, , , ...rest]) => rest);
            });

            assert.deepEqual(result, 4);
        });

        it('should support rest type for arrays', function () {
            var testData = [1, 2, 3, 4, 5];

            let result = match(testData, function (onCase) {
                onCase([1, 2, 3, 4], ([x]) => x);
                onCase([1, 2, 3, matcher('...rest')], ([, , , ...rest]) => rest);
            });

            assert.equal(JSON.stringify(result), '[4,5]');
        });

        it('should support seek type for arrays', function () {
            var testData = [1, 2, 3, 4, 5];

            let result = match(testData, function (onCase) {
                onCase([1, 2, matcher('...'), 5], ([, , , , x]) => x);
            });

            assert.equal(result, 5);
        });

        it('should not have an infinite loop ', function () {
            var testData = [1, 2, 3, 4, 5];

            let result = match(testData, function (onCase) {
                onCase([1, 2, matcher('...'), 5], ([, , , , x]) => x);
            });

            assert.equal(result, 5);
        });

        it('should properly check a single-valued, typed array', function () {
            function test() {
                return match(['foo'], function (onCase) {
                    onCase([NUMBER], () => 'no');
                });
            }

            assert.throws(test);
        });

    });

    describe('matchArguments', function () {

        it('should match against function arguments', function () {
            function add() {
                return matchArguments(arguments, function (onCase, orDefault) {
                    onCase([NUMBER], ([a]) => b => a + b);
                    onCase([NUMBER, NUMBER], ([a, b]) => a + b);
                    onCase(ARRAY(NUMBER), (values) => values.reduce((sum, value) => sum + value, 0));
                    orDefault(() => { throw new Error('Add can only accept numbers.'); });
                });
            }

            assert.equal(add(5)(6), 11);
            assert.equal(add(6, 7), 13);
            assert.equal(add(1, 3, 5), 9);
            assert.throws(add.bind(null, 'foo'), 'Add can only accept numbers.');
        });

    });

});
