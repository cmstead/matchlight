function isTypeOf(type, value) {
    return typeof value === type;
}

function BOOLEAN(value) {
    return isTypeOf('boolean', value);
}

function ANY() {
    return true;
}

function NULL(value) {
    return value === null;
}

function UNDEFINED(value) {
    return isTypeOf('undefined', value);
}

function NUMBER(value) {
    return isTypeOf('number', value);
}

function STRING(value) {
    return isTypeOf('string', value);
}

function BIGINT(value) {
    return isTypeOf('bigint', value);
}

function SYMBOL(value) {
    return isTypeOf('symbol', value);
}

function checkAllValues(typedef, values) {
    for (let i = 0; i < values.length; i++) {
        if (!typedef(values[i])) { return false; }
    }

    return true;
}

function valuesMatchType(typedef, values) {
    return typedef !== ANY
        ? checkAllValues(typedef, values)
        : true;
}

function isArray(typedef, values) {
    return Array.isArray(values) && valuesMatchType(typedef, values);
}

function ARRAY(typedef = ANY) {
    return function (values) {
        return isArray(typedef, values);
    }
}

function OBJECT(value) {
    return !NULL(value) && isTypeOf('object', value);
}

function FUNCTION(value) {
    return isTypeOf('function', value);
}

module.exports = {
    ANY,
    ARRAY,
    BIGINT,
    BOOLEAN,
    FUNCTION,
    NULL,
    NUMBER,
    OBJECT,
    STRING,
    SYMBOL,
    UNDEFINED
};
