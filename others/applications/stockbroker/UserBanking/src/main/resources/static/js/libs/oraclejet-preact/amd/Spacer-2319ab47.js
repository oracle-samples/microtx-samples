function _toConsumableArray(r){return _arrayWithoutHoles(r)||_iterableToArray(r)||_unsupportedIterableToArray(r)||_nonIterableSpread()}function _nonIterableSpread(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function _unsupportedIterableToArray(r,e){if(r){if("string"==typeof r)return _arrayLikeToArray(r,e);var t=Object.prototype.toString.call(r).slice(8,-1);return"Object"===t&&r.constructor&&(t=r.constructor.name),"Map"===t||"Set"===t?Array.from(r):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?_arrayLikeToArray(r,e):void 0}}function _iterableToArray(r){if("undefined"!=typeof Symbol&&null!=r[Symbol.iterator]||null!=r["@@iterator"])return Array.from(r)}function _arrayWithoutHoles(r){if(Array.isArray(r))return _arrayLikeToArray(r)}function _arrayLikeToArray(r,e){(null==e||e>r.length)&&(e=r.length);for(var t=0,n=new Array(e);t<e;t++)n[t]=r[t];return n}define(["exports","./tslib.es6-42e4f430","preact/jsx-runtime","./utils/UNSAFE_interpolations/dimensions","./utils/UNSAFE_mergeInterpolations","./utils/UNSAFE_interpolations/flexitem","./flexitem-6045133a"],function(r,e,t,n,o,a,i){"use strict";const s=[].concat(_toConsumableArray(Object.values(n.dimensionInterpolations)),[i.flexitemInterpolations.flex]),l=o.mergeInterpolations(s);r.Spacer=r=>{var n=e.__rest(r,[]);const o=l(n),{class:a}=o,i=e.__rest(o,["class"]);return t.jsx("div",{class:a,style:i})}});
//# sourceMappingURL=Spacer-2319ab47.js.map