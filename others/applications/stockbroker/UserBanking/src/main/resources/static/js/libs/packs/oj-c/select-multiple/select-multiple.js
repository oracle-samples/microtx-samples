var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_SelectMultiple", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "ojs/ojcontext", "ojs/ojvcomponent", "ojs/ojvcomponent-binding", "preact", "preact/compat", "preact/hooks", "oj-c/editable-value/UNSAFE_useAssistiveText/useAssistiveText", "./useSelectMultiplePreact", "@oracle/oraclejet-preact/hooks/UNSAFE_useFormContext", "@oracle/oraclejet-preact/hooks/UNSAFE_useFormVariantContext", "css!oj-c/select-multiple/select-multiple-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_SelectMultiple_1, UNSAFE_useTabbableMode_1, ojcontext_1, ojvcomponent_1, ojvcomponent_binding_1, preact_1, compat_1, hooks_1, useAssistiveText_1, useSelectMultiplePreact_1, UNSAFE_useFormContext_1, UNSAFE_useFormVariantContext_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SelectMultiple = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    ojcontext_1 = __importDefault(ojcontext_1);
    const FunctionalSelectMultiple = (0, compat_1.forwardRef)((props, ref) => {
        const { busyContextRef, displayOptions, help, helpHints } = props;
        const selectMultipleRef = (0, hooks_1.useRef)();
        const addBusyState = (0, hooks_1.useCallback)((desc) => {
            var _a;
            return (_a = busyContextRef.current) === null || _a === void 0 ? void 0 : _a.addBusyState({
                description: `oj-c-select-multiple id=${props.id}: ${desc}`
            });
        }, []);
        const { selectMultipleProps, methods } = (0, useSelectMultiplePreact_1.useSelectMultiplePreact)(props, addBusyState);
        (0, hooks_1.useImperativeHandle)(ref, () => (Object.assign({ blur: () => { var _a; return (_a = selectMultipleRef.current) === null || _a === void 0 ? void 0 : _a.blur(); }, focus: () => { var _a; return (_a = selectMultipleRef.current) === null || _a === void 0 ? void 0 : _a.focus(); } }, methods)), [methods]);
        const assistiveTextProps = (0, useAssistiveText_1.useAssistiveText)({
            displayOptions,
            help,
            helpHints
        });
        const variant = (0, UNSAFE_useFormVariantContext_1.useFormVariantContext)();
        return ((0, jsx_runtime_1.jsx)(UNSAFE_SelectMultiple_1.SelectMultiple, Object.assign({ ref: selectMultipleRef }, assistiveTextProps, selectMultipleProps, { variant: variant })));
    });
    let SelectMultiple = class SelectMultiple extends preact_1.Component {
        constructor() {
            super(...arguments);
            this.busyContextRef = (0, preact_1.createRef)();
            this.selectMultipleRef = (0, preact_1.createRef)();
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
            return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, Object.assign({ id: props.id, ref: this.rootRef }, { children: (0, jsx_runtime_1.jsx)(UNSAFE_useFormContext_1.FormContext.Provider, Object.assign({ value: containerProps }, { children: (0, jsx_runtime_1.jsx)(FunctionalSelectMultiple, Object.assign({ busyContextRef: this.busyContextRef, ref: this.selectMultipleRef }, props)) })) })));
        }
        componentWillUnmount() {
            this.busyContextRef.current = null;
        }
        reset() {
            var _a;
            (_a = this.selectMultipleRef.current) === null || _a === void 0 ? void 0 : _a.reset();
        }
        showMessages() {
            var _a;
            (_a = this.selectMultipleRef.current) === null || _a === void 0 ? void 0 : _a.showMessages();
        }
        validate() {
            var _a;
            return (_a = this.selectMultipleRef.current) === null || _a === void 0 ? void 0 : _a.validate();
        }
        blur() {
            var _a;
            (_a = this.selectMultipleRef.current) === null || _a === void 0 ? void 0 : _a.blur();
        }
        focus() {
            var _a;
            (_a = this.selectMultipleRef.current) === null || _a === void 0 ? void 0 : _a.focus();
        }
    };
    SelectMultiple.defaultProps = {
        data: null,
        disabled: false,
        displayOptions: {
            messages: 'display'
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
        value: null,
        valueItems: null,
        virtualKeyboard: 'auto'
    };
    SelectMultiple._metadata = { "properties": { "containerReadonly": { "type": "boolean", "binding": { "consume": { "name": "containerReadonly" } } }, "data": { "type": "object|null" }, "disabled": { "type": "boolean" }, "displayOptions": { "type": "object", "properties": { "messages": { "type": "string", "enumValues": ["display", "none"] } } }, "help": { "type": "object", "properties": { "instruction": { "type": "string" } } }, "helpHints": { "type": "object", "properties": { "definition": { "type": "string" }, "source": { "type": "string" }, "sourceText": { "type": "string" } } }, "itemText": { "type": "string|number|function" }, "labelEdge": { "type": "string", "enumValues": ["start", "none", "top", "inside"], "binding": { "consume": { "name": "containerLabelEdge" } } }, "labelHint": { "type": "string" }, "labelStartWidth": { "type": "string", "binding": { "consume": { "name": "labelWidth" } } }, "labelWrapping": { "type": "string", "enumValues": ["wrap", "truncate"], "binding": { "consume": { "name": "labelWrapping" } } }, "messagesCustom": { "type": "Array<object>", "writeback": true }, "placeholder": { "type": "string" }, "readonly": { "type": "boolean", "binding": { "consume": { "name": "containerReadonly" } } }, "required": { "type": "boolean" }, "requiredMessageDetail": { "type": "string" }, "textAlign": { "type": "string", "enumValues": ["start", "right", "end"] }, "userAssistanceDensity": { "type": "string", "enumValues": ["reflow", "efficient"], "binding": { "consume": { "name": "containerUserAssistanceDensity" } } }, "value": { "type": "object|null", "writeback": true }, "valueItems": { "type": "object|null", "writeback": true }, "virtualKeyboard": { "type": "string", "enumValues": ["number", "text", "auto", "search", "email", "tel", "url"] }, "valid": { "type": "string", "enumValues": ["valid", "pending", "invalidHidden", "invalidShown"], "readOnly": true, "writeback": true } }, "extension": { "_WRITEBACK_PROPS": ["messagesCustom", "valid", "value", "valueItems"], "_READ_ONLY_PROPS": ["valid"], "_OBSERVED_GLOBAL_PROPS": ["aria-describedby", "id"] }, "methods": { "reset": {}, "showMessages": {}, "validate": {}, "blur": {}, "focus": {} } };
    SelectMultiple._translationBundleMap = {
        '@oracle/oraclejet-preact': translationBundle_1.default
    };
    SelectMultiple._consumedContexts = [UNSAFE_useFormVariantContext_1.FormVariantContext, UNSAFE_useTabbableMode_1.TabbableModeContext];
    SelectMultiple = __decorate([
        (0, ojvcomponent_1.customElement)('oj-c-select-multiple')
    ], SelectMultiple);
    exports.SelectMultiple = SelectMultiple;
});
