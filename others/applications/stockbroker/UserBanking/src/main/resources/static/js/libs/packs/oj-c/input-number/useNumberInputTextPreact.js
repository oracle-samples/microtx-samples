var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
define(["require", "exports", "oj-c/editable-value/UNSAFE_useEditableValue/useEditableValue", "oj-c/editable-value/UNSAFE_useValidators/useValidators", "./useImplicitNumberConverter", "./useImplicitNumberRangeValidator", "preact/hooks", "oj-c/editable-value/utils/utils", "./stepBasisUtils"], function (require, exports, useEditableValue_1, useValidators_1, useImplicitNumberConverter_1, useImplicitNumberRangeValidator_1, hooks_1, utils_1, stepBasisUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useNumberInputTextPreact = void 0;
    function useNumberInputTextPreact(_a, addBusyState) {
        var { autocomplete = 'on', autofocus, converter: propConverter, disabled, displayOptions, inputPrefix, inputSuffix, labelEdge, labelHint, labelStartWidth, max, messagesCustom, min, numberRangeExactMessageDetail, numberRangeOverflowMessageDetail, numberRangeUnderflowMessageDetail, placeholder, readonly, required, requiredMessageDetail, step, textAlign, userAssistanceDensity, validators, value: propValue, virtualKeyboard, onMessagesCustomChanged, onRawValueChanged, onTransientValueChanged, onValidChanged, onValueChanged } = _a, otherProps = __rest(_a, ["autocomplete", "autofocus", "converter", "disabled", "displayOptions", "inputPrefix", "inputSuffix", "labelEdge", "labelHint", "labelStartWidth", "max", "messagesCustom", "min", "numberRangeExactMessageDetail", "numberRangeOverflowMessageDetail", "numberRangeUnderflowMessageDetail", "placeholder", "readonly", "required", "requiredMessageDetail", "step", "textAlign", "userAssistanceDensity", "validators", "value", "virtualKeyboard", "onMessagesCustomChanged", "onRawValueChanged", "onTransientValueChanged", "onValidChanged", "onValueChanged"]);
        const minTreatNull = (0, utils_1.treatNull)(min);
        const maxTreatNull = (0, utils_1.treatNull)(max);
        const converter = (0, useImplicitNumberConverter_1.useImplicitNumberConverter)({
            converter: propConverter
        });
        const implicitComponentValidator = (0, useImplicitNumberRangeValidator_1.useImplicitNumberRangeValidator)({
            converter,
            max: maxTreatNull,
            min: minTreatNull,
            numberRangeExactMessageDetail,
            numberRangeOverflowMessageDetail,
            numberRangeUnderflowMessageDetail
        });
        const { onCommitValue, format, normalizeAndParseValue, methods, textFieldProps, value, setValue, displayValue, setDisplayValue, setTransientValue } = (0, useEditableValue_1.useEditableValue)({
            ariaDescribedBy: otherProps['aria-describedby'],
            converter,
            displayOptions,
            implicitComponentValidator,
            messagesCustom,
            required,
            requiredMessageDetail,
            validators,
            value: propValue,
            addBusyState,
            onMessagesCustomChanged,
            onRawValueChanged,
            onTransientValueChanged,
            onValidChanged,
            onValueChanged
        });
        const hasMin = minTreatNull !== undefined;
        const hasMax = maxTreatNull !== undefined;
        const initialValue = (0, hooks_1.useRef)((0, utils_1.treatNull)(propValue));
        if (propValue !== value) {
            initialValue.current = (0, utils_1.treatNull)(propValue);
        }
        const [valueNow, setValueNow] = (0, hooks_1.useState)((0, utils_1.treatNull)(value) || undefined);
        (0, hooks_1.useEffect)(() => {
            setValueNow((0, utils_1.treatNull)(value));
            setTransientValue(value);
        }, [value]);
        const [valueText, setValueText] = (0, hooks_1.useState)(displayValue || undefined);
        (0, hooks_1.useEffect)(() => {
            if (value === null) {
                setValueText(undefined);
            }
            else {
                const formattedValue = format(value);
                setValueText(formattedValue);
            }
        }, [value, converter]);
        const onCommit = (0, hooks_1.useCallback)(({ value }) => __awaiter(this, void 0, void 0, function* () {
            const parsedValueOrSymbol = normalizeAndParseValue(value);
            const parsedValue = parsedValueOrSymbol;
            if (typeof parsedValueOrSymbol === 'symbol') {
                setValueNow(undefined);
                setValueText(value);
                return;
            }
            const validationResult = yield onCommitValue(parsedValue);
            if (validationResult === useValidators_1.ValidationResult.VALID) {
                const formattedValue = format(parsedValue);
                setDisplayValue(formattedValue);
            }
            else {
                setValueNow(parsedValue);
                setValueText(value);
            }
        }), [format, normalizeAndParseValue, onCommitValue]);
        const textFieldPropsWithOverride = Object.assign(Object.assign({}, textFieldProps), { onCommit });
        const doStep = (0, hooks_1.useCallback)((direction, doCommit) => __awaiter(this, void 0, void 0, function* () {
            if (step === undefined) {
                return;
            }
            const displayValueToStep = displayValue || '0';
            const parsedValueOrSymbol = normalizeAndParseValue(displayValueToStep);
            if (typeof parsedValueOrSymbol === 'symbol') {
                return;
            }
            const parsedValue = parsedValueOrSymbol;
            let newSteppedValue;
            if (direction !== undefined) {
                const stepValue = direction === 'increase' ? step : -1 * step;
                newSteppedValue = (0, stepBasisUtils_1.determineSteppedValue)(stepValue, step, parsedValue, initialValue.current, maxTreatNull, minTreatNull);
            }
            else {
                newSteppedValue = parsedValue;
            }
            const validationResult = yield onCommitValue(newSteppedValue, doCommit);
            if (validationResult === useValidators_1.ValidationResult.VALID) {
                setTransientValue(newSteppedValue);
            }
            const formattedValue = format(newSteppedValue);
            setDisplayValue(formattedValue);
            setValueText(formattedValue);
            setValueNow(newSteppedValue);
        }), [value, displayValue, format, normalizeAndParseValue, onCommitValue]);
        const handleStep = (0, hooks_1.useCallback)(({ direction }) => __awaiter(this, void 0, void 0, function* () {
            const doCommit = true;
            doStep(direction, doCommit);
        }), [doStep]);
        const handleSpin = (0, hooks_1.useCallback)(({ direction }) => __awaiter(this, void 0, void 0, function* () {
            const doCommit = false;
            doStep(direction, doCommit);
        }), [doStep]);
        const handleSpinComplete = (0, hooks_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
            const doCommit = true;
            doStep(undefined, doCommit);
        }), [displayValue, normalizeAndParseValue, onCommitValue]);
        return {
            value,
            setValue,
            methods,
            inputNumberProps: Object.assign({ ariaValueMax: maxTreatNull, ariaValueMin: minTreatNull, ariaValueNow: valueNow !== null && valueNow !== void 0 ? valueNow : undefined, ariaValueText: valueText !== '' ? valueText : undefined, autoComplete: autocomplete, autoFocus: autofocus, hasSteppers: step !== undefined && step > 0, isDisabled: disabled, isReadonly: readonly, isRequired: required, isRequiredShown: required && (0, utils_1.treatNull)(value) === undefined, label: labelHint, labelEdge,
                labelStartWidth, onSpin: step ? handleSpin : undefined, onSpinComplete: step ? handleSpinComplete : undefined, onStep: step ? handleStep : undefined, placeholder, prefix: inputPrefix, suffix: inputSuffix, isStepDownDisabled: disabled ||
                    (hasMin &&
                        ((valueNow !== undefined && valueNow <= minTreatNull) ||
                            (displayValue === '' && minTreatNull === 0))), isStepUpDisabled: disabled ||
                    (hasMax &&
                        ((valueNow !== undefined && valueNow >= maxTreatNull) ||
                            (displayValue === '' && maxTreatNull === 0))), textAlign,
                userAssistanceDensity,
                virtualKeyboard }, textFieldPropsWithOverride)
        };
    }
    exports.useNumberInputTextPreact = useNumberInputTextPreact;
});
