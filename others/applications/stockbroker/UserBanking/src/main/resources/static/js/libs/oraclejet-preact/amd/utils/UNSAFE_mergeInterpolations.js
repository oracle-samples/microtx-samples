define(["exports","./UNSAFE_classNames","../_curry1-a2227576","../_curry3-3a3ba6d5","../_has-db711dd4","../classNames-e842f86a","../_curry2-a4242d52"],function(r,e,t,c,n,a,s){"use strict";var u=function(r){return"[object Object]"===Object.prototype.toString.call(r)},o=c._curry3_1,_=n._has_1,i=o(function(r,e,t){var c,n={};for(c in e)_(c,e)&&(n[c]=_(c,t)?r(c,e[c],t[c]):e[c]);for(c in t)_(c,t)&&!_(c,n)&&(n[c]=t[c]);return n}),f=c._curry3_1,d=u,l=i,y=f(function r(e,t,c){return l(function(t,c,n){return d(c)&&d(n)?r(e,c,n):e(t,c,n)},t,c)});const b=(r,e,t)=>"class"===r?a.classNames([e,t]):t;r.mergeInterpolations=r=>e=>r.reduce((r,t)=>y(b,r,t(e)),{}),Object.defineProperty(r,"__esModule",{value:!0})});
//# sourceMappingURL=UNSAFE_mergeInterpolations.js.map
