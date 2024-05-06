var __awaiter=this&&this.__awaiter||function(t,e,a,n){return new(a||(a=Promise))((function(o,r){function i(t){try{u(n.next(t))}catch(t){r(t)}}function s(t){try{u(n.throw(t))}catch(t){r(t)}}function u(t){var e;t.done?o(t.value):(e=t.value,e instanceof a?e:new a((function(t){t(e)}))).then(i,s)}u((n=n.apply(t,e||[])).next())}))};define("oj-c/hooks/UNSAFE_useDataProvider/utils",["require","exports"],(function(require,t){"use strict";function e(t,e,a,n){const o=[...n];return t.forEach(((t,n)=>{var r;const i={data:e[n],key:null===(r=a[n])||void 0===r?void 0:r.key,metadata:a[n]};t>=0?o.splice(t,0,i):o.push(i)})),o}function a(t,e){return __awaiter(this,void 0,void 0,(function*(){const a=[],n=(yield t.fetchByKeys({keys:e})).results;for(const t of e)if(n.has(t)){const e=n.get(t);a.push(Object.assign(Object.assign({},e),{key:t}))}return a}))}function n(t,e){return t.has(e)?t.get(e):-1}function o(t,e){const a=[...e];return t.sort(((t,e)=>e-t)),t.forEach((t=>{t<a.length&&a.splice(t,1)})),a}Object.defineProperty(t,"__esModule",{value:!0}),t.getUpdatedItemsFromMutationDetail=void 0,t.getUpdatedItemsFromMutationDetail=function(t,r,i){return __awaiter(this,void 0,void 0,(function*(){const{add:s,remove:u,update:d}=null!=t?t:{},l=new Map;for(const[t,e]of r.entries())l.set(e.key,t);let c=[...r];return u&&(c=function(t,e,a){const{indexes:r,keys:i}=t;let s=[...e];(null==r?void 0:r.length)?s=o(r,s):(null==i?void 0:i.size)&&(s=function(t,e,a){const r=[];return t.forEach((t=>{const e=n(a,t);-1!==e&&r.push(e)})),o(r,e)}(i,s,a));return s}(u,c,l)),s&&(c=yield function(t,o,r,i){var s;return __awaiter(this,void 0,void 0,(function*(){const{addBeforeKeys:u,data:d,indexes:l,keys:c,metadata:f}=t;let v=[...o],h=d||[],y=f||[];if(0===h.length&&(null==c?void 0:c.size)){const t=null!==(s=yield a(i,c))&&void 0!==s?s:[];h=t.map((t=>t.data)),y=t.map((t=>t.metadata))}return 0===y.length&&(null==c?void 0:c.size)&&(y=[...c].map((t=>({key:t})))),h.length&&(v=(null==l?void 0:l.length)?e(l,h,y,v):(null==u?void 0:u.length)?function(t,a,o,r){const i=[],s=[];return t.forEach((t=>{i.push(n(r,t)),s.push({key:t})})),e(i,a,s,o)}(u,h,v,r):function(t,a,n){return e(new Array(t.length).fill(-1),t,a,n)}(h,y,v)),v}))}(s,c,l,i)),d&&(c=yield function(t,e,o,r){var i;return __awaiter(this,void 0,void 0,(function*(){const{data:s,indexes:u,keys:d,metadata:l}=t;let c=[...e],f=s||[],v=l||[];if(0===f.length&&(null==d?void 0:d.size)){const t=null!==(i=yield a(r,d))&&void 0!==i?i:[];f=t.map((t=>t.data)),v=t.map((t=>t.metadata))}return 0===v.length&&(null==d?void 0:d.size)&&(v=[...d].map((t=>({key:t})))),f.length&&((null==u?void 0:u.length)?c=function(t,e,a,n){const o=[...n];return t.forEach(((t,n)=>{var r;if(o[t]){const i={data:e[n],key:null===(r=a[n])||void 0===r?void 0:r.key,metadata:a[n]};o.splice(t,1,i)}})),o}(u,f,v,c):(null==d?void 0:d.size)&&(c=function(t,e,a,o,r){const i=[...o];return t.forEach((t=>{var o;const s=n(r,t),u={data:e[s],key:null===(o=a[s])||void 0===o?void 0:o.key,metadata:a[s]};s>=0&&i.splice(s,1,u)})),i}(d,f,v,c,o))),c}))}(d,c,l,i)),c}))}}));__awaiter=this&&this.__awaiter||function(t,e,a,n){return new(a||(a=Promise))((function(o,r){function i(t){try{u(n.next(t))}catch(t){r(t)}}function s(t){try{u(n.throw(t))}catch(t){r(t)}}function u(t){var e;t.done?o(t.value):(e=t.value,e instanceof a?e:new a((function(t){t(e)}))).then(i,s)}u((n=n.apply(t,e||[])).next())}))};var __asyncValues=this&&this.__asyncValues||function(t){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var e,a=t[Symbol.asyncIterator];return a?a.call(t):(t="function"==typeof __values?__values(t):t[Symbol.iterator](),e={},n("next"),n("throw"),n("return"),e[Symbol.asyncIterator]=function(){return this},e);function n(a){e[a]=t[a]&&function(e){return new Promise((function(n,o){(function(t,e,a,n){Promise.resolve(n).then((function(e){t({value:e,done:a})}),e)})(n,o,(e=t[a](e)).done,e.value)}))}}};define("oj-c/hooks/UNSAFE_useDataProvider/DataProviderHandler",["require","exports","./utils"],(function(require,t,e){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.DataProviderHandler=void 0;t.DataProviderHandler=class{constructor(t,a,n){this.handleMutateEvent=t=>__awaiter(this,void 0,void 0,(function*(){var a,n;const{detail:o}=t,r=this.addBusyState("updating data from mutation event"),i=yield(0,e.getUpdatedItemsFromMutationDetail)(o,this.currentData,this.dataProvider);null==r||r(),this.currentData=i,null===(n=null===(a=this.callback)||void 0===a?void 0:a.onDataUpdated)||void 0===n||n.call(a,i)})),this.handleRefreshEvent=()=>{this._fetchDataAndNotify()},this.addBusyState=a,this.callback=n,this.dataProvider=t,this.currentData=[],t.addEventListener("refresh",this.handleRefreshEvent),t.addEventListener("mutate",this.handleMutateEvent),this._fetchDataAndNotify()}destroy(){this.callback=void 0,this.currentData=[],this.dataProvider.removeEventListener("refresh",this.handleRefreshEvent),this.dataProvider.removeEventListener("mutate",this.handleMutateEvent)}_fetchData(){var t,e;return __awaiter(this,void 0,void 0,(function*(){const a=[],n=this.dataProvider.fetchFirst({size:-1});try{for(var o,r=__asyncValues(n);!(o=yield r.next()).done;){const t=o.value,e=t.data.map(((e,a)=>({data:e,key:t.metadata[a].key,metadata:t.metadata[a]})));a.push(...e)}}catch(e){t={error:e}}finally{try{o&&!o.done&&(e=r.return)&&(yield e.call(r))}finally{if(t)throw t.error}}return this.currentData=a.slice(),a}))}_fetchDataAndNotify(){var t,e;return __awaiter(this,void 0,void 0,(function*(){const a=this.addBusyState("fetching data"),n=yield this._fetchData();null===(e=null===(t=this.callback)||void 0===t?void 0:t.onDataUpdated)||void 0===e||e.call(t,n),a()}))}}})),define("oj-c/hooks/UNSAFE_useDataProvider/useDataProvider",["require","exports","preact/hooks","./DataProviderHandler"],(function(require,t,e,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.useDataProvider=void 0,t.useDataProvider=function({addBusyState:t,data:n}){const[o,r]=(0,e.useState)([]),i=(0,e.useRef)();return(0,e.useEffect)((()=>(void 0!==n&&(i.current=new a.DataProviderHandler(n,t,{onDataUpdated:r})),()=>{var t;null===(t=i.current)||void 0===t||t.destroy(),i.current=void 0})),[n,t]),{data:o}}}));var __importDefault=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};define("oj-c/message-toast/message-toast",["require","exports","preact/jsx-runtime","@oracle/oraclejet-preact/translationBundle","@oracle/oraclejet-preact/hooks/UNSAFE_useMessagesContext","@oracle/oraclejet-preact/UNSAFE_MessageToast","oj-c/hooks/UNSAFE_useDataProvider/useDataProvider","ojs/ojcontext","ojs/ojvcomponent","preact/hooks","css!./message-toast/message-toast-styles.css"],(function(require,t,e,a,n,o,r,i,s,u){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.MessageToast=void 0,a=__importDefault(a),i=__importDefault(i),t.MessageToast=(0,s.registerCustomElement)("oj-c-message-toast",(({data:t,detailTemplateValue:a,iconTemplateValue:d,messageTemplates:l,offset:c=0,position:f="bottom",onOjClose:v})=>{const h=(0,u.useRef)(!0),y=(0,u.useRef)(),[p,m]=(0,u.useState)(Symbol()),_=(0,u.useCallback)(((t="MessageToast: busyState")=>y.current?i.default.getContext(y.current).getBusyContext().addBusyState({description:t}):()=>{}),[]);(0,u.useEffect)((()=>{h.current?h.current=!1:m(Symbol())}),[t]);const{data:g}=(0,r.useDataProvider)({data:t,addBusyState:_}),D=(0,u.useMemo)((()=>({addBusyState:_})),[]);return(0,e.jsx)(s.Root,Object.assign({ref:y},{children:(0,e.jsx)(n.MessagesContext.Provider,Object.assign({value:D},{children:(0,e.jsx)(o.MessageToast,{data:g,detailRendererKey:a,iconRendererKey:d,offset:c,onClose:v,position:f,renderers:l},p)}))}))}),"MessageToast",{properties:{data:{type:"object"},detailTemplateValue:{type:"string|function"},iconTemplateValue:{type:"string|function"},offset:{type:"number|object"},position:{type:"string",enumValues:["bottom","top","top-start","top-end","bottom-start","bottom-end","top-left","top-right","bottom-left","bottom-right"]}},extension:{_DYNAMIC_SLOT:{prop:"messageTemplates",isTemplate:1}},events:{ojClose:{}}},{offset:0,position:"bottom"},{"@oracle/oraclejet-preact":a.default})}));
//# sourceMappingURL=message-toast.js.map