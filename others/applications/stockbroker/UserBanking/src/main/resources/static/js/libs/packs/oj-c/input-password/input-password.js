var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/hooks/UNSAFE_useFormContext", "@oracle/oraclejet-preact/hooks/UNSAFE_useFormVariantContext", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "@oracle/oraclejet-preact/UNSAFE_InputPassword", "oj-c/editable-value/UNSAFE_useAssistiveText/useAssistiveText", "ojs/ojcontext", "ojs/ojvcomponent", "ojs/ojvcomponent-binding", "preact", "preact/compat", "preact/hooks", "./useInputPasswordPreact", "css!oj-c/input-password/input-password-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_useFormContext_1, UNSAFE_useFormVariantContext_1, UNSAFE_useTabbableMode_1, UNSAFE_InputPassword_1, useAssistiveText_1, ojcontext_1, ojvcomponent_1, ojvcomponent_binding_1, preact_1, compat_1, hooks_1, useInputPasswordPreact_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InputPassword = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    ojcontext_1 = __importDefault(ojcontext_1);
    const FunctionalInputPassword = (0, compat_1.forwardRef)((props, ref) => {
        const { busyContextRef, displayOptions, help, helpHints, validators } = props;
        const inputPasswordRef = (0, hooks_1.useRef)();
        const addBusyState = (0, hooks_1.useCallback)((desc) => {
            var _a;
            return (_a = busyContextRef.current) === null || _a === void 0 ? void 0 : _a.addBusyState({
                description: `oj-c-input-password id=${props.id} is ${desc}`
            });
        }, [props.id]);
        const { inputPasswordProps, methods } = (0, useInputPasswordPreact_1.useInputPasswordPreact)(props, addBusyState);
        (0, hooks_1.useImperativeHandle)(ref, () => (Object.assign({ blur: () => { var _a; return (_a = inputPasswordRef.current) === null || _a === void 0 ? void 0 : _a.blur(); }, focus: () => { var _a; return (_a = inputPasswordRef.current) === null || _a === void 0 ? void 0 : _a.focus(); } }, methods)), [methods]);
        const assistiveTextProps = (0, useAssistiveText_1.useAssistiveText)({
            displayOptions,
            help,
            helpHints,
            validators
        });
        const variant = (0, UNSAFE_useFormVariantContext_1.useFormVariantContext)();
        return ((0, jsx_runtime_1.jsx)(UNSAFE_InputPassword_1.InputPassword, Object.assign({ ref: inputPasswordRef }, assistiveTextProps, inputPasswordProps, { variant: variant })));
    });
    let InputPassword = class InputPassword extends preact_1.Component {
        constructor() {
            super(...arguments);
            this.busyContextRef = (0, preact_1.createRef)();
            this.inputPasswordRef = (0, preact_1.createRef)();
            this.rootRef = (0, preact_1.createRef)();
        }
        componentDidMount() {
            this.busyContextRef.current = ojcontext_1.default.getContext(this.rootRef.current).getBusyContext();
        }
        render(props) {
            const containerProps = {
                isFormLayout: props.containerReadonly !== undefined,
                isReadonly: props.containerReadonly,
                labelWrapping: props.labelWrapping
            };
            return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, Object.assign({ id: props.id, ref: this.rootRef }, { children: (0, jsx_runtime_1.jsx)(UNSAFE_useFormContext_1.FormContext.Provider, Object.assign({ value: containerProps }, { children: (0, jsx_runtime_1.jsx)(FunctionalInputPassword, Object.assign({ busyContextRef: this.busyContextRef, ref: this.inputPasswordRef }, props)) })) })));
        }
        componentWillUnmount() {
            this.busyContextRef.current = null;
        }
        reset() {
            var _a;
            (_a = this.inputPasswordRef.current) === null || _a === void 0 ? void 0 : _a.reset();
        }
        showMessages() {
            var _a;
            (_a = this.inputPasswordRef.current) === null || _a === void 0 ? void 0 : _a.showMessages();
        }
        validate() {
            var _a;
            return (_a = this.inputPasswordRef.current) === null || _a === void 0 ? void 0 : _a.validate();
        }
        blur() {
            var _a;
            (_a = this.inputPasswordRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        }
        focus() {
            var _a;
            (_a = this.inputPasswordRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    };
    InputPassword.defaultProps = {
        autocomplete: 'on',
        clearIcon: 'never',
        maskIcon: 'visible',
        disabled: false,
        displayOptions: {
            converterHint: 'display',
            messages: 'display',
            validatorHint: 'display'
        },
        help: {
            instruction: ''
        },
        helpHints: {
            definition: '',
            source: '',
            sourceText: undefined
        },
        messagesCustom: [],
        readonly: false,
        required: false,
        userAssistanceDensity: 'reflow',
        validators: [],
        value: null
    };
    InputPassword._metadata = { "properties": { "autocomplete": { "type": "string" }, "clearIcon": { "type": "string", "enumValues": ["always", "never", "conditional"] }, "containerReadonly": { "type": "boolean", "binding": { "consume": { "name": "containerReadonly" } } }, "disabled": { "type": "boolean" }, "displayOptions": { "type": "object", "properties": { "converterHint": { "type": "string", "enumValues": ["display", "none"] }, "messages": { "type": "string", "enumValues": ["display", "none"] }, "validatorHint": { "type": "string", "enumValues": ["display", "none"] } } }, "help": { "type": "object", "properties": { "instruction": { "type": "string" } } }, "helpHints": { "type": "object", "properties": { "definition": { "type": "string" }, "source": { "type": "string" }, "sourceText": { "type": "string" } } }, "labelEdge": { "type": "string", "enumValues": ["start", "none", "top", "inside"], "binding": { "consume": { "name": "containerLabelEdge" } } }, "labelHint": { "type": "string" }, "labelStartWidth": { "type": "string", "binding": { "consume": { "name": "labelWidth" } } }, "labelWrapping": { "type": "string", "enumValues": ["wrap", "truncate"], "binding": { "consume": { "name": "labelWrapping" } } }, "maskIcon": { "type": "string", "enumValues": ["hidden", "visible"] }, "messagesCustom": { "type": "Array<object>", "writeback": true }, "placeholder": { "type": "string" }, "readonly": { "type": "boolean", "binding": { "consume": { "name": "containerReadonly" } } }, "required": { "type": "boolean" }, "requiredMessageDetail": { "type": "string" }, "textAlign": { "type": "string", "enumValues": ["start", "right", "end"] }, "userAssistanceDensity": { "type": "string", "enumValues": ["reflow", "efficient"], "binding": { "consume": { "name": "containerUserAssistanceDensity" } } }, "validators": { "type": "Array<object>|null" }, "value": { "type": "string|null", "writeback": true }, "rawValue": { "type": "string", "readOnly": true, "writeback": true }, "valid": { "type": "string", "enumValues": ["valid", "pending", "invalidHidden", "invalidShown"], "readOnly": true, "writeback": true } }, "extension": { "_WRITEBACK_PROPS": ["messagesCustom", "rawValue", "valid", "value"], "_READ_ONLY_PROPS": ["rawValue", "valid"], "_OBSERVED_GLOBAL_PROPS": ["aria-describedby", "autofocus", "id"] }, "methods": { "reset": {}, "showMessages": {}, "validate": {}, "blur": {}, "focus": {} } };
    InputPassword._translationBundleMap = {
        '@oracle/oraclejet-preact': translationBundle_1.default
    };
    InputPassword._consumedContexts = [UNSAFE_useFormVariantContext_1.FormVariantContext, UNSAFE_useTabbableMode_1.TabbableModeContext];
    InputPassword = __decorate([
        (0, ojvcomponent_1.customElement)('oj-c-input-password')
    ], InputPassword);
    exports.InputPassword = InputPassword;
});
