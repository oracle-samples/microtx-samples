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
    exports.useTextAreaPreact = void 0;
    function useTextAreaPreact(_a, addBusyState) {
        var { autocomplete = 'on', autofocus, converter, disabled, displayOptions, labelEdge, labelHint, labelStartWidth, length, messagesCustom, placeholder, readonly, required, requiredMessageDetail, resizeBehavior, rows, textAlign, userAssistanceDensity, validators, value: propValue, onMessagesCustomChanged, onRawValueChanged, onValueChanged, onValidChanged } = _a, otherProps = __rest(_a, ["autocomplete", "autofocus", "converter", "disabled", "displayOptions", "labelEdge", "labelHint", "labelStartWidth", "length", "messagesCustom", "placeholder", "readonly", "required", "requiredMessageDetail", "resizeBehavior", "rows", "textAlign", "userAssistanceDensity", "validators", "value", "onMessagesCustomChanged", "onRawValueChanged", "onValueChanged", "onValidChanged"]);
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
        return {
            value,
            setValue,
            methods,
            textAreaProps: Object.assign({ autoComplete: autocomplete, autoFocus: autofocus, isDisabled: disabled, isReadonly: readonly, isRequired: required, isRequiredShown: required && hasNoValue, label: labelHint, labelEdge,
                labelStartWidth, maxLength: (length === null || length === void 0 ? void 0 : length.max) ? length.max : undefined, maxLengthUnit: length === null || length === void 0 ? void 0 : length.countBy, maxLengthCounter: length === null || length === void 0 ? void 0 : length.counter, resize: resizeBehavior != 'none' ? resizeBehavior : undefined, rows,
                placeholder,
                textAlign,
                userAssistanceDensity }, textFieldProps)
        };
    }
    exports.useTextAreaPreact = useTextAreaPreact;
});
