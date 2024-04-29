var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "ojs/ojflattenedtreedataproviderview", "../UNSAFE_useListData/useListData", "preact/hooks"], function (require, exports, ojflattenedtreedataproviderview_1, useListData_1, hooks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useTreeData = void 0;
    ojflattenedtreedataproviderview_1 = __importDefault(ojflattenedtreedataproviderview_1);
    const defaultOptions = {
        isInitialFetchDeferred: false
    };
    const useTreeData = (data, options = defaultOptions) => {
        const actualExpandedRef = (0, hooks_1.useRef)(options.expanded);
        const currentExpandedRef = (0, hooks_1.useRef)(options.expanded);
        const dataProvider = (0, hooks_1.useMemo)(() => new ojflattenedtreedataproviderview_1.default(data, {
            expanded: options.expanded
        }), [data, options.expanded]);
        const [listDataState, onLoadRange] = (0, useListData_1.useListData)(dataProvider, options);
        const [treeDataState, setTreeDataState] = (0, hooks_1.useState)(() => {
            const initialState = listToTreeData(listDataState, keySetToKeys(actualExpandedRef.current), null);
            return initialState;
        });
        (0, hooks_1.useEffect)(() => {
            const expandedObservable = dataProvider.getExpandedObservable();
            const subscriber = expandedObservable.subscribe((value) => {
                currentExpandedRef.current = value.value;
                value.completionPromise.then(() => {
                    actualExpandedRef.current = value.value;
                });
            });
            return () => {
                subscriber.unsubscribe();
            };
        }, [dataProvider]);
        const toggleExpanded = (0, hooks_1.useCallback)((detail) => {
            const key = detail.key;
            if (!currentExpandedRef.current.has(key)) {
                dataProvider.setExpanded(currentExpandedRef.current.add([key]));
            }
            else {
                dataProvider.setExpanded(currentExpandedRef.current.delete([key]));
            }
        }, [dataProvider]);
        (0, hooks_1.useEffect)(() => {
            if (options.includeClosestParents &&
                listDataState.status === 'success' &&
                listDataState.data.data.length > 0) {
                fetchParents(listDataState, dataProvider).then((resultParent) => {
                    setTreeDataState(listToTreeData(listDataState, keySetToKeys(actualExpandedRef.current), resultParent));
                });
            }
            else {
                setTreeDataState(listToTreeData(listDataState, keySetToKeys(actualExpandedRef.current), []));
            }
        }, [listDataState, dataProvider, options.includeClosestParents]);
        return [treeDataState, onLoadRange, toggleExpanded];
    };
    exports.useTreeData = useTreeData;
    const fetchParents = (listDataState, dataProvider) => __awaiter(void 0, void 0, void 0, function* () {
        if (listDataState.status === 'success' && listDataState.data.data.length > 0) {
            let parentKey = listDataState.data.data[0].metadata.parentKey;
            const parents = [];
            while (parentKey != null) {
                const fetchByKeyResults = yield dataProvider.fetchByKeys({ keys: new Set([parentKey]) });
                const parent = fetchByKeyResults.results.get(parentKey);
                parentKey = parent === null || parent === void 0 ? void 0 : parent.metadata.parentKey;
                if (parent) {
                    parents.push(parent);
                }
            }
            return parents;
        }
        return null;
    });
    const keySetToKeys = (keySet) => {
        if (!keySet) {
            return getEmptyExpanded();
        }
        let keys = {};
        if (keySet.isAddAll()) {
            keys = {
                all: true,
                deletedKeys: new Set(keySet.deletedValues().values())
            };
        }
        else if (!keySet.isAddAll()) {
            keys = { all: false, keys: new Set(keySet.values().values()) };
        }
        return keys;
    };
    const getEmptyExpanded = () => {
        return { all: false, keys: new Set() };
    };
    const listToTreeData = (listData, expanded, parents) => {
        if (!expanded) {
            expanded = getEmptyExpanded();
        }
        const treeDataState = {
            status: listData.status
        };
        if (treeDataState.status === 'loading' && listData.status === 'loading') {
            treeDataState.data = listData.data;
        }
        else if (treeDataState.status === 'error' && listData.status === 'error') {
            treeDataState.error = listData.error;
        }
        else if (treeDataState.status === 'success' && listData.status === 'success') {
            const flattenedDataState = Object.assign({}, listData.data);
            flattenedDataState.expanded = expanded;
            if (parents !== null) {
                flattenedDataState.closestParents = [];
                parents.forEach((item) => {
                    const dataState = { data: item.data, metadata: item.metadata };
                    flattenedDataState.closestParents.push(dataState);
                });
            }
            treeDataState.data = flattenedDataState;
        }
        return treeDataState;
    };
});
