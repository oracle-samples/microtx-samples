define(["exports"],function(e){"use strict";var o;const r={browser:"unknown",browserMajorVersion:-1,deviceType:"unknown",platform:"unknown",hasTouchSupport:!1,isHybrid:!1};let n;function i(e,o){let r;const n=e.match(o);if(n){const e=n[1];e&&(r=parseInt(e))}return null!=r?r:-1}"undefined"!=typeof window&&Object.assign(r,{hasTouchSupport:"ontouchstart"in window,isHybrid:null===(o=window.matchMedia)||void 0===o?void 0:o.call(window,"(hover: hover) and (any-pointer: coarse)").matches}),e.getClientHints=function(e){if(void 0===n||e){let o;const t="undefined"!=typeof navigator&&navigator.userAgentData;if(o=t?function(e){const o=Object.assign({},r);for(const r of e.brands){const e=r.brand.toLowerCase();if(e.indexOf("chrome")>-1?o.browser="chrome":e.indexOf("edge")>-1&&(o.browser="edge"),"unknown"!==o.browser){o.browserMajorVersion=Number(r.version);break}}const n=e.platform.toLowerCase();"windows"===n?o.platform="windows":"android"===n?(o.platform="android",o.deviceType=e.mobile?"phone":"tablet"):"macos"===n&&(o.platform="mac");return o}(t):function(e){const o=Object.assign({},r);(e=e.toLowerCase()).indexOf("iphone")>-1?(o.platform="ios",o.deviceType="phone"):e.indexOf("ipad")>-1||"undefined"!=typeof navigator&&"MacIntel"===navigator.platform&&navigator.standalone?(o.platform="ios",o.deviceType="tablet"):e.indexOf("mac")>-1?o.platform="mac":e.indexOf("android")>-1?o.platform="android":e.indexOf("win")>-1&&(o.platform="windows");e.indexOf("edg")>-1?(o.browser="edge",o.browserMajorVersion=i(e,/edg\/(\d+)/)):e.indexOf("chrome")>-1?(o.browser="chrome",o.browserMajorVersion=i(e,/chrome\/(\d+)/)):e.indexOf("crios")>-1?(o.browser="chrome",o.browserMajorVersion=i(e,/crios\/(\d+)/)):e.indexOf("fxios")>-1?(o.browser="firefox",o.browserMajorVersion=i(e,/fxios\/(\d+)/)):e.indexOf("firefox")>-1?(o.browser="firefox",o.browserMajorVersion=i(e,/rv:(\d+)/)):e.indexOf("safari")>-1&&(o.browser="safari",o.browserMajorVersion=i(e,/version\/(\d+)/));return o}(null!=e?e:"undefined"!=typeof navigator?navigator.userAgent:""),e)return o;n=Object.assign({},o),Object.freeze(n)}return n}});
//# sourceMappingURL=clientHints-45edd40b.js.map
