define(["exports","./UNSAFE_useToggle","preact/hooks"],function(e,s,o){"use strict";e.useHover=function(e={isDisabled:!1}){const{bool:o,setTrue:t,setFalse:u}=s.useToggle(!1),{bool:r,setTrue:n,setFalse:i}=s.useToggle(!1),l=e.isDisabled?{}:{ontouchend:n,onMouseEnter:()=>{r?i():t()},onMouseLeave:u};return{isHover:!e.isDisabled&&o,hoverProps:l}},Object.defineProperty(e,"__esModule",{value:!0})});
//# sourceMappingURL=UNSAFE_useHover.js.map
