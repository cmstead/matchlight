(function (moduleFactory) {
    let isNode = typeof module !== undefined && typeof module.exports !== undefined

    if (isNode) {
        module.exports = moduleFactory();
    } else {
        window.matchlightFactory = moduleFactory();
    }

})(function () {
    'use strict';

    return function matchlightFactory(signet) {

        try { signet.isTypeOf('string')('test'); }
        catch (e) { throw new Error('Matchlight require signet to function!'); }

        var isArray = signet.isTypeOf('array');
        var isFunction = signet.isTypeOf('function');
        var isObject = signet.isTypeOf('object');
        var isString = signet.isTypeOf('string');

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

        function seekCheck(valueSet, currentCheck) {
            var valueOk = false;

            while (!valueOk) {
                valueOk = currentCheck(valueSet.shift());
            }

            return valueOk;
        }

        function getCheckAction(checkTuple, valueSet, seeking) {
            return seeking
                ? seekCheck.bind(null, valueSet, checkTuple.check)
                : checkTuple.check.bind(null, valueSet.shift());
        }

        function checkArrayValues(valueChecks, values) {
            var valueSet = values.slice(0);
            var valuesOk = true;
            var seeking = false;

            valueChecks.forEach(function (checkTuple) {
                var restFound = checkTuple.check.isRest;

                seeking = checkTuple.check.isSeek ? true : seeking;

                if (valuesOk && valueSet.length > 0 && !checkTuple.check.isSeek) {
                    var checkAction = getCheckAction(checkTuple, valueSet, seeking);
                    seeking = false;
                    valuesOk = restFound ? true : checkAction();
                    valueSet.length = restFound ? 0 : valueSet.length;
                }
            });

            return valuesOk && valueSet.length === 0;
        }

        function buildArrayCheck(matchValues) {
            var valueChecks = buildValueChecks(matchValues);

            return function (userValue) {

                return isArray(userValue)
                    && checkArrayValues(valueChecks, userValue);
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

        function buildActionType(idProperty) {
            function actionType() { return false; }

            Object.defineProperty(actionType, idProperty, {
                writeable: false,
                value: true
            });

            return actionType;
        }

        var actionIdMap = {
            '...rest': 'isRest',
            '...': 'isSeek'
        }

        var byType = signet.enforce(
            'variant<string, type, function> => function',
            function byType(type) {
                var actionId = actionIdMap[type];
                return isString(actionId) ? buildActionType(actionId) : signet.isTypeOf(type);
            });

        function runMatcher(caseWrapper, cases, valueUnderTest) {
            caseWrapper(
                matchCaseFactory(cases),
                matchDefaultFactory(cases),
                byType
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

        function matchArguments(argumentsObj, caseWrapper) {
            var args = Array.prototype.slice.call(argumentsObj, 0);
            return matcher(args, caseWrapper);
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
                matcher),
            matchArguments: signet.enforce(
                'arguments:arguments, ' +
                'caseWrapper:function<' +
                'function, ' +
                '[function] ' +
                '[function] ' +
                '=> undefined' +
                '>' +
                '=> *',
                matchArguments)
        }
    }
});
