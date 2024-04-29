define(["exports","preact/jsx-runtime","preact/compat","preact/hooks","./hooks/UNSAFE_useFocusableTextField","./hooks/UNSAFE_useFormContext","./hooks/UNSAFE_useFormFieldContext","./hooks/UNSAFE_useTextField","./hooks/UNSAFE_useHover","./UNSAFE_Label","./UNSAFE_TextField","./UNSAFE_UserAssistance","css!./UNSAFE_InputPassword.css","./hooks/UNSAFE_useTranslationBundle","./hooks/UNSAFE_usePress","./index-173030cd","./index-696f9e7b","./hooks/UNSAFE_useClearIcon","./utils/UNSAFE_componentUtils","./ClearIcon-9a621af3","./hooks/UNSAFE_useToggle","./hooks/UNSAFE_useCurrentValueReducer","./ReadonlyTextFieldInput-8040cb97","./TextFieldInput-428b8905","./tslib.es6-42e4f430","./hooks/UNSAFE_useFocusWithin","./useFocusWithin-2efc86a8","preact","./hooks/UNSAFE_useId","./utils/UNSAFE_classNames","./classNames-e842f86a","./UNSAFE_LabelValueLayout","./UNSAFE_Flex","./Flex-348d5a41","./utils/UNSAFE_interpolations/dimensions","./utils/UNSAFE_arrayUtils","./utils/UNSAFE_size","./_curry1-a2227576","./utils/UNSAFE_mergeInterpolations","./_curry3-3a3ba6d5","./_curry2-a4242d52","./_has-db711dd4","./utils/UNSAFE_interpolations/boxalignment","./keys-08720ea5","./utils/UNSAFE_interpolations/flexbox","./flexbox-d23eebb7","./utils/UNSAFE_interpolations/flexitem","./flexitem-6045133a","./FormControlUtils-b6d5ae69","./hooks/UNSAFE_useDebounce","./UNSAFE_LiveRegion","./InlineHelpSource-7270d6c0","./hooks/UNSAFE_useTabbableMode","./UNSAFE_ComponentMessage","./ComponentMessage-28fa60d9","./PRIVATE_Message","./utils/PRIVATE_timer","./MessageCloseButton-26d2a151","./UNSAFE_Button","./Button-097e23fc","./UNSAFE_BaseButton","./BaseButton-979c5061","./hooks/UNSAFE_useActive","./utils/PRIVATE_clientHints","./clientHints-45edd40b","./utils/UNSAFE_mergeProps","./MessageDetail-d34864b4","./MessageFormattingUtils-bf5de0fd","./utils/UNSAFE_getLocale","./utils/UNSAFE_stringUtils","./stringUtils-7012261b","./Message.types-23350d23","./MessageStartIcon-66feb809","./MessageSummary-c8e827f6","./MessageTimestamp-839e805a","./MessageUtils-66bef1fe","./utils/UNSAFE_logger","./utils/UNSAFE_soundUtils","./MessagesManager-0c0f108c","./PRIVATE_TransitionGroup","./hooks/UNSAFE_useAnimation","./useAnimation-1a52f0c4","./hooks/UNSAFE_useMessagesContext","./UNSAFE_Icon","./Icon-3f9a8f0d","./hooks/UNSAFE_useTooltip","./UNSAFE_Floating","./Floating-44114750","./index-e6354839","./hooks/UNSAFE_useUser","./UNSAFE_Environment","./UNSAFE_Layer","./utils/PRIVATE_floatingUtils","./utils/PRIVATE_refUtils","./hooks/UNSAFE_useOutsideClick","./hooks/UNSAFE_useFocus","./hooks/UNSAFE_useTouch","./hooks/UNSAFE_useTheme","./UNSAFE_HiddenAccessible","./HiddenAccessible-f22f6877","./ComponentMessageContainer-82d94819","./utils/UNSAFE_interpolations/text","./hooks/UNSAFE_useTextFieldInputHandlers"],function(e,s,o,t,i,l,a,n,u,r,d,c,F,A,b,U,E,S,_,p,x,h,g,N,m,f,v,y,k,C,T,I,R,j,P,V,M,B,D,L,w,H,O,W,q,z,G,J,K,Q,X,Y,Z,$,ee,se,oe,te,ie,le,ae,ne,ue,re,de,ce,Fe,Ae,be,Ue,Ee,Se,_e,pe,xe,he,ge,Ne,me,fe,ve,ye,ke,Ce,Te,Ie,Re,je,Pe,Ve,Me,Be,De,Le,we,He,Oe,We,qe,ze,Ge,Je,Ke){"use strict";const Qe="_1e8ywap";function Xe({isRevealed:e,onPress:o}){const{pressProps:t}=b.usePress(o),i=A.useTranslationBundle("@oracle/oraclejet-preact").inputPassword_hidden();return s.jsx("button",Object.assign({"aria-label":i,role:"switch","aria-checked":!e,class:Qe,tabIndex:0},t,{children:e?s.jsx(E.SvgIcoViewHide,{}):s.jsx(E.SvgIcoView,{})}))}const Ye=o.forwardRef(({ariaDescribedBy:e,assistiveText:o,autoComplete:F="off",autoFocus:A=!1,hasClearIcon:b,hasRevealToggle:U="always",helpSourceLink:E,helpSourceText:m,isDisabled:f,isReadonly:v,isRequired:y=!1,isRequiredShown:k,label:C,labelEdge:T,labelStartWidth:I,messages:R,placeholder:j,textAlign:P,userAssistanceDensity:V,value:M,variant:B="default",onInput:D,onCommit:L},w)=>{const{currentCommitValue:H,dispatch:O}=h.useCurrentValueReducer({value:M}),W=t.useCallback(e=>{O({type:"input",payload:e.value}),null==D||D(e)},[D,O]),q=t.useCallback(e=>{O({type:"commit",payload:e.value}),null==L||L(e)},[L,O]),{isDisabled:z,isReadonly:G,labelEdge:J,labelStartWidth:K,textAlign:Q,userAssistanceDensity:X}=l.useFormContext(),Y=null!=f?f:z,Z=null!=v?v:G,$=null!=T?T:J,ee=null!=I?I:K,se=null!=P?P:Q,oe=null!=V?V:X,{bool:te,setFalse:ie,setTrue:le}=x.useToggle(!1),{enabledElementRef:ae,focusProps:ne,isFocused:ue,readonlyElementRef:re}=i.useFocusableTextField({isDisabled:Y,isReadonly:Z,ref:w,onBlurWithin:ie}),{hoverProps:de,isHover:ce}=u.useHover({isDisabled:Z||Y||!1}),{formFieldContext:Fe,inputProps:Ae,labelProps:be,textFieldProps:Ue,userAssistanceProps:Ee}=n.useTextField({ariaDescribedBy:e,isDisabled:Y,isFocused:ue,isReadonly:Z,labelEdge:$,messages:R,styleVariant:B,value:M}),Se=t.useCallback(()=>{te?ie():le()},[te]),_e=Y||"always"!==U?null:s.jsx(Xe,{onPress:Se,isRevealed:te}),pe=t.useCallback(()=>{var e;null===(e=ae.current)||void 0===e||e.focus(),null==W||W({previousValue:M,value:""})},[D,M]),xe=S.useClearIcon({clearIcon:s.jsx(p.ClearIcon,{onClick:pe}),display:b,hasValue:Fe.hasValue,isFocused:ue,isEnabled:!Z&&!Y,isHover:ce}),he=_.beforeVNode(_e,xe),ge="none"!==$?s.jsx(r.Label,Object.assign({},be,{children:C})):void 0,Ne={label:"none"!==$?ge:void 0,labelEdge:"none"!==$?$:void 0,labelStartWidth:"none"!==$?ee:void 0},me="none"===$?C:void 0,fe=Y||Z?"efficient"!==oe?void 0:s.jsx(c.InlineUserAssistance,Object.assign({userAssistanceDensity:oe},Ee)):s.jsx(c.InlineUserAssistance,Object.assign({assistiveText:o,helpSourceLink:E,helpSourceText:m,messages:R,isRequiredShown:k,userAssistanceDensity:oe},Ee));if(Z)return s.jsx(a.FormFieldContext.Provider,Object.assign({value:Fe},{children:s.jsx(d.ReadonlyTextField,Object.assign({role:"presentation",inlineUserAssistance:fe},Ne,{children:s.jsx(g.ReadonlyTextFieldInput,{ariaDescribedBy:e,ariaLabel:me,ariaLabelledBy:be.id,as:"input",autoFocus:A,elementRef:re,textAlign:se,type:"password",value:M,hasInsideLabel:void 0!==C&&"inside"===$})}))}));const ve=s.jsx(N.TextFieldInput,Object.assign({ariaLabel:me,autoComplete:F,autoFocus:A,currentCommitValue:H,hasInsideLabel:void 0!==ge&&"inside"===$,inputRef:ae,isRequired:y,onInput:W,onCommit:q,placeholder:j,textAlign:se,value:M,type:te?"text":"password"},Ae));return s.jsx(a.FormFieldContext.Provider,Object.assign({value:Fe},{children:s.jsx(d.TextField,Object.assign({endContent:he,inlineUserAssistance:fe,mainContent:ve,onBlur:ne.onfocusout,onFocus:ne.onfocusin},Ue,Ne,de))}))});e.InputPassword=Ye,Object.defineProperty(e,"__esModule",{value:!0})});
//# sourceMappingURL=UNSAFE_InputPassword.js.map
