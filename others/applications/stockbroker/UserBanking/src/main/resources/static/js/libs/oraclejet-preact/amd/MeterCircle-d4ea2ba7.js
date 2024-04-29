define(["exports","./tslib.es6-42e4f430","preact/jsx-runtime","./hooks/UNSAFE_useUser",'module',"preact/hooks","./utils/UNSAFE_mergeProps","./utils/UNSAFE_classNames","./PRIVATE_Meter","./utils/PRIVATE_meterUtils","./hooks/PRIVATE_useDvtMeterEvents","./hooks/UNSAFE_useTabbableMode","./classNames-e842f86a"],function(t,e,n,s,i,r,a,o,l,c,u,d,h){"use strict";function m({color:t,angle:e,radius:s,length:i,section:r="full"}){const a=c.getCenterCoord(r),o=`calc(${100*a.y}% - ((${Math.sin(2*e*Math.PI/360)} * ${s})))`,l=`calc(${100*a.x}%  + ((${Math.cos(2*e*Math.PI/360)} * ${s})))`;return n.jsx("div",{class:g.base,style:{left:l,top:o,width:`calc(${i})`,transform:`translate(0, -1px) rotate(${360-e}deg)`,backgroundColor:t||"var(--oj-c-PRIVATE-DO-NOT-USE-dvt-reference-object-line-color)",borderBottom:"1px solid var(--oj-c-PRIVATE-DO-NOT-USE-dvt-contrast-line-color)"}})}const g={base:"_1xnjt6d"};function f(t,e){if(!t)return{width:0,height:0,innerRadius:0,outerRadius:0};const n=t.children[0],s=n.getBoundingClientRect();return Object.assign({width:Math.round(s.width),height:Math.round(s.height)},function(t,e,n){const s=t.clientWidth,i=t.clientHeight;if("bottom"===n||"top"===n)return{outerRadius:e.width/2,innerRadius:i};if("left"===n||"right"===n)return{outerRadius:e.height/2,innerRadius:s};return{innerRadius:s/2,outerRadius:e.width/2}}(n,s,e))}function x(t,e,n,s){return t*s/(n-e)}function b(t,e,n,s,i,r){return s+(r?1:-1)*x(t-e,e,n,i)}function p(t){return`var(--oj-c-PRIVATE-DO-NOT-USE-meter-circle-${t}-size)`}function R(t){return`var(--oj-c-PRIVATE-DO-NOT-USE-meter-circle-${t}-track-size)`}function v(t,e){return null!=e?`(${p(t)} * ${e/2})`:`(${p(t)} * 0.5 - ${R(t)})`}function $(t,e){return null!=e?`(${p(t)} * ${1-e} / 2)`:R(t)}function _(t,e){return`${$(t,e)} + ${{sm:"1rem",md:"0.75rem",lg:"0.5rem"}[t]}`}function C(t,e,n,s,i){const{min:r,max:a,startAngle:o,angleExtent:l,size:u,section:d,isRtl:h,innerRadius:m}=t,g=`calc(${$(u,i)})`,f=[],p=e.filter(t=>t.max>r&&t.max<=a).sort((t,e)=>t.max-e.max),R=p.length;for(let t=0;t<R;t++){const e=p[t],i=0===t?r:p[t-1].max,u=0===t?e.max:e.max-p[t-1].max;let v=b(i,r,a,o,l,h),$=x(u,r,a,l);const{startOffset:_,extentOffset:C}=E(m,l,0===t,e.max===a,h),j=c.getClipPath(v+_,$+C,h,d);if(f.push({clipPath:j,color:null==e?void 0:e.color,size:g,section:d}),t===R-1&&e.max<a&&n){v+=(h?1:-1)*$,$=x(a-e.max,r,a,l);const{startOffset:t,extentOffset:n}=E(m,l,!1,!0,h);f.push({clipPath:c.getClipPath(v+t,$+n,h,d),color:s,size:g,section:d})}}return f}function j(t,e,n,s,i,r){const{startAngle:a,angleExtent:o,size:l,section:u,isRtl:d}=t;return{section:u,color:e?"all"===n&&r?"var(--oj-c-PRIVATE-DO-NOT-USE-dvt-contrast-line-color)":s:"transparent",clipPath:c.getClipPath(a,o,d,u),size:`calc(${$(l,i)})`}}function z(t,e,n){const{value:s,min:i,max:r,startAngle:a,angleExtent:o,size:l,section:u,isRtl:d}=t,h=(s-i)*o/(r-i),m=Math.min(Math.max(0,e),1),g="left"===u||"right"===u,f="top"===u||"bottom"===u,x=`calc(${$(l,n)} * ${m})`,b=`${p(l)} - ((1 - ${m}) * ${$(l,n)})`,R=`(${b}) / 2`;return{section:u,width:g?`calc(${R})`:`calc(${b})`,height:f?`calc(${R})`:`calc(${b})`,size:x,clipPath:c.getClipPath(a,h,d,u)}}function E(t,e,n,s,i){if(!t)return{startOffset:0,extentOffset:0};const r=360/(2*Math.PI*t);let a=r/2*(i?1:-1),o=-1*r;return n&&e<360&&(a=0,o=-.5*r),s&&e<360&&(o=-.5*r),{startOffset:a,extentOffset:o}}const P={base:"_54q53i",interactive:"_4d23h7"},O={full:"_1afg7t2",top:"_1ud3ync",bottom:"lgkm3h",right:"_1qdgkrk",left:"zeycar",smtop:"_18kuv2d",mdtop:"_13pvomq",lgtop:"_1wde9gy",smbottom:"ybb8cw",mdbottom:"_1yvz0mz",lgbottom:"_1oeyw0j",smleft:"fn56e1",mdleft:"a5fdcq",lgleft:"rhdwme",smright:"p4viu6",mdright:"_17dxl16",lgright:"unba25",smfull:"fb5ji1",mdfull:"kx5974",lgfull:"_133ef4s",lgHorizontal:"_14g47ii",lgVertical:"gxs68t",smHorizontal:"hcnvh7",smVertical:"_1526hiw",mdHorizontal:"azeai8",mdVertical:"owpaxe",smFull:"oyn19y",mdFull:"_1iyia1l",lgFull:"_1304zux",centerContent:"_1n2kh19",thresholds:"_11xw46v"},M="_1gogylc",A={base:"_3ly727"},y={base:"q7q3t6",sm:"_1hxqsxp",md:"y35l29",lg:"r4cqff"},I={base:"xm2t5w",full:"_1ap1qzt",top:"z6czkq",right:"_19jc7h6",left:"ub14jn",bottom:"_4xzoog"};t.MeterCircle=function(t){var i,{max:o=100,min:g=0,value:x=0,step:p=1,size:R="lg",startAngle:$=90,angleExtent:E=360,isTrackRendered:T=!0,thresholdDisplay:w="all",indicatorSize:k=1}=t,q=e.__rest(t,["max","min","value","step","size","startAngle","angleExtent","isTrackRendered","thresholdDisplay","indicatorSize"]);c.validateRange(g,o,x,p);const{direction:N}=s.useUser(),S="rtl"===N,U=c.getCircleSection($,E,S),V=r.useRef(f(null,U)),D=r.useRef(null),[F,B]=r.useState(!1);r.useEffect(()=>{(q.onCommit||q.onInput||q.children)&&(V.current=f(D.current,U),B(!0))},[R,q.onCommit,q.onInput,q.children]);const H=u.usePointerEvents(x,t=>{const e=D.current;if(t.target==e)return function(t,e,n,s,i,r,a,o,l){const u=i.current;if(!u)return;const d=c.getCenterCoord(o),{angle:h}=c.convertToPolar(u.width*d.x,u.height*d.y,t.offsetX,t.offsetY),m=c.getPositiveAngle(h);let g;if(l&&r+a>m&&(g=c.getPositiveAngle(h-r)/a*(n-e)),!l){const t=c.getPositiveAngle(r-m);t<=a&&(g=t*(n-e)/a)}return null!=g&&(g=Math.round(g/s)*s),g}(t,g,o,p,V,$,E,U,S)},D,q.onCommit,q.onInput),L=u.useKeyboardEvents(x,g,o,p,q.onCommit,q.onInput),{datatipContent:W,datatipProps:K}=u.useMeterDatatip(x,q.datatip,q.ariaDescribedBy),X=c.getMeterAriaProps(x,g,o,`${x}`,q.accessibleLabel,q.ariaLabelledBy,q.thresholds),Y=a.mergeProps(H,L,K,X),{trackColor:G,indicatorColor:J}=c.getTrackAndIndicatorColor(x,w,q.trackColor,q.indicatorColor,q.thresholds),Q="bottom"===U||"top"===U?"Horizontal":"left"===U||"right"===U?"Vertical":"Full",Z={min:g,max:o,value:x,startAngle:$,angleExtent:E,size:R,section:U,isRtl:S,innerRadius:V.current.innerRadius},tt=q.onCommit||q.onInput,{isTabbable:et}=d.useTabbableMode(),nt=function(t,e){const n=t.current;if(!n)return;const s=c.getCenterCoord(e),i=s.x*n.width,r=s.y*n.height;let a,o,l,u,d,h,m,g;return"top"===e||"bottom"===e||"full"===e?(m=2*n.innerRadius,g="full"===e?2*n.innerRadius:n.innerRadius,d=i-n.innerRadius,h="bottom"===e?0:r-n.innerRadius,l=Math.sqrt(2)*n.innerRadius,u="full"===e?l:n.innerRadius/Math.sqrt(2),a=i-n.innerRadius/Math.sqrt(2),o="bottom"===e?0:r-n.innerRadius/Math.sqrt(2)):(g=2*n.innerRadius,m=n.innerRadius,d="left"===e?i-n.innerRadius:0,h=r-n.innerRadius,u=Math.sqrt(2)*n.innerRadius,l=n.innerRadius/Math.sqrt(2),a="left"===e?i-n.innerRadius/Math.sqrt(2):0,o=r-n.innerRadius/Math.sqrt(2)),{outerBounds:{x:d,y:h,width:m,height:g},innerBounds:{x:a,y:o,width:l,height:u}}}(V,U);return n.jsxs(n.Fragment,{children:[n.jsx("div",Object.assign({class:h.classNames([P.base,tt?P.interactive:""]),tabIndex:et?0:-1,role:"slider"},Y,{children:n.jsxs(l.CircleWrapper,Object.assign({ref:D,class:h.classNames([A.base,q.referenceLines&&q.referenceLines.length>0?O[`${R}${U}`]:"",O[`${R}${Q}`]])},{children:[n.jsx(l.CircleInner,Object.assign({class:h.classNames([y.base,O[U]])},j(Z,T,w,G,q.innerRadius,q.thresholds))),"all"===w&&q.thresholds&&C(Z,q.thresholds,T,G,q.innerRadius).map(t=>n.jsx(l.CircleInner,Object.assign({class:h.classNames([y.base,O[U],O.thresholds])},t))),n.jsx(l.CircleInner,Object.assign({color:J,class:h.classNames([I.base,I[U],O[U]])},z(Z,k,q.innerRadius))),null===(i=q.referenceLines)||void 0===i?void 0:i.map(t=>n.jsx(m,Object.assign({},function(t,e,n){const{min:s,max:i,startAngle:r,angleExtent:a,size:o,isRtl:l}=t;return{radius:v(o,n),length:_(o,n),angle:b(e.value,s,i,r,a,l),color:e.color}}(Z,t,q.innerRadius),{section:U}))),F&&q.children&&nt&&n.jsx("div",Object.assign({class:h.classNames([O.centerContent,M])},{children:q.children(nt)}))]}))})),W]})}});
//# sourceMappingURL=MeterCircle-d4ea2ba7.js.map
