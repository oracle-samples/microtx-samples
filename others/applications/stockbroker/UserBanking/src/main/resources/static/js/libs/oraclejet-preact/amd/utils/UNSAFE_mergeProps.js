define(["exports"],function(e){"use strict";function t(e,t,s){if("class"===t){const t=e.class;e.class=t?[t,s].join(" ").trim():s}else if("style"===t){if("object"!=typeof s)throw new Error(`Unable to merge prop '${t}'. Only support 'style' objects not 'style' strings`);e.style=Object.assign(Object.assign({},e.style),s)}else if("function"==typeof s){const n=e[t];e[t]=n?(...e)=>{n.apply(void 0,e),s.apply(void 0,e)}:s}else{if(void 0===s||"object"!=typeof s&&s===e[t])return;if(t in e)throw new Error(`Unable to merge prop '${t}'. Only support 'className', 'style', and event handlers`);e[t]=s}}e.mergeProps=function(...e){return 1===e.length?e[0]:e.reduce((e,s)=>{for(const n in s)t(e,n,s[n]);return e},{})},Object.defineProperty(e,"__esModule",{value:!0})});
//# sourceMappingURL=UNSAFE_mergeProps.js.map
