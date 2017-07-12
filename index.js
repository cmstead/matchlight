(function (moduleFactory) {
    let isNode = typeof module !== undefined && typeof module.exports !== undefined

    if (isNode) {
        module.exports = moduleFactory();
    } else {
        window.matchlight = moduleFactory();
    }

})(function () {
    'use strict';

    return function matchlightFactory(signet) {

        var isArray = signet.isTypeOf('array');
        var isFunction = signet.isTypeOf('function');
        var isObject = signet.isTypeOf('object');

        function alwaysTrue() {
            return true;
        }

        function equalTo(a) {
            return function (b) {
                return a === b;
            }
        }

        function checkObjectValues(valueChecks, values) {
            function checkValue(checkDef) {
                return checkDef.check(values[checkDef.key]);
            }

            return valueChecks.filter(checkValue).length === valueChecks.length;
        }

        function buildValueChecks(matchValues) {
            return Object.keys(matchValues).map(function (key) {
                return { key: key, check: getCaseCheck(matchValues[key]) };
            });
        }

        function buildArrayCheck(matchValues) {
            var valueChecks = buildValueChecks(matchValues);

            return function (userValue) {
                return isArray(userValue)
                    && userValue.length === valueChecks.length
                    && checkObjectValues(valueChecks, userValue);
            };
        }

        function buildObjectCheck(matchValues) {
            var valueChecks = buildValueChecks(matchValues);

            return function (userValue) {
                return isObject(userValue)
                    && checkObjectValues(valueChecks, userValue);
            }
        }

        var caseActions = {
            array: buildArrayCheck,
            function: function (value) { return value; },
            object: buildObjectCheck,
            primitive: equalTo
        }

        function getCaseType(value) {
            var caseType = isFunction(value) ? 'function' : 'primitive';
            caseType = isObject(value) ? 'object' : caseType;
            caseType = isArray(value) ? 'array' : caseType;

            return caseType;
        }

        function getCaseCheck(value) {
            var caseType = getCaseType(value);

            return caseActions[caseType](value);
        }

        function matchCaseFactory(cases) {
            return signet.enforce(
                'matchValue:*, matchAction:function => undefined',
                function (caseValue, action) {
                    cases.push([getCaseCheck(caseValue), action]);
                });
        }

        function matchDefaultFactory(cases) {
            var callCount = 0;

            return signet.enforce(
                'matchAction:function => undefined',
                function (action) {
                    var errorMessage = 'Cannot call matchDefault more than once';
                    throwOnFailure([1, callCount], errorMessage);

                    cases.push([alwaysTrue, action]);
                    callCount++;
                });
        }

        function getPassingCases(cases, valueUnderTest) {
            return cases.filter(function (caseTuple) {
                return caseTuple[0](valueUnderTest);
            });
        }

        function runMatcher(caseWrapper, cases, valueUnderTest) {
            caseWrapper(
                matchCaseFactory(cases),
                matchDefaultFactory(cases),
                signet.isTypeOf
            );

            return getPassingCases(cases, valueUnderTest);
        }

        function throwOnFailure(values, errorMessage) {
            if (values[0] <= values[1]) {
                throw new Error(errorMessage);
            }
        }

        function matcher(valueUnderTest, caseWrapper) {
            var passingCases = runMatcher(caseWrapper, [], valueUnderTest);

            var errorMessage = 'All cases failed, perhaps a default could be provided.';
            throwOnFailure([passingCases.length, 0], errorMessage);

            return passingCases[0][1](valueUnderTest);
        }

        return {
            match: signet.enforce(
                'valueUnderTest:*, ' +
                'caseWrapper:function<' +
                    'function, ' +
                    '[function] ' +
                    '[function] ' +
                    '=> undefined' +
                '>' +
                '=> *',
                matcher)
        }
    }
});
