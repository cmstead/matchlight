!function(){function n(n,t){return typeof t===n}function t(){return!0}function r(n){return null===n}var e={ANY:t,ARRAY:function(n=t){return function(r){return function(n,r){return Array.isArray(r)&&function(n,r){return n===t||function(n,t){for(let r=0;r<t.length;r++)if(!n(t[r]))return!1;return!0}(n,r)}(n,r)}(n,r)}},BIGINT:function(t){return n("bigint",t)},BOOLEAN:function(t){return n("boolean",t)},FUNCTION:function(t){return n("function",t)},NULL:r,NUMBER:function(t){return n("number",t)},OBJECT:function(t){return!r(t)&&n("object",t)},STRING:function(t){return n("string",t)},SYMBOL:function(t){return n("symbol",t)}};const u=e.ARRAY();function c(n,t,r){return r?function(n,t){for(var r=!1;!r&&n.length>0;)r=t(n.shift());return r}.bind(null,t,n.check):n.check.bind(null,t.shift())}function i(n,t){return function(r){var e=function(n){let t=[];const r=Object.keys(n);for(let e=0;e<r.length;e++){const u=r[e];t.push({key:u,check:f(n[u])})}return t}(r);return function(r){return n(r)&&t(e,r)}}}var o={array:i(u,(function(n,t){let r=t.slice(0),e=!0,u=!1;for(let i=0;i<n.length;i++){const t=n[i],o=t.check.isRest,f=t.check.isSeek;if(u=!!f||u,!e)break;if(o){e=!0,r.length=0;break}if(r.length>0&&!f){const n=c(t,r,u);u=!1,e=n()}}return e&&0===r.length})),object:i(e.OBJECT,(function(n,t){for(let r=0;r<n.length;r++){const{check:e,key:u}=n[r];if(!e(t[u]))return!1}return!0})),function:n=>n,primitive:n=>t=>n===t};function f(n){var t=function(n){return e.FUNCTION(n)?"function":u(n)?"array":e.OBJECT(n)?"object":"primitive"}(n);return o[t](n)}}();