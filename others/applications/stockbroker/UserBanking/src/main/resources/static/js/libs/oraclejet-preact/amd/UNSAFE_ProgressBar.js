define(["exports","./tslib.es6-42e4f430","preact/jsx-runtime","./utils/UNSAFE_classNames","css!./UNSAFE_ProgressBar.css","./hooks/UNSAFE_useUser","./hooks/UNSAFE_useTranslationBundle","./PRIVATE_Meter","./classNames-e842f86a","preact/hooks","./UNSAFE_Environment","preact","./UNSAFE_Layer","preact/compat"],function(e,a,s,r,n,l,t,i,o,c,u,d,m,x){"use strict";const v=({accessibleLabel:e,id:a,width:r,edge:n="none"})=>{const{direction:c}=l.useUser(),u=o.classNames([j.value,j.indeterminate,j[c]]),d=o.classNames([j.base,"none"===n&&j.standalone]),m=t.useTranslationBundle("@oracle/oraclejet-preact"),x={"aria-valuetext":e||m.progressIndeterminate(),role:"progressbar"};return s.jsx(i.BarTrack,Object.assign({id:a,ariaProps:x,class:d,length:r},{children:s.jsx(i.BarValue,{class:u})}))},g=({value:e=0,max:a=100,id:r,width:n,edge:l="none"})=>{const t=100*Math.min(Math.max(0,e/a),1)+"%",c=o.classNames([j.base,"none"===l&&j.standalone]),u={};return u["aria-valuemin"]=null!=e?"0":void 0,u["aria-valuemax"]=null!=e?`${a}`:void 0,u["aria-valuenow"]=null!=e?`${e}`:void 0,u.role="progressbar",s.jsx(i.BarTrack,Object.assign({ariaProps:u,id:r,length:n,class:c},{children:s.jsx(i.BarValue,{class:j.value,length:t})}))},j={base:"zooecf",value:"_5sdga0",indeterminate:"f10awn",standalone:"_12rjefx",rtl:"x3rql4",ltr:"_11x5hlq"};e.ProgressBar=function(e){var{value:r,max:n}=e,l=a.__rest(e,["value","max"]);return"indeterminate"===r?s.jsx(v,Object.assign({},l)):s.jsx(g,Object.assign({value:r,max:n},l))},Object.defineProperty(e,"__esModule",{value:!0})});
//# sourceMappingURL=UNSAFE_ProgressBar.js.map
