define(["exports","./tslib.es6-42e4f430","preact/jsx-runtime","./utils/UNSAFE_mergeProps","./utils/UNSAFE_classNames","./hooks/UNSAFE_useTranslationBundle",'module',"./UNSAFE_Text","./UNSAFE_Spacer","./utils/UNSAFE_size","./utils/UNSAFE_stringUtils","./Text-49e82dcb","./Spacer-2319ab47","./stringUtils-7012261b","./utils/UNSAFE_filePickerUtils","./utils/PRIVATE_clientHints","./hooks/UNSAFE_usePress","./hooks/UNSAFE_useHover","preact/hooks","./clientHints-45edd40b","./hooks/UNSAFE_useTabbableMode","./classNames-e842f86a"],function(e,r,t,s,i,n,a,l,o,c,d,u,p,h,b,v,f,g,m,y,x,j){"use strict";const T=(e,r,s,i,n)=>[t.jsx(u.Text,Object.assign({variant:e?"disabled":"primary",weight:"bold",size:"xl"},{children:k(r,i)})),t.jsx(p.Spacer,{height:"1.5x"}),t.jsx(u.Text,Object.assign({variant:e?"disabled":"secondary",size:"sm"},{children:D(s,i,n)}))],P=({accessibleLabel:e,isDisabled:r,translations:t,primaryText:s,secondaryText:i,selectionMode:n})=>e||`${r?"":t.filePicker_addFiles()+". "}${k(s,t)}. ${D(i,t,n)}`,_=(e,r)=>({width:e?c.sizeToCSS(e):void 0,height:r?c.sizeToCSS(r):void 0}),k=(e,r)=>e||r.filePicker_dropzonePrimaryText(),D=(e,r,t)=>{const s="multiple"===t?r.filePicker_dropzoneSecondaryTextMultiple():r.filePicker_dropzoneSecondaryText();return e||s},S=(e,r,t)=>{const s=[],i=[];let n,a;if(e)for(let l=0;l<e.length;l++){n=e[l];const o=n.name;if(a=t.filePicker_unknownFileTypeUploadError(),o){const e=o.split(".");a=e.length>1?"."+e.pop():a}a=n.type?n.type:a,-1===s.indexOf(a)&&-1===i.indexOf(a)&&(U(n,r)?s.push(a):i.push(a))}return{accepted:s,rejected:i}},E=e=>{const r={length:{value:e.length},item:{value(e){return this[e]}}};for(let t=0;t<e.length;t++)r[t]={value:e[t],enumerable:!0};return Object.create(FileList.prototype,r)},N=(e,r)=>"single"!==r||1===e.length,F=(e,r)=>{const t=[];return 1===e.length?t.push({severity:"error",summary:r.filePicker_singleTypeUploadError({fileType:e[0]})}):t.push({severity:"error",summary:r.filePicker_multipleFileTypeUploadError({fileTypes:e.join(r.plural_separator())})}),t},U=(e,r)=>{const t=r;if(!t||0===t.length||!e)return!0;let s;for(let r=0;r<t.length;r++){if(s=h.trim(t[r]),!s)return!0;if(s.startsWith(".",0)){if(!e.name||e.name&&e.name.toLowerCase().endsWith(s.toLowerCase()))return!0}else{if(!e.type)return!1;if("image/*"===s){if(e.type.startsWith("image/",0))return!0}else if("video/*"===s){if(e.type.startsWith("video/",0))return!0}else if("audio/*"===s){if(e.type.startsWith("audio/",0))return!0}else if(e.type===s)return!0}}return!1},A=(e,r,t)=>{let s;const i=r?new Promise(e=>{s=e}):null;return null==t||t({messages:e,until:i}),s},O=(e,r)=>{const t=E(e);null==r||r({files:t})},M=(e,r,t)=>{const{callback:s,validation:i}=H(e),{pressProps:n}=f.usePress(s),a=L(e.accept,e.selectionMode,A,O,r,e.translations,e.onCommit,e.onReject,t),{hoverProps:l,isHover:o}=g.useHover({isDisabled:!1});return{validation:i,dragAndDropProps:a,pressProps:n,isHover:o,hoverProps:l}},H=e=>{const r=r=>{if(r.length>0){const t=S(r,e.accept,e.translations).rejected;t.length>0?A(F(t,e.translations),!1,e.onReject):O(r,e.onCommit)}};return{callback:t=>{var s,i;("click"===t.type||"keyup"===t.type&&"Enter"===t.code)&&(t.preventDefault(),b.pickFiles(r,{accept:e.accept,selectionMode:null!==(s=e.selectionMode)&&void 0!==s?s:"multiple",capture:null!==(i=e.capture)&&void 0!==i?i:"none"}))},validation:r}},L=(e,r,t,s,i,n,a,l,o)=>{const c=m.useRef(!1),d=m.useRef(!1),u=m.useRef(),p=(e,r=!1)=>{var t,s;c.current&&(e.preventDefault(),e.stopPropagation(),(null===(t=i.current)||void 0===t?void 0:t.contains(e.relatedTarget))||(c.current=!1,null==o||o("NA"),d.current||r||null===(s=u.current)||void 0===s||s.call(u)))};return{onDragEnter:e=>{e.preventDefault(),e.stopPropagation()},onDragOver:s=>{if(s.preventDefault(),s.stopPropagation(),c.current)return;const i=y.getClientHints().browser;if(c.current=!0,d.current=!0,"safari"!==i){if(!s.dataTransfer)return;const i=E(s.dataTransfer.items);let a=[];const c=N(i,r),p=S(i,e,n);c&&0===p.rejected.length?null==o||o("valid"):(d.current=!1,c?a=F(p.rejected,n):a.push({severity:"error",summary:n.filePicker_singleFileUploadError()}),null==o||o("invalid"),u.current=t(a,!0,l))}else null==o||o("valid")},onDragLeave:p,onDrop:i=>{if(c.current){if(i.preventDefault(),i.stopPropagation(),!i.dataTransfer)return void(c.current=!1);const o=E(i.dataTransfer.files);let u=!1;if(d.current){let i=[];if(N(o,r)){const r=S(o,e,n);r.rejected.length>0&&(i=F(r.rejected,n),u=!0)}else i.push({severity:"error",summary:n.filePicker_singleFileUploadError()});i.length>0&&(d.current=!1,t(i,!1,l)),d.current&&s(o,a)}p(i,u)}}}};const w=e=>{const[r,i]=m.useState("NA"),n="valid"===r?"oj-c-valid-drop":"invalid"===r?"oj-c-invalid-drop":"",a=m.useRef(null),{validation:l,dragAndDropProps:o,pressProps:c,isHover:d,hoverProps:u}=M(e,a,i),p=s.mergeProps(c,u);C(o,l,e.testHandlersRef||null);const h=j.classNames([I.base,void 0===e.width&&I.maxWidth,d&&I.hover]),{isTabbable:b}=x.useTabbableMode(),{accessibleLabel:v,primaryText:f,secondaryText:g,translations:y,selectionMode:k,width:D,height:S}=e;return t.jsx("div",Object.assign({},p,{class:h,tabIndex:b?0:-1,role:"button","aria-label":P({accessibleLabel:v,isDisabled:!1,translations:y,primaryText:f,secondaryText:g,selectionMode:k}),ref:a,style:_(D,S)},{children:t.jsx("div",Object.assign({class:j.classNames([I.inner,n])},o,{children:T(!1,f,g,y,k)}))}))},R=e=>t.jsx("div",Object.assign({className:$},{children:e})),z=({children:e,accessibleLabel:r,primaryText:s,secondaryText:i,translations:n,selectionMode:a,width:l,height:o})=>t.jsx("div",Object.assign({class:j.classNames([I.base,I.inner,void 0===l&&I.maxWidth,"oj-c-filepicker-disabled"]),role:"button","aria-label":P({accessibleLabel:r,isDisabled:!0,translations:n,primaryText:s,secondaryText:i}),"aria-hidden":"true",style:_(l,o)},{children:e&&R(e)||T(!0,s,i,n,a)})),W=e=>{const r=m.useRef(null),{validation:i,dragAndDropProps:n,pressProps:a,isHover:l,hoverProps:o}=M(e,r),c=s.mergeProps(a,n,o);C(n,i,e.testHandlersRef||null);const d=j.classNames([I.base,void 0===e.width&&I.maxWidth,l&&I.hover]),{accessibleLabel:u,translations:p,selectionMode:h}=e,{isTabbable:b}=x.useTabbableMode();return t.jsx("div",Object.assign({class:d,tabIndex:b?void 0:-1,role:"button","aria-label":P({accessibleLabel:u,isDisabled:!1,translations:p,selectionMode:h}),ref:r,style:_(e.width,e.height)},c,{children:e.children&&R(e.children)}))},C=(e,r,t)=>{m.useImperativeHandle(t,()=>({onDragEnter:e.onDragEnter,onDragOver:e.onDragOver,onDrop:e.onDrop,onDragLeave:e.onDragLeave,onClickSelected:r}))},I={base:"_84he03",maxWidth:"_14zj3eh",inner:"_1x1mqvi",hover:"_16kykbg",pseudohover:"_1k2oomx"},$="_127s51r";e.FilePicker=function(e){var{capture:s="none",isDisabled:i=!1,selectionMode:a="multiple",children:l}=e,o=r.__rest(e,["capture","isDisabled","selectionMode","children"]);const c=o.__testHandlerSymbol,d=n.useTranslationBundle("@oracle/oraclejet-preact"),u=Object.assign({capture:s,selectionMode:a,translations:d},o);return i?t.jsx(z,Object.assign({},u,{children:l})):l?t.jsx(W,Object.assign({testHandlersRef:c},u,{children:l})):t.jsx(w,Object.assign({testHandlersRef:c},u))}});
//# sourceMappingURL=FilePicker-5e3c00f7.js.map
