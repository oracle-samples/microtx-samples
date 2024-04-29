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
define(["require", "exports", "oj-c/editable-value/UNSAFE_useEditableValue/useEditableValue", "oj-c/editable-value/UNSAFE_useValidators/useValidators", "oj-c/editable-value/utils/utils", "oj-c/hooks/UNSAFE_useListData/useListData", "oj-c/select-common/UNSAFE_useDataProviderListeners/useDataProviderListeners", "oj-c/select-common/UNSAFE_useWrapDataProvider/useWrapDataProvider", "oj-c/select-common/UNSAFE_useWrapValueState/useWrapValueState", "oj-c/select-common/utils/utils", "ojs/ojdataprovider", "preact/hooks", "./useSyncValueAndValueItem", "./useValueItem"], function (require, exports, useEditableValue_1, useValidators_1, utils_1, useListData_1, useDataProviderListeners_1, useWrapDataProvider_1, useWrapValueState_1, utils_2, ojdataprovider_1, hooks_1, useSyncValueAndValueItem_1, useValueItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useSelectSinglePreact = void 0;
    function useSelectSinglePreact(_a, addBusyState) {
        var { data: propData, disabled, displayOptions, itemText, labelEdge, labelHint, labelStartWidth, messagesCustom, placeholder, readonly, required, textAlign, userAssistanceDensity, value: propValue, valueItem: propValueItem, virtualKeyboard, onMessagesCustomChanged, onOjValueAction, onValidChanged, onValueChanged, onValueItemChanged } = _a, otherProps = __rest(_a, ["data", "disabled", "displayOptions", "itemText", "labelEdge", "labelHint", "labelStartWidth", "messagesCustom", "placeholder", "readonly", "required", "textAlign", "userAssistanceDensity", "value", "valueItem", "virtualKeyboard", "onMessagesCustomChanged", "onOjValueAction", "onValidChanged", "onValueChanged", "onValueItemChanged"]);
        const [filterCriterion, setFilterCriterion] = (0, hooks_1.useState)(undefined);
        const [isLoading, setIsLoading] = (0, hooks_1.useState)(false);
        const { valueItem, setValueItem } = (0, useValueItem_1.useValueItem)(propValueItem, onValueItemChanged);
        const [preactValueItem, setPreactValueItem] = (0, hooks_1.useState)(valueItem);
        (0, hooks_1.useEffect)(() => {
            setPreactValueItem(valueItem);
        }, [valueItem]);
        const { wrapValueState } = (0, useWrapValueState_1.useWrapValueState)({
            arItemContexts: valueItem,
            isLoading,
            preactValueItems: preactValueItem,
            setPreactValueItems: setPreactValueItem
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
        const hasNoValue = value === null;
        const dataProvider = (0, useWrapDataProvider_1.useWrapDataProvider)(propData);
        const [valueToSync, setValueToSync] = (0, hooks_1.useState)(value);
        const [valueItemToSync, setValueItemToSync] = (0, hooks_1.useState)(valueItem);
        (0, hooks_1.useEffect)(() => {
            setValueToSync(value);
        }, [value]);
        (0, hooks_1.useEffect)(() => {
            setValueItemToSync(valueItem);
        }, [valueItem]);
        (0, useDataProviderListeners_1.useDataProviderListeners)({
            dataProvider,
            setValue,
            setValueToSync,
            setValueItemsToSync: setValueItemToSync,
            value,
            valueItems: valueItem
        });
        (0, useSyncValueAndValueItem_1.useSyncValueAndValueItem)({
            addBusyState,
            dataProvider: dataProvider,
            setIsLoading,
            setValue,
            setValueItem,
            value: valueToSync,
            valueItem: valueItemToSync
        });
        const [listDataState, onLoadRange] = (0, useListData_1.useListData)(dataProvider, {
            filterCriterion,
            initialRowsFetched: 0
        });
        const onCommit = (0, hooks_1.useCallback)(({ previousValue, value }) => __awaiter(this, void 0, void 0, function* () {
            const validationResult = yield onCommitValue(value != null ? value : utils_2.DEFAULT_VALUE);
            if (validationResult === useValidators_1.ValidationResult.INVALID) {
                setPreactValueItem(undefined);
            }
            else if (validationResult === useValidators_1.ValidationResult.VALID && listDataState.status === 'success') {
                if (value == null) {
                    onOjValueAction === null || onOjValueAction === void 0 ? void 0 : onOjValueAction({
                        itemContext: utils_2.DEFAULT_ITEM_CONTEXT,
                        previousValue: previousValue !== null && previousValue !== void 0 ? previousValue : utils_2.DEFAULT_VALUE,
                        value: utils_2.DEFAULT_VALUE
                    });
                }
                else if (value === (valueItem === null || valueItem === void 0 ? void 0 : valueItem.key)) {
                    onOjValueAction === null || onOjValueAction === void 0 ? void 0 : onOjValueAction({
                        itemContext: valueItem,
                        previousValue: previousValue !== null && previousValue !== void 0 ? previousValue : utils_2.DEFAULT_VALUE,
                        value
                    });
                }
                else {
                    const data = listDataState.data.data;
                    let item = data.find((item) => item.metadata.key === value);
                    if (item === undefined) {
                        const fetchResults = yield dataProvider.fetchByKeys({ keys: new Set([value]) });
                        item = fetchResults.results.get(value);
                    }
                    const itemContext = {
                        data: item.data,
                        key: item.metadata.key,
                        metadata: item.metadata
                    };
                    onOjValueAction === null || onOjValueAction === void 0 ? void 0 : onOjValueAction({
                        itemContext: itemContext,
                        previousValue: previousValue !== null && previousValue !== void 0 ? previousValue : utils_2.DEFAULT_VALUE,
                        value: value !== null && value !== void 0 ? value : utils_2.DEFAULT_VALUE
                    });
                }
            }
        }), [dataProvider, listDataState, valueItem, onCommitValue, onOjValueAction]);
        const onFilter = (0, hooks_1.useCallback)(({ searchText }) => {
            const fc = searchText && searchText.length > 0
                ? ojdataprovider_1.FilterFactory.getFilter({ filterDef: { text: searchText } })
                : undefined;
            setFilterCriterion(fc);
        }, []);
        return {
            methods,
            selectSingleProps: {
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
                valueItem: (0, utils_1.treatNull)(preactValueItem, undefined),
                virtualKeyboard
            }
        };
    }
    exports.useSelectSinglePreact = useSelectSinglePreact;
});
