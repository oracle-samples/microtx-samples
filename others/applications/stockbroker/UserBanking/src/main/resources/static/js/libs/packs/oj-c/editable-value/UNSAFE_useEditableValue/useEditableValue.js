var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "preact/hooks", "../UNSAFE_useComponentMessaging/useComponentMessaging", "../UNSAFE_useConverter/useConverter", "../UNSAFE_useConverterLifecycle/useConverterLifecycle", "../UNSAFE_useDeferredValidators/useDeferredValidators", "../UNSAFE_useValidationLifecycle/useValidationLifecycle", "../UNSAFE_useValidators/useValidators", "../UNSAFE_useValue/useValue", "../UNSAFE_useValueLifecycle/useValueLifecycle", "../utils/utils"], function (require, exports, hooks_1, useComponentMessaging_1, useConverter_1, useConverterLifecycle_1, useDeferredValidators_1, useValidationLifecycle_1, useValidators_1, useValue_1, useValueLifecycle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useEditableValue = void 0;
    function useEditableValue({ ariaDescribedBy, converter, displayOptions, implicitComponentValidator, labelHint, messagesCustom, required, requiredMessageDetail, shouldNormalizeValueOnCommit = true, validators, value: valueProp, addBusyState, onMessagesCustomChanged, onRawValueChanged, onValidChanged, onValueChanged, onTransientValueChanged, wrapValueState }) {
        const componentMessagingState = (0, useComponentMessaging_1.useComponentMessaging)({
            messagesCustom,
            onMessagesCustomChanged
        });
        const { clearAllMessages, visibleMessages } = componentMessagingState;
        const deferredValidators = (0, useDeferredValidators_1.useDeferredValidators)({
            labelHint,
            required,
            requiredMessageDetail
        });
        const combinedValidators = !implicitComponentValidator
            ? validators
            : validators
                ? [implicitComponentValidator, ...validators]
                : [implicitComponentValidator];
        const validationState = (0, useValidators_1.useValidators)({
            componentMessagingState,
            defaultValidState: 'valid',
            deferredValidators,
            validators: combinedValidators,
            addBusyState,
            onValidChanged
        });
        const { validateValueOnExternalChange, validateValueOnInternalChange } = validationState;
        const { format, parse } = (0, useConverter_1.useConverter)({
            componentMessagingState,
            converter,
            validationState
        });
        const defaultValueState = (0, useValue_1.useValue)({
            value: valueProp,
            format,
            parse,
            onRawValueChanged,
            onTransientValueChanged,
            onValueChanged
        });
        const valueState = wrapValueState ? wrapValueState(defaultValueState) : defaultValueState;
        const { displayValue, value, getValueForValidation, setValueAfterValidation, refreshDisplayValue, setDisplayValue, setTransientValue, setValue } = valueState;
        const { runFullValidationAndUpdateValue } = (0, useValidationLifecycle_1.useValidationLifecycle)({
            componentMessagingState,
            validationState,
            deferredValidators,
            validators,
            getValueForValidation,
            setValueAfterValidation
        });
        (0, useConverterLifecycle_1.useConverterLifecycle)({
            converter,
            validationState,
            refreshDisplayValue,
            runFullValidationAndUpdateValue
        });
        (0, useValueLifecycle_1.useValueLifecycle)({
            value: valueProp,
            valueState,
            format,
            validateValueOnExternalChange
        });
        const normalizeAndParseValue = (0, hooks_1.useCallback)((value) => {
            return parse(shouldNormalizeValueOnCommit ? (0, utils_1.normalizeValue)(value) : value);
        }, [shouldNormalizeValueOnCommit, parse]);
        const onCommitValue = (0, hooks_1.useCallback)((value, doCommitOnValid = true) => __awaiter(this, void 0, void 0, function* () {
            const validationResult = yield validateValueOnInternalChange(value);
            if (validationResult === useValidators_1.ValidationResult.VALID && doCommitOnValid) {
                setValue(value);
            }
            return validationResult;
        }), [validateValueOnInternalChange]);
        const onCommit = (0, hooks_1.useCallback)(({ value }) => __awaiter(this, void 0, void 0, function* () {
            const parsedValueOrSymbol = normalizeAndParseValue(value);
            if (parsedValueOrSymbol === useConverter_1.ConverterErrorSymbol) {
                return;
            }
            const parsedValue = parsedValueOrSymbol;
            const validationResult = yield onCommitValue(parsedValue);
            if (validationResult === useValidators_1.ValidationResult.VALID) {
                setDisplayValue(format(parsedValue));
            }
        }), [format, onCommitValue, normalizeAndParseValue]);
        const onInput = (0, hooks_1.useCallback)(({ value }) => {
            setDisplayValue(value !== null && value !== void 0 ? value : '');
        }, []);
        const reset = (0, hooks_1.useCallback)(() => {
            clearAllMessages();
            validateValueOnExternalChange(value);
            refreshDisplayValue();
        }, [value, clearAllMessages, refreshDisplayValue, validateValueOnExternalChange]);
        const validate = (0, hooks_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
            const { fullValidate } = validationState;
            const { displayValue, value, setValueAfterValidation } = valueState;
            const newValueOrSymbol = normalizeAndParseValue(displayValue);
            if (newValueOrSymbol === useConverter_1.ConverterErrorSymbol) {
                return 'invalid';
            }
            const newValue = newValueOrSymbol;
            const resolver = addBusyState === null || addBusyState === void 0 ? void 0 : addBusyState('running component method validate');
            const validateResult = yield fullValidate(newValue);
            resolver === null || resolver === void 0 ? void 0 : resolver();
            if (validateResult) {
                if (newValue !== value) {
                    setValueAfterValidation(newValue);
                }
                return 'valid';
            }
            return 'invalid';
        }), [validationState, valueState, addBusyState, normalizeAndParseValue]);
        const showMessages = (0, hooks_1.useCallback)(() => {
            const { hasHiddenMessages, showHiddenMessages } = componentMessagingState;
            const { setValid } = validationState;
            if (hasHiddenMessages()) {
                showHiddenMessages();
                setValid('invalidShown');
            }
        }, [componentMessagingState, validationState]);
        return {
            value,
            setValue,
            displayValue,
            setDisplayValue,
            setTransientValue,
            methods: {
                reset,
                validate,
                showMessages
            },
            textFieldProps: {
                messages: (displayOptions === null || displayOptions === void 0 ? void 0 : displayOptions.messages) !== 'none' ? visibleMessages : undefined,
                value: displayValue,
                ariaDescribedBy,
                onCommit,
                onInput
            },
            onCommitValue,
            format,
            normalizeAndParseValue
        };
    }
    exports.useEditableValue = useEditableValue;
});
