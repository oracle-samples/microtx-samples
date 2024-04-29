var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getUpdatedItemsFromMutationDetail = void 0;
    function getUpdatedItemsFromMutationDetail(detail, currentData, dataProvider) {
        return __awaiter(this, void 0, void 0, function* () {
            const { add, remove, update } = detail !== null && detail !== void 0 ? detail : {};
            const keyIndexMap = new Map();
            for (const [index, item] of currentData.entries()) {
                keyIndexMap.set(item.key, index);
            }
            let mutatedData = [...currentData];
            if (remove) {
                mutatedData = removeItemsFromDetail(remove, mutatedData, keyIndexMap);
            }
            if (add) {
                mutatedData = yield addItemsFromDetail(add, mutatedData, keyIndexMap, dataProvider);
            }
            if (update) {
                mutatedData = yield updateItemsFromDetail(update, mutatedData, keyIndexMap, dataProvider);
            }
            return mutatedData;
        });
    }
    exports.getUpdatedItemsFromMutationDetail = getUpdatedItemsFromMutationDetail;
    function addItemsAtEnd(itemsToAdd, itemMetadataToAdd, items) {
        const indices = new Array(itemsToAdd.length).fill(-1);
        return addItemsAtIndices(indices, itemsToAdd, itemMetadataToAdd, items);
    }
    function addItemsAtIndices(indices, itemsToAdd, itemMetadataToAdd, items) {
        const returnItems = [...items];
        indices.forEach((addAtIndex, index) => {
            var _a;
            const addItem = {
                data: itemsToAdd[index],
                key: (_a = itemMetadataToAdd[index]) === null || _a === void 0 ? void 0 : _a.key,
                metadata: itemMetadataToAdd[index]
            };
            if (addAtIndex >= 0) {
                returnItems.splice(addAtIndex, 0, addItem);
            }
            else {
                returnItems.push(addItem);
            }
        });
        return returnItems;
    }
    function addItemsBeforeKeys(beforeKeys, itemsToAdd, items, keyIndexMap) {
        const addIndices = [];
        const itemMetadataToAdd = [];
        beforeKeys.forEach((key) => {
            addIndices.push(getIndexByKey(keyIndexMap, key));
            itemMetadataToAdd.push({ key });
        });
        return addItemsAtIndices(addIndices, itemsToAdd, itemMetadataToAdd, items);
    }
    function addItemsFromDetail(detail, items, keyIndexMap, dataProvider) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { addBeforeKeys, data, indexes, keys, metadata } = detail;
            let mutatedData = [...items];
            let treatedData = data || [];
            let treatedMetaData = metadata || [];
            if (treatedData.length === 0 && (keys === null || keys === void 0 ? void 0 : keys.size)) {
                const fetchResults = (_a = (yield fetchDataByKeys(dataProvider, keys))) !== null && _a !== void 0 ? _a : [];
                treatedData = fetchResults.map((itemContext) => itemContext.data);
                treatedMetaData = fetchResults.map((itemContext) => itemContext.metadata);
            }
            if (treatedMetaData.length === 0 && (keys === null || keys === void 0 ? void 0 : keys.size)) {
                treatedMetaData = [...keys].map((key) => ({ key }));
            }
            if (treatedData.length) {
                if (indexes === null || indexes === void 0 ? void 0 : indexes.length) {
                    mutatedData = addItemsAtIndices(indexes, treatedData, treatedMetaData, mutatedData);
                }
                else if (addBeforeKeys === null || addBeforeKeys === void 0 ? void 0 : addBeforeKeys.length) {
                    mutatedData = addItemsBeforeKeys(addBeforeKeys, treatedData, mutatedData, keyIndexMap);
                }
                else {
                    mutatedData = addItemsAtEnd(treatedData, treatedMetaData, mutatedData);
                }
            }
            return mutatedData;
        });
    }
    function fetchDataByKeys(dataProvider, keys) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetchedData = [];
            const results = (yield dataProvider.fetchByKeys({ keys })).results;
            for (const key of keys) {
                if (results.has(key)) {
                    const result = results.get(key);
                    fetchedData.push(Object.assign(Object.assign({}, result), { key }));
                }
            }
            return fetchedData;
        });
    }
    function getIndexByKey(keyIndexMap, key) {
        if (keyIndexMap.has(key)) {
            return keyIndexMap.get(key);
        }
        return -1;
    }
    function removeItemsAtIndices(indices, items) {
        const returnItems = [...items];
        indices.sort((a, b) => b - a);
        indices.forEach((index) => {
            if (index < returnItems.length) {
                returnItems.splice(index, 1);
            }
        });
        return returnItems;
    }
    function removeItemsAtKeys(keys, items, keyIndexMap) {
        const indicesToRemove = [];
        keys.forEach((key) => {
            const index = getIndexByKey(keyIndexMap, key);
            if (index !== -1) {
                indicesToRemove.push(index);
            }
        });
        return removeItemsAtIndices(indicesToRemove, items);
    }
    function removeItemsFromDetail(detail, items, keyIndexMap) {
        const { indexes, keys } = detail;
        let mutatedData = [...items];
        if (indexes === null || indexes === void 0 ? void 0 : indexes.length) {
            mutatedData = removeItemsAtIndices(indexes, mutatedData);
        }
        else if (keys === null || keys === void 0 ? void 0 : keys.size) {
            mutatedData = removeItemsAtKeys(keys, mutatedData, keyIndexMap);
        }
        return mutatedData;
    }
    function updateItemsAtIndices(indices, itemsToUpdate, itemMetadataToUpdate, items) {
        const returnItems = [...items];
        indices.forEach((updateAtIndex, index) => {
            var _a;
            if (returnItems[updateAtIndex]) {
                const addItem = {
                    data: itemsToUpdate[index],
                    key: (_a = itemMetadataToUpdate[index]) === null || _a === void 0 ? void 0 : _a.key,
                    metadata: itemMetadataToUpdate[index]
                };
                returnItems.splice(updateAtIndex, 1, addItem);
            }
        });
        return returnItems;
    }
    function updateItemsAtKeys(keys, itemsToUpdate, itemMetadataToUpdate, items, keyIndexMap) {
        const returnItems = [...items];
        keys.forEach((key) => {
            var _a;
            const index = getIndexByKey(keyIndexMap, key);
            const addItem = {
                data: itemsToUpdate[index],
                key: (_a = itemMetadataToUpdate[index]) === null || _a === void 0 ? void 0 : _a.key,
                metadata: itemMetadataToUpdate[index]
            };
            if (index >= 0) {
                returnItems.splice(index, 1, addItem);
            }
        });
        return returnItems;
    }
    function updateItemsFromDetail(detail, items, keyIndexMap, dataProvider) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { data, indexes, keys, metadata } = detail;
            let mutatedData = [...items];
            let treatedData = data || [];
            let treatedMetaData = metadata || [];
            if (treatedData.length === 0 && (keys === null || keys === void 0 ? void 0 : keys.size)) {
                const fetchResults = (_a = (yield fetchDataByKeys(dataProvider, keys))) !== null && _a !== void 0 ? _a : [];
                treatedData = fetchResults.map((itemContext) => itemContext.data);
                treatedMetaData = fetchResults.map((itemContext) => itemContext.metadata);
            }
            if (treatedMetaData.length === 0 && (keys === null || keys === void 0 ? void 0 : keys.size)) {
                treatedMetaData = [...keys].map((key) => ({ key }));
            }
            if (treatedData.length) {
                if (indexes === null || indexes === void 0 ? void 0 : indexes.length) {
                    mutatedData = updateItemsAtIndices(indexes, treatedData, treatedMetaData, mutatedData);
                }
                else if (keys === null || keys === void 0 ? void 0 : keys.size) {
                    mutatedData = updateItemsAtKeys(keys, treatedData, treatedMetaData, mutatedData, keyIndexMap);
                }
            }
            return mutatedData;
        });
    }
});
