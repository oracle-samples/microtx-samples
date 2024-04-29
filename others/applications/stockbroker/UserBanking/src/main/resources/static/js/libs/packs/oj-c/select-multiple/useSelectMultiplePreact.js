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
define(["require", "exports", "oj-c/editable-value/UNSAFE_useEditableValue/useEditableValue", "oj-c/editable-value/UNSAFE_useValidators/useValidators", "oj-c/hooks/UNSAFE_useListData/useListData", "oj-c/select-common/UNSAFE_useDataProviderListeners/useDataProviderListeners", "oj-c/select-common/UNSAFE_useWrapDataProvider/useWrapDataProvider", "oj-c/select-common/UNSAFE_useWrapValueState/useWrapValueState", "oj-c/select-common/utils/utils", "ojs/ojdataprovider", "preact/hooks", "./useSyncValueAndValueItems", "./useValueItems"], function (require, exports, useEditableValue_1, useValidators_1, useListData_1, useDataProviderListeners_1, useWrapDataProvider_1, useWrapValueState_1, utils_1, ojdataprovider_1, hooks_1, useSyncValueAndValueItems_1, useValueItems_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useSelectMultiplePreact = void 0;
    function useSelectMultiplePreact(_a, addBusyState) {
        var { data: propData, disabled, displayOptions, itemText, labelEdge, labelHint, labelStartWidth, messagesCustom, placeholder, readonly, required, textAlign, userAssistanceDensity, value: propValue, valueItems: propValueItems, virtualKeyboard, onMessagesCustomChanged, onValidChanged, onValueChanged, onValueItemsChanged } = _a, otherProps = __rest(_a, ["data", "disabled", "displayOptions", "itemText", "labelEdge", "labelHint", "labelStartWidth", "messagesCustom", "placeholder", "readonly", "required", "textAlign", "userAssistanceDensity", "value", "valueItems", "virtualKeyboard", "onMessagesCustomChanged", "onValidChanged", "onValueChanged", "onValueItemsChanged"]);
        const [filterCriterion, setFilterCriterion] = (0, hooks_1.useState)(undefined);
        const [isLoading, setIsLoading] = (0, hooks_1.useState)(false);
        const { valueItems, setValueItems, preactValueItems: arItemContexts } = (0, useValueItems_1.useValueItems)(propValueItems, onValueItemsChanged);
        const [preactValueItems, setPreactValueItems] = (0, hooks_1.useState)(arItemContexts);
        (0, hooks_1.useEffect)(() => {
            setPreactValueItems(arItemContexts);
        }, [arItemContexts]);
        const { wrapValueState } = (0, useWrapValueState_1.useWrapValueState)({
            arItemContexts,
            isLoading,
            preactValueItems,
            setPreactValueItems
        });
        const { methods, onCommitValue, setValue, textFieldProps, value } = (0, useEditableValue_1.useEditableValue)({
            ariaDescribedBy: otherProps['aria-describedby'],
            displayOptions,
            messagesCustom,
            required,
            value: propValue,
            addBusyState,
            onMessagesCustomChanged,
            onValidChanged,
            onValueChanged,
            wrapValueState
        });
        const { ariaDescribedBy, messages } = textFieldProps;
        const hasNoValue = value === null || (value instanceof Set && value.size === 0);
        const dataProvider = (0, useWrapDataProvider_1.useWrapDataProvider)(propData);
        const [valueToSync, setValueToSync] = (0, hooks_1.useState)(value);
        const [valueItemsToSync, setValueItemsToSync] = (0, hooks_1.useState)(valueItems);
        (0, hooks_1.useEffect)(() => {
            setValueToSync(value);
        }, [value]);
        (0, hooks_1.useEffect)(() => {
            setValueItemsToSync(valueItems);
        }, [valueItems]);
        (0, useDataProviderListeners_1.useDataProviderListeners)({
            dataProvider,
            setValue: setValue,
            setValueToSync: setValueToSync,
            setValueItemsToSync,
            value: value,
            valueItems
        });
        (0, useSyncValueAndValueItems_1.useSyncValueAndValueItems)({
            addBusyState,
            dataProvider: dataProvider,
            setIsLoading,
            setValue: setValue,
            setValueItems,
            value: valueToSync,
            valueItems: valueItemsToSync
        });
        const [listDataState, onLoadRange] = (0, useListData_1.useListData)(dataProvider, {
            filterCriterion,
            initialRowsFetched: 0
        });
        const onCommit = (0, hooks_1.useCallback)((detail) => __awaiter(this, void 0, void 0, function* () {
            const validationResult = yield onCommitValue((detail.value && detail.value.size > 0 ? detail.value : utils_1.DEFAULT_VALUE));
            if (validationResult === useValidators_1.ValidationResult.INVALID) {
                setPreactValueItems(undefined);
            }
        }), [onCommitValue]);
        const onFilter = (0, hooks_1.useCallback)(({ searchText }) => {
            const fc = searchText && searchText.length > 0
                ? ojdataprovider_1.FilterFactory.getFilter({ filterDef: { text: searchText } })
                : undefined;
            setFilterCriterion(fc);
        }, []);
        return {
            methods,
            selectMultipleProps: {
                ariaDescribedBy,
                data: listDataState.data,
                isDisabled: disabled,
                isLoading,
                isReadonly: readonly,
                isRequired: required,
                isRequiredShown: required && hasNoValue,
                itemText,
                label: labelHint,
                labelEdge,
                labelStartWidth,
                messages,
                onCommit,
                onFilter,
                onLoadRange,
                placeholder,
                textAlign,
                userAssistanceDensity,
                valueItems: preactValueItems,
                virtualKeyboard
            }
        };
    }
    exports.useSelectMultiplePreact = useSelectMultiplePreact;
});
