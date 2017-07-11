'use strict';

(function (typeFactory) {
    const isNode = typeof module !== 'undefined' && typeof module.exports !== undefined;

    if(isNode) {
        const signet = require('signet')();

        module.exports = typeFactory(signet);
    } else if (typeof signet === 'object') {
        typeFactory(signet);
    } else {
        throw new Error('Cannot create types without signet.');
    }

})(function (signet) {

    return signet;
});
