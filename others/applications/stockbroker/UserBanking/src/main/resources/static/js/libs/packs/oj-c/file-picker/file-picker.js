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
define(["require", "exports", "preact/jsx-runtime", '@oracle/oraclejet-preact/translationBundle', "@oracle/oraclejet-preact/UNSAFE_FilePicker", "preact/hooks", "preact/compat", "ojs/ojvcomponent", "@oracle/oraclejet-preact/hooks/UNSAFE_useTabbableMode", "../utils/UNSAFE_focusTabUtils/focusUtils", "css!oj-c/file-picker/file-picker-styles.css"], function (require, exports, jsx_runtime_1, translationBundle_1, UNSAFE_FilePicker_1, hooks_1, compat_1, ojvcomponent_1, UNSAFE_useTabbableMode_1, focusUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FilePicker = void 0;
    translationBundle_1 = __importDefault(translationBundle_1);
    const getPrimaryText = (primaryText) => {
        if (typeof primaryText === 'function') {
            return primaryText();
        }
        return primaryText;
    };
    const getSecondaryText = (secondaryText, selectionMode) => {
        if (typeof secondaryText === 'function') {
            return secondaryText({ selectionMode: selectionMode });
        }
        return secondaryText;
    };
    exports.FilePicker = (0, ojvcomponent_1.registerCustomElement)('oj-c-file-picker', (0, compat_1.forwardRef)((_a, ref) => {
        var { capture = 'none', disabled = false, selectionMode = 'multiple' } = _a, otherProps = __rest(_a, ["capture", "disabled", "selectionMode"]);
        const onCommit = (0, hooks_1.useCallback)((event) => {
            var _a;
            (_a = otherProps.onOjBeforeSelect) === null || _a === void 0 ? void 0 : _a.call(otherProps, { files: event.files }).then(() => {
                var _a;
                (_a = otherProps.onOjSelect) === null || _a === void 0 ? void 0 : _a.call(otherProps, { files: event.files });
            }, (messages) => {
                var _a;
                (_a = otherProps.onOjInvalidSelect) === null || _a === void 0 ? void 0 : _a.call(otherProps, { messages: messages, until: null });
            });
        }, [otherProps.onOjBeforeSelect, otherProps.onOjSelect, otherProps.onOjInvalidSelect]);
        (0, hooks_1.useImperativeHandle)(ref, () => ({
            focus: () => (0, focusUtils_1.focusFirstTabStop)(rootRef.current),
            blur: () => {
                var _a;
                const focusElement = document.activeElement;
                if ((_a = rootRef.current) === null || _a === void 0 ? void 0 : _a.contains(focusElement)) {
                    focusElement.blur();
                }
            }
        }));
        const rootRef = (0, hooks_1.useRef)(null);
        return ((0, jsx_runtime_1.jsx)(ojvcomponent_1.Root, Object.assign({ ref: rootRef, class: otherProps.trigger ? 'oj-c-file-picker-with-trigger' : undefined }, { children: (0, jsx_runtime_1.jsx)(UNSAFE_FilePicker_1.FilePicker, Object.assign({ capture: capture, isDisabled: disabled, selectionMode: selectionMode, onCommit: onCommit, onReject: otherProps.onOjInvalidSelect, accept: otherProps.accept, primaryText: getPrimaryText(otherProps.primaryText), secondaryText: getSecondaryText(otherProps.secondaryText, selectionMode), accessibleLabel: otherProps['aria-label'], width: "100%" }, { children: otherProps.trigger })) })));
    }), "FilePicker", { "properties": { "accept": { "type": "Array<string>" }, "capture": { "type": "string", "enumValues": ["none", "user", "environment", "implementation"] }, "disabled": { "type": "boolean" }, "primaryText": { "type": "string|function" }, "secondaryText": { "type": "string|function" }, "selectionMode": { "type": "string", "enumValues": ["multiple", "single"] } }, "slots": { "trigger": {} }, "events": { "ojBeforeSelect": { "cancelable": true }, "ojInvalidSelect": {}, "ojSelect": {} }, "extension": { "_OBSERVED_GLOBAL_PROPS": ["aria-label"] }, "methods": { "focus": {}, "blur": {} } }, { "capture": "none", "disabled": false, "selectionMode": "multiple" }, {
        '@oracle/oraclejet-preact': translationBundle_1.default
    }, { consume: [UNSAFE_useTabbableMode_1.TabbableModeContext] });
});
