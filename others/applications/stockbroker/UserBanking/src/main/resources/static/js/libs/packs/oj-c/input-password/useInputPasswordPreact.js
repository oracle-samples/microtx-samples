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
define(["require", "exports", "oj-c/editable-value/UNSAFE_useEditableValue/useEditableValue"], function (require, exports, useEditableValue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useInputPasswordPreact = void 0;
    function useInputPasswordPreact(_a, addBusyState) {
        var { autocomplete = 'on', autofocus, clearIcon = 'never', disabled, displayOptions, labelEdge, labelHint, labelStartWidth, maskIcon, messagesCustom, placeholder, readonly, required, requiredMessageDetail, textAlign, userAssistanceDensity, validators, value: propValue, onMessagesCustomChanged, onRawValueChanged, onValidChanged, onValueChanged } = _a, otherProps = __rest(_a, ["autocomplete", "autofocus", "clearIcon", "disabled", "displayOptions", "labelEdge", "labelHint", "labelStartWidth", "maskIcon", "messagesCustom", "placeholder", "readonly", "required", "requiredMessageDetail", "textAlign", "userAssistanceDensity", "validators", "value", "onMessagesCustomChanged", "onRawValueChanged", "onValidChanged", "onValueChanged"]);
        const { methods, textFieldProps, value, setValue } = (0, useEditableValue_1.useEditableValue)({
            ariaDescribedBy: otherProps['aria-describedby'],
            displayOptions,
            messagesCustom,
            required,
            requiredMessageDetail,
            validators,
            value: propValue,
            addBusyState,
            onMessagesCustomChanged,
            onRawValueChanged,
            onValidChanged,
            onValueChanged
        });
        const hasNoValue = value === null || (typeof value === 'string' && value === '');
        const hasClearIcon = clearIcon === 'conditional' ? 'conditionally' : clearIcon;
        const hasRevealToggle = maskIcon === 'hidden' ? 'never' : 'always';
        return {
            value,
            setValue,
            methods,
            inputPasswordProps: Object.assign({ autoComplete: autocomplete, autoFocus: autofocus, hasClearIcon: hasClearIcon, hasRevealToggle, isDisabled: disabled, isReadonly: readonly, isRequired: required, isRequiredShown: required && hasNoValue, label: labelHint, labelEdge: labelEdge, labelStartWidth,
                placeholder,
                textAlign,
                userAssistanceDensity }, textFieldProps)
        };
    }
    exports.useInputPasswordPreact = useInputPasswordPreact;
});
