var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_Button", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "preact", "preact/hooks", "preact/compat", "ojs/ojvcomponent", "css!oj-c/button/button-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_Button_1, UNSAFE_useTabbableMode_1, preact_1, hooks_1, compat_1, ojvcomponent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Button = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    const FunctionalButton = (0, compat_1.forwardRef)((props, ref) => {
        const buttonRef = (0, hooks_1.useRef)();
        (0, hooks_1.useImperativeHandle)(ref, () => ({
            focus: () => { var _a; return (_a = buttonRef.current) === null || _a === void 0 ? void 0 : _a.focus(); },
            blur: () => { var _a; return (_a = buttonRef.current) === null || _a === void 0 ? void 0 : _a.blur(); }
        }), []);
        return (0, jsx_runtime_1.jsx)(UNSAFE_Button_1.Button, Object.assign({ ref: buttonRef }, props));
    });
    let Button = class Button extends preact_1.Component {
        constructor() {
            super(...arguments);
            this.buttonRef = (0, preact_1.createRef)();
        }
        render(props) {
            const widthSize = { width: props.edge === 'bottom' ? '100%' : props.width };
            const _a = Object.assign({}, props), { chroming: variant, disabled: isDisabled, onOjAction: onAction, 'aria-label': accessibleLabel, width: throwAwayWidth } = _a, otherProps = __rest(_a, ["chroming", "disabled", "onOjAction", 'aria-label', "width"]);
            return props.width || props.edge !== 'none' ? ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, Object.assign({ style: widthSize }, { children: (0, jsx_runtime_1.jsx)(FunctionalButton, Object.assign({ ref: this.buttonRef, variant: variant, isDisabled: isDisabled, width: '100%', onAction: onAction, accessibleLabel: accessibleLabel }, otherProps)) }))) : ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, { children: (0, jsx_runtime_1.jsx)(FunctionalButton, Object.assign({ ref: this.buttonRef, variant: variant, isDisabled: isDisabled, width: '100%', onAction: onAction, accessibleLabel: accessibleLabel }, otherProps)) }));
        }
        blur() {
            var _a;
            (_a = this.buttonRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        }
        focus() {
            var _a;
            (_a = this.buttonRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    };
    Button.defaultProps = {
        chroming: 'outlined',
        disabled: false,
        size: 'md',
        display: 'all',
        endIcon: null,
        startIcon: null,
        edge: 'none'
    };
    Button._metadata = { "properties": { "label": { "type": "string" }, "disabled": { "type": "boolean" }, "width": { "type": "number|string" }, "display": { "type": "string", "enumValues": ["label", "icons", "all"] }, "size": { "type": "string", "enumValues": ["sm", "md", "lg"] }, "edge": { "type": "string", "enumValues": ["none", "bottom"] }, "chroming": { "type": "string", "enumValues": ["borderless", "outlined", "solid", "callToAction", "danger"] } }, "slots": { "startIcon": {}, "endIcon": {} }, "events": { "ojAction": { "bubbles": true } }, "extension": { "_OBSERVED_GLOBAL_PROPS": ["title", "aria-label"] }, "methods": { "blur": {}, "focus": {} } };
    Button._translationBundleMap = {
        '@oracle/oraclejet-preact': translationBundle_1.default
    };
    Button._consumedContexts = [UNSAFE_useTabbableMode_1.TabbableModeContext];
    Button = __decorate([
        (0, ojvcomponent_1.customElement)('oj-c-button')
    ], Button);
    exports.Button = Button;
});
