var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "ojs/ojdataproviderfactory", "preact/hooks"], function (require, exports, ojdataproviderfactory_1, hooks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useListData = void 0;
    const initialState = Object.freeze({
        status: 'loading',
        data: null
    });
    const defaultOptions = {
        isInitialFetchDeferred: false
    };
    const DEFAULT_FETCH_SIZE = 25;
    const useListData = (data, options = defaultOptions) => {
        const fetchNextRef = (0, hooks_1.useRef)(null);
        const totalSizeRef = (0, hooks_1.useRef)(0);
        const isDoneRef = (0, hooks_1.useRef)(false);
        const iteratorRef = (0, hooks_1.useRef)(null);
        const fetchSize = options.fetchSize && options.fetchSize > 0 ? options.fetchSize : DEFAULT_FETCH_SIZE;
        if (!data) {
            const emptyListState = getEmptyState('exact');
            return [emptyListState, (_) => Promise.resolve()];
        }
        const dataProvider = (0, hooks_1.useMemo)(() => wrapData(data), [data]);
        const [state, dispatch] = (0, hooks_1.useReducer)(reducer, initialState);
        const fetchRange = (0, hooks_1.useCallback)((range) => __awaiter(void 0, void 0, void 0, function* () {
            const fetchOptions = {
                attributes: options.attributes,
                sortCriteria: options.sortCriteria,
                filterCriterion: options.filterCriterion,
                offset: range.offset,
                size: range.count
            };
            try {
                const result = yield dataProvider.fetchByOffset(fetchOptions);
                const results = result['results'];
                const sizePrecision = isDoneRef.current === true ? 'exact' : 'atLeast';
                dispatch({
                    status: 'success',
                    data: {
                        offset: range.offset,
                        data: results,
                        totalSize: totalSizeRef.current,
                        sizePrecision: sizePrecision
                    }
                });
            }
            catch (error) {
                dispatch({
                    status: 'error',
                    error: error
                });
            }
        }), [dataProvider, options.attributes, options.filterCriterion, options.sortCriteria]);
        const loadInitial = (0, hooks_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
            dispatch({ status: 'loading', data: null });
            const iterator = dataProvider
                .fetchFirst({
                attributes: options.attributes,
                sortCriteria: options.sortCriteria,
                filterCriterion: options.filterCriterion,
                size: fetchSize
            })[Symbol.asyncIterator]();
            iteratorRef.current = iterator;
            try {
                const result = yield iterator.next();
                totalSizeRef.current = result.value.data.length;
                if (result.done !== undefined) {
                    isDoneRef.current = result.done;
                }
                const initialFetchSize = options.initialRowsFetched && options.initialRowsFetched > 0
                    ? options.initialRowsFetched
                    : fetchSize;
                fetchRange({ offset: 0, count: Math.min(totalSizeRef.current, initialFetchSize) });
            }
            catch (error) {
                dispatch({
                    status: 'error',
                    error: error
                });
                iteratorRef.current = null;
            }
        }), [
            dataProvider,
            fetchRange,
            options.attributes,
            options.filterCriterion,
            options.sortCriteria,
            options.fetchSize
        ]);
        const loadRange = (0, hooks_1.useCallback)((range) => __awaiter(void 0, void 0, void 0, function* () {
            if (iteratorRef.current === null) {
                loadInitial();
            }
            else {
                const endIndex = range.offset + range.count;
                if (endIndex > totalSizeRef.current) {
                    if (fetchNextRef.current == null) {
                        const promise = fetchNextUntilThresholdOrDone(iteratorRef, totalSizeRef.current, endIndex);
                        fetchNextRef.current = promise;
                        try {
                            const value = yield promise;
                            if (value.done !== undefined) {
                                isDoneRef.current = value.done;
                            }
                            const total = value.total;
                            if (total > 0) {
                                totalSizeRef.current = total;
                                fetchRange({
                                    offset: range.offset,
                                    count: Math.min(totalSizeRef.current - range.offset, range.count)
                                });
                            }
                            fetchNextRef.current = null;
                        }
                        catch (error) {
                            dispatch({
                                status: 'error',
                                error: error
                            });
                            fetchNextRef.current = null;
                        }
                    }
                }
                else {
                    fetchRange(range);
                }
            }
        }), [state, loadInitial, fetchRange]);
        const resetAndLoad = (0, hooks_1.useCallback)(() => {
            iteratorRef.current = null;
            fetchNextRef.current = null;
            totalSizeRef.current = 0;
            isDoneRef.current = false;
            if (options.initialRowsFetched === 0) {
                dispatch(getEmptyState('atLeast'));
            }
            else if (!options.isInitialFetchDeferred) {
                loadInitial();
            }
            else {
                dispatch({ status: 'loading', data: null });
            }
        }, [loadInitial, options.isInitialFetchDeferred, options.initialRowsFetched]);
        (0, hooks_1.useEffect)(() => {
            resetAndLoad();
        }, [resetAndLoad]);
        const handleMutation = (0, hooks_1.useCallback)((event) => {
            if (state.status === 'success' && state.data) {
                const dataState = state.data;
                let shouldUpdate = false;
                if (event.detail.add) {
                    const itemsInserted = handleAddRemoveMutation(event.detail.add, dataState, options, true);
                    totalSizeRef.current = totalSizeRef.current + itemsInserted;
                    shouldUpdate = itemsInserted > 0 || dataState.sizePrecision === 'exact';
                    if (itemsInserted === 0) {
                        isDoneRef.current = false;
                    }
                }
                if (event.detail.remove) {
                    const itemsRemoved = handleAddRemoveMutation(event.detail.remove, dataState, options, false);
                    totalSizeRef.current = totalSizeRef.current - itemsRemoved;
                    shouldUpdate = shouldUpdate || itemsRemoved > 0;
                }
                if (event.detail.update) {
                    shouldUpdate =
                        shouldUpdate || handleUpdateMutation(event.detail.update, dataState, options);
                }
                if (shouldUpdate) {
                    fetchRange({ offset: dataState.offset, count: dataState.data.length });
                }
            }
        }, [state, options, fetchRange]);
        const handleRefresh = (0, hooks_1.useCallback)((event) => {
            var _a;
            let adjustment = -1;
            const disregardAfterKey = (_a = event.detail) === null || _a === void 0 ? void 0 : _a.disregardAfterKey;
            if (disregardAfterKey && state.status === 'success') {
                const index = state.data.data.findIndex((value) => {
                    return value.metadata.key === disregardAfterKey;
                });
                if (index > -1) {
                    adjustment = state.data.data.length - index - 1;
                }
                if (adjustment === 0 && state.data.data.length >= fetchSize) {
                    return;
                }
            }
            if (adjustment > -1 && state.status === 'success') {
                totalSizeRef.current = totalSizeRef.current - adjustment;
                loadRange({
                    offset: state.data.offset,
                    count: Math.max(state.data.data.length, fetchSize)
                });
            }
            else {
                resetAndLoad();
            }
        }, [state, resetAndLoad]);
        (0, hooks_1.useEffect)(() => {
            dataProvider.addEventListener('refresh', handleRefresh);
            dataProvider.addEventListener('mutate', handleMutation);
            return () => {
                dataProvider.removeEventListener('refresh', handleRefresh);
                dataProvider.removeEventListener('mutate', handleMutation);
            };
        }, [dataProvider, resetAndLoad, handleMutation]);
        return [state, loadRange];
    };
    exports.useListData = useListData;
    const wrapData = (data) => {
        const configuration = {
            fetchFirst: { caching: 'visitedByCurrentIterator' }
        };
        return (0, ojdataproviderfactory_1.getEnhancedDataProvider)(data, configuration);
    };
    const reducer = (state, action) => {
        if (state.status === action.status && action.status === 'loading') {
            return state;
        }
        return action;
    };
    const fetchNextUntilThresholdOrDone = (iteratorRef, current, threshold) => __awaiter(void 0, void 0, void 0, function* () {
        return yield fetchNextRecursive(iteratorRef, current, threshold);
    });
    const fetchNextRecursive = (iteratorRef, currentCount, threshold) => __awaiter(void 0, void 0, void 0, function* () {
        const currentIterator = iteratorRef.current;
        if (currentIterator === null) {
            return { total: -1, done: undefined };
        }
        const result = yield currentIterator.next();
        if (currentIterator === iteratorRef.current) {
            currentCount += result.value.data.length;
            if (currentCount >= threshold || result.done) {
                return { total: currentCount, done: result.done };
            }
            return fetchNextRecursive(iteratorRef, currentCount, threshold);
        }
        return { total: -1, done: undefined };
    });
    const getEmptyState = (precision) => {
        return {
            status: 'success',
            data: {
                offset: 0,
                data: [],
                totalSize: 0,
                sizePrecision: precision
            }
        };
    };
    const handleAddRemoveMutation = (detail, dataState, options, isAdd) => {
        var _a;
        let itemCount = 0;
        if (isIndexesAvailable(detail, options)) {
            const indexes = isAdd ? (_a = detail.indexes) === null || _a === void 0 ? void 0 : _a.sort() : detail.indexes;
            let endIndex = dataState.totalSize - 1;
            indexes === null || indexes === void 0 ? void 0 : indexes.forEach((index) => {
                if (index <= endIndex) {
                    itemCount = itemCount += 1;
                    if (isAdd) {
                        endIndex = endIndex += 1;
                    }
                }
            });
        }
        else {
        }
        return itemCount;
    };
    const handleUpdateMutation = (detail, dataState, options) => {
        if (isIndexesAvailable(detail, options)) {
            const indexes = detail.indexes ? detail.indexes : [];
            const startIndex = dataState.offset;
            const endIndex = startIndex + dataState.data.length;
            for (let i = 0; i < indexes.length; i++) {
                if (indexes[i] >= startIndex && indexes[i] < endIndex) {
                    return true;
                }
            }
        }
        else {
        }
        return false;
    };
    const isIndexesAvailable = (detail, options) => {
        return detail.indexes && options.sortCriteria == null && options.filterCriterion == null;
    };
});
