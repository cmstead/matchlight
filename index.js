const types = require('./bin/types');

function checkObjectValues(valueChecks, values) {
    function checkValue(checkDef) {
        return checkDef.check(values[checkDef.key]);
    }

    return valueChecks.filter(checkValue).length === valueChecks.length;
}

function buildValueChecks(matchValues) {
    let valueChecks = [];
    const keys = Object.keys(matchValues);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        valueChecks.push({ key: key, check: getCaseCheck(matchValues[key]) });
    }

    return valueChecks;
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

    for (let i = 0; i < valueChecks.length; i++) {
        const checkTuple = valueChecks[i];
        var restFound = checkTuple.check.isRest;

        seeking = checkTuple.check.isSeek ? true : seeking;

        if (valuesOk && valueSet.length > 0 && !checkTuple.check.isSeek) {
            var checkAction = getCheckAction(checkTuple, valueSet, seeking);
            seeking = false;
            valuesOk = restFound ? true : checkAction();
            valueSet.length = restFound ? 0 : valueSet.length;
        }
    }

    return valuesOk && valueSet.length === 0;
}

function buildArrayCheck(matchValues) {
    var valueChecks = buildValueChecks(matchValues);

    return function (userValue) {
        return types.ARRAY()(userValue)
            && checkArrayValues(valueChecks, userValue);
    };
}

function buildObjectCheck(matchValues) {
    var valueChecks = buildValueChecks(matchValues);

    return function (userValue) {
        return types.OBJECT(userValue)
            && checkObjectValues(valueChecks, userValue);
    }
}

var caseActions = {
    array: buildArrayCheck,
    object: buildObjectCheck,

    function: value => value,
    primitive: a => b => a === b
}

function getCaseType(value) {
    if(types.FUNCTION(value)) {
        return 'function';
    } else if (types.ARRAY()(value)) {
        return 'array';
    } else if (types.OBJECT(value)) {
        return 'object';
    } else {
        return 'primitive';
    }
}

function getCaseCheck(value) {
    var caseType = getCaseType(value);

    return caseActions[caseType](value);
}

function matchCaseFactory(cases) {
    return function (caseValue, action) {
        cases.push([getCaseCheck(caseValue), action]);
    };
}

const alwaysTrue = () => true

function matchDefaultFactory(cases) {
    var wasCalled = false;

    return function (action) {
        var errorMessage = 'Cannot match on more than one default';
        throwOnFailure(!wasCalled, errorMessage);
        wasCalled = true;

        cases.push([alwaysTrue, action]);
    };
}

function getPassingCase(cases, valueUnderTest) {
    for (let i = 0; i < cases.length; i++) {
        const caseTuple = cases[i];

        if(caseTuple[0](valueUnderTest)) {
            return caseTuple;
        }
    }

    return null;
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

function matcher(type) {
    var actionId = actionIdMap[type];
    return types.STRING(actionId) ? buildActionType(actionId) : type;
}

function runMatcher(caseWrapper, valueUnderTest) {
    const cases = [];

    caseWrapper(
        matchCaseFactory(cases),
        matchDefaultFactory(cases)
    );

    return getPassingCase(cases, valueUnderTest);
}

function throwOnFailure(condition, errorMessage) {
    if (!condition) {
        throw new Error(errorMessage);
    }
}

function matchFn(valueUnderTest, caseWrapper) {
    var passingCase = runMatcher(caseWrapper, valueUnderTest);

    var errorMessage = 'All cases failed, perhaps a default could be provided.';
    throwOnFailure(!types.NULL(passingCase), errorMessage);

    return passingCase[1](valueUnderTest);
}

function matchArguments(argumentsObj, caseWrapper) {
    var args = Array.prototype.slice.call(argumentsObj, 0);
    return matchFn(args, caseWrapper);
}

module.exports = {
    matcher,
    match: matchFn,
    matchArguments,
    types
}
