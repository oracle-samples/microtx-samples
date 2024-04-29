var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "preact/hooks", "../UNSAFE_useConverter/useConverter", "../UNSAFE_useValidators/useValidators", "../utils/utils"], function (require, exports, hooks_1, useConverter_1, useValidators_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useValidationLifecycle = void 0;
    function useValidationLifecycle({ componentMessagingState, deferredValidators, validationState, validators, getValueForValidation, setValueAfterValidation }) {
        const prevDeferredValidatorsRef = (0, hooks_1.useRef)(deferredValidators);
        const prevValidatorsRef = (0, hooks_1.useRef)(validators);
        const prevMessagesCustomRef = (0, hooks_1.useRef)(componentMessagingState.messagesCustom);
        const runFullValidationAndUpdateValue = (0, hooks_1.useCallback)(() => __awaiter(this, void 0, void 0, function* () {
            const { valid, validateValueOnInternalChange } = validationState;
            const value = getValueForValidation(valid);
            if (value === useConverter_1.ConverterErrorSymbol) {
                return;
            }
            const validationResult = yield validateValueOnInternalChange(value, {
                doNotClearMessagesCustom: true
            });
            if (validationResult === useValidators_1.ValidationResult.VALID) {
                setValueAfterValidation(value);
            }
        }), [validationState, getValueForValidation, setValueAfterValidation]);
        (0, hooks_1.useEffect)(() => {
            const value = getValueForValidation('valid');
            if (value === useConverter_1.ConverterErrorSymbol) {
                return;
            }
            const { deferredValidate, setValid } = validationState;
            const { hasCustomErrorMessages, setDeferredComponentMessages } = componentMessagingState;
            const maybeErrors = deferredValidate(value);
            if (maybeErrors) {
                setDeferredComponentMessages(maybeErrors);
                setValid('invalidHidden');
            }
            if (hasCustomErrorMessages()) {
                setValid('invalidShown');
            }
        }, []);
        (0, hooks_1.useEffect)(() => {
            if (prevDeferredValidatorsRef.current === deferredValidators) {
                return;
            }
            const { valid, deferredValidate, setValid } = validationState;
            const { clearDeferredComponentMessages, setDeferredComponentMessages } = componentMessagingState;
            prevDeferredValidatorsRef.current = deferredValidators;
            switch (valid) {
                case 'valid':
                    const value = getValueForValidation(valid);
                    if (value !== useConverter_1.ConverterErrorSymbol) {
                        const maybeErrors = deferredValidate(value);
                        if (maybeErrors) {
                            setDeferredComponentMessages(maybeErrors);
                            setValid('invalidHidden');
                        }
                    }
                    break;
                case 'invalidHidden':
                    if (deferredValidators.length === 0) {
                        setValid('valid');
                        clearDeferredComponentMessages();
                    }
                    break;
                case 'invalidShown':
                    runFullValidationAndUpdateValue();
                    break;
            }
        }, [
            deferredValidators,
            componentMessagingState,
            validationState,
            getValueForValidation,
            runFullValidationAndUpdateValue
        ]);
        (0, hooks_1.useEffect)(() => {
            if (prevValidatorsRef.current === validators) {
                return;
            }
            prevValidatorsRef.current = validators;
            switch (validationState.valid) {
                case 'invalidShown':
                    runFullValidationAndUpdateValue();
                    break;
            }
        }, [validators, validationState]);
        (0, hooks_1.useEffect)(() => {
            if ((0, utils_1.isShallowEqual)(prevMessagesCustomRef.current, componentMessagingState.messagesCustom)) {
                return;
            }
            const { messagesCustom, hasCustomErrorMessages, hasHiddenMessages, hasNoErrorMessages } = componentMessagingState;
            const { valid, setValid } = validationState;
            prevMessagesCustomRef.current = messagesCustom;
            if (hasCustomErrorMessages()) {
                setValid('invalidShown');
            }
            else if (valid === 'pending') {
                return;
            }
            else if (hasNoErrorMessages()) {
                setValid('valid');
            }
            else if (hasHiddenMessages()) {
                setValid('invalidHidden');
            }
        }, [componentMessagingState, validationState]);
        return {
            runFullValidationAndUpdateValue
        };
    }
    exports.useValidationLifecycle = useValidationLifecycle;
});
