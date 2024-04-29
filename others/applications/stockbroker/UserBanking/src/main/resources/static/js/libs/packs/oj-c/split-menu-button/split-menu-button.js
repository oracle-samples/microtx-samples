var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_SplitMenuButton", "@oracle/oraclejet-preact/UNSAFE_Menu", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "preact", "preact/hooks", "preact/compat", "ojs/ojvcomponent", "css!oj-c/split-menu-button/split-menu-button-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_SplitMenuButton_1, UNSAFE_Menu_1, UNSAFE_useTabbableMode_1, preact_1, hooks_1, compat_1, ojvcomponent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SplitMenuButton = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    const FunctionalSplitMenuButton = (0, compat_1.forwardRef)((props, ref) => {
        const buttonRef = (0, hooks_1.useRef)(null);
        (0, hooks_1.useImperativeHandle)(ref, () => ({
            focus: () => { var _a; return (_a = buttonRef.current) === null || _a === void 0 ? void 0 : _a.focus(); },
            blur: () => { var _a; return (_a = buttonRef.current) === null || _a === void 0 ? void 0 : _a.blur(); },
            doAction: () => { var _a; return (_a = buttonRef.current) === null || _a === void 0 ? void 0 : _a.dispatchEvent(new Event('ojAction', { bubbles: true })); }
        }), []);
        return (0, jsx_runtime_1.jsx)(UNSAFE_SplitMenuButton_1.SplitMenuButton, Object.assign({ ref: buttonRef }, props));
    });
    let SplitMenuButton = class SplitMenuButton extends preact_1.Component {
        constructor() {
            super(...arguments);
            this.buttonRef = (0, preact_1.createRef)();
            this.renderMenu = (items) => {
                return items.map((item) => {
                    if (item && item.type === 'divider') {
                        return (0, jsx_runtime_1.jsx)(UNSAFE_Menu_1.MenuDivider, {});
                    }
                    else if (item.label) {
                        return ((0, jsx_runtime_1.jsx)(UNSAFE_Menu_1.MenuItem, { label: item.label, isDisabled: item.disabled, onAction: item.onAction }));
                    }
                    else {
                        return;
                    }
                });
            };
        }
        render(props) {
            const { chroming, label, disabled, size, onOjAction: onAction, items } = Object.assign({}, props);
            const widthSize = { width: props.width };
            return props.width ? ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, Object.assign({ style: widthSize }, { children: (0, jsx_runtime_1.jsx)(FunctionalSplitMenuButton, Object.assign({ label: label, ref: this.buttonRef, variant: chroming, size: size, width: '100%', isDisabled: disabled, onAction: onAction }, { children: this.renderMenu(items) })) }))) : ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, { children: (0, jsx_runtime_1.jsx)(FunctionalSplitMenuButton, Object.assign({ label: label, ref: this.buttonRef, variant: chroming, size: size, width: '100%', isDisabled: disabled, onAction: onAction }, { children: this.renderMenu(items) })) }));
        }
        blur() {
            var _a;
            (_a = this.buttonRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        }
        focus() {
            var _a;
            (_a = this.buttonRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
        doAction() {
            var _a;
            (_a = this.buttonRef.current) === null || _a === void 0 ? void 0 : _a.doAction();
        }
    };
    SplitMenuButton.defaultProps = {
        label: '',
        chroming: 'outlined',
        disabled: false,
        size: 'md',
        items: []
    };
    SplitMenuButton._metadata = { "properties": { "label": { "type": "string" }, "items": { "type": "Array<object>" }, "disabled": { "type": "boolean" }, "size": { "type": "string", "enumValues": ["sm", "md", "lg"] }, "width": { "type": "number|string" }, "chroming": { "type": "string", "enumValues": ["outlined", "solid", "callToAction"] } }, "events": { "ojAction": { "bubbles": true } }, "extension": { "_OBSERVED_GLOBAL_PROPS": ["title"] }, "methods": { "blur": {}, "focus": {}, "doAction": {} } };
    SplitMenuButton._translationBundleMap = {
        '@oracle/oraclejet-preact': translationBundle_1.default
    };
    SplitMenuButton._consumedContexts = [UNSAFE_useTabbableMode_1.TabbableModeContext];
    SplitMenuButton = __decorate([
        (0, ojvcomponent_1.customElement)('oj-c-split-menu-button')
    ], SplitMenuButton);
    exports.SplitMenuButton = SplitMenuButton;
});
