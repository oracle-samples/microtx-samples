define(["exports","preact","preact/hooks"],function(e,t,b){"use strict";const a=t.createContext({isTabbable:!0});e.TabbableModeContext=a,e.useTabbableMode=function(){const{isTabbable:e}=b.useContext(a);return{isTabbable:e,tabbableModeProps:{tabIndex:!1===e?-1:0}}},Object.defineProperty(e,"__esModule",{value:!0})});
//# sourceMappingURL=UNSAFE_useTabbableMode.js.map
