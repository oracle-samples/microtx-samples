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
define(["require", "exports", "oj-c/editable-value/utils/utils", "oj-c/editable-value/UNSAFE_useEditableValue/useEditableValue"], function (require, exports, utils_1, useEditableValue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useInputTextPreact = void 0;
    function useInputTextPreact(_a, addBusyState) {
        var { autocomplete = 'on', autofocus, clearIcon = 'never', converter, disabled, displayOptions, end, inputPrefix, inputSuffix, labelEdge, labelHint, labelStartWidth, length, messagesCustom, placeholder, readonly, required, requiredMessageDetail, start, textAlign, userAssistanceDensity, validators, value: propValue, virtualKeyboard, onMessagesCustomChanged, onRawValueChanged, onValidChanged, onValueChanged } = _a, otherProps = __rest(_a, ["autocomplete", "autofocus", "clearIcon", "converter", "disabled", "displayOptions", "end", "inputPrefix", "inputSuffix", "labelEdge", "labelHint", "labelStartWidth", "length", "messagesCustom", "placeholder", "readonly", "required", "requiredMessageDetail", "start", "textAlign", "userAssistanceDensity", "validators", "value", "virtualKeyboard", "onMessagesCustomChanged", "onRawValueChanged", "onValidChanged", "onValueChanged"]);
        const { methods, textFieldProps, value, setValue } = (0, useEditableValue_1.useEditableValue)({
            ariaDescribedBy: otherProps['aria-describedby'],
            converter,
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
        return {
            value,
            setValue,
            methods,
            inputTextProps: Object.assign({ autoComplete: autocomplete, autoFocus: autofocus, hasClearIcon, endContent: end, isDisabled: disabled, isReadonly: readonly, isRequired: required, isRequiredShown: required && hasNoValue, label: labelHint, labelEdge,
                labelStartWidth, maxLength: (0, utils_1.treatNull)(length === null || length === void 0 ? void 0 : length.max), maxLengthUnit: length === null || length === void 0 ? void 0 : length.countBy, placeholder, prefix: inputPrefix, startContent: start, suffix: inputSuffix, textAlign,
                userAssistanceDensity,
                virtualKeyboard }, textFieldProps)
        };
    }
    exports.useInputTextPreact = useInputTextPreact;
});
