const types = require("./bin/types");

const isArray = types.ARRAY();

function checkObjectValues(valueChecks, values) {
    for (let i = 0; i < valueChecks.length; i++) {
        const { check, key } = valueChecks[i];

        if (!check(values[key])) {
            return false;
        }
    }

    return true;
}

function buildObjectCheck(matchValues) {
    let valueChecks = [];
    const keys = Object.keys(matchValues);

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        valueChecks.push({ key: key, check: getCaseCheck(matchValues[key]) });
    }

    return valueChecks;
}

function buildArrayCheck(matchValues) {
    let valueChecks = [];

    for (let i = 0; i < matchValues.length; i++) {
        valueChecks.push({ key: i, check: getCaseCheck(matchValues[i]) });
    }

    return valueChecks;
}

function buildValueChecks(matchValues) {
    return Array.isArray(matchValues)
        ? buildArrayCheck(matchValues)
        : buildObjectCheck(matchValues);
}

function seekCheck(valueSet, currentCheck) {
    var valueOk = false;

    while (!valueOk && valueSet.length > 0) {
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
    let valueSet = values.slice(0);
    let valuesOk = true;
    let seeking = false;

    for (let i = 0; i < valueChecks.length; i++) {
        const checkTuple = valueChecks[i];
        const restFound = checkTuple.check.isRest;
        const isSeekingToken = checkTuple.check.isSeek;

        seeking = isSeekingToken ? true : seeking;

        if (!valuesOk) {
            break;
        } else if (restFound) {
            valuesOk = true;
            valueSet.length = 0;

            break;
        } else if (valueSet.length > 0 && !isSeekingToken) {
            valuesOk = getCheckAction(checkTuple, valueSet, seeking)();
            seeking = false;
        }
    }

    return valuesOk && valueSet.length === 0;
}

function buildStructureCheck(structureCheck, valueCheck) {
    return function (matchValues) {
        var valueChecks = buildValueChecks(matchValues);

        return function (userValue) {
            return (
                structureCheck(userValue) && valueCheck(valueChecks, userValue)
            );
        };
    };
}

var caseActions = {
    array: buildStructureCheck(isArray, checkArrayValues),
    object: buildStructureCheck(types.OBJECT, checkObjectValues),

    any: () => types.ANY,
    function: (value) => value,
    primitive: (a) => (b) => a === b,
    regex: pattern => value => pattern.test(value)
};

function getCaseType(value) {
    if (types.FUNCTION(value)) {
        return "function";
    } else if (isArray(value)) {
        return "array";
    } else if (
        types.OBJECT(value) &&
        value !== null &&
        typeof value.test === "function"
    ) {
        return 'regex';
    } else if (types.OBJECT(value)) {
        return "object";
    } else if (types.UNDEFINED(value)) {
        return "any";
    } else {
        return "primitive";
    }
}

function getCaseCheck(value) {
    var caseType = getCaseType(value);

    return caseActions[caseType](value);
}

function onCaseFactory(cases) {
    return function (caseValue, action) {
        cases.push([getCaseCheck(caseValue), action]);
    };
}

const alwaysTrue = () => true;

function onDefaultFactory(cases) {
    var wasCalled = false;

    return function (action) {
        throwOn(wasCalled, "Cannot match on more than one default");

        wasCalled = true;

        cases.push([alwaysTrue, action]);
    };
}

function getPassingCase(cases, valueUnderTest) {
    for (let i = 0; i < cases.length; i++) {
        const caseTuple = cases[i];

        if (caseTuple[0](valueUnderTest)) {
            return caseTuple;
        }
    }

    return null;
}

function buildActionType(idProperty) {
    function actionType() {
        return false;
    }

    Object.defineProperty(actionType, idProperty, {
        writeable: false,
        value: true,
    });

    return actionType;
}

var actionIdMap = {
    "...rest": "isRest",
    "...": "isSeek",
};

function matcher(type) {
    var actionId = actionIdMap[type];
    return types.STRING(actionId) ? buildActionType(actionId) : type;
}

function runMatcher(caseWrapper, valueUnderTest) {
    const cases = [];

    caseWrapper(onCaseFactory(cases), onDefaultFactory(cases));

    return getPassingCase(cases, valueUnderTest);
}

function throwOn(condition, errorMessage) {
    if (condition) {
        throw new Error(errorMessage);
    }
}

function match(valueUnderTest, caseWrapper) {
    var passingCase = runMatcher(caseWrapper, valueUnderTest);

    throwOn(
        types.NULL(passingCase),
        "All cases failed, perhaps a default could be provided."
    );

    return passingCase[1](valueUnderTest);
}

function matchArguments(argumentsObj, caseWrapper) {
    return match(Array.prototype.slice.call(argumentsObj, 0), caseWrapper);
}

module.exports = {
    matcher: matcher,
    match: match,
    matchArguments: matchArguments,
    types: types,
};
