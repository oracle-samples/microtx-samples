var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
define(["require", "exports", "./utils"], function (require, exports, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DataProviderHandler = void 0;
    class DataProviderHandler {
        constructor(dataProvider, addBusyState, callback) {
            this.handleMutateEvent = (event) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const { detail } = event;
                const resolver = this.addBusyState('updating data from mutation event');
                const updatedData = yield (0, utils_1.getUpdatedItemsFromMutationDetail)(detail, this.currentData, this.dataProvider);
                resolver === null || resolver === void 0 ? void 0 : resolver();
                this.currentData = updatedData;
                (_b = (_a = this.callback) === null || _a === void 0 ? void 0 : _a.onDataUpdated) === null || _b === void 0 ? void 0 : _b.call(_a, updatedData);
            });
            this.handleRefreshEvent = () => {
                this._fetchDataAndNotify();
            };
            this.addBusyState = addBusyState;
            this.callback = callback;
            this.dataProvider = dataProvider;
            this.currentData = [];
            dataProvider.addEventListener('refresh', this.handleRefreshEvent);
            dataProvider.addEventListener('mutate', this.handleMutateEvent);
            this._fetchDataAndNotify();
        }
        destroy() {
            this.callback = undefined;
            this.currentData = [];
            this.dataProvider.removeEventListener('refresh', this.handleRefreshEvent);
            this.dataProvider.removeEventListener('mutate', this.handleMutateEvent);
        }
        _fetchData() {
            var e_1, _a;
            return __awaiter(this, void 0, void 0, function* () {
                const fetchedData = [];
                const asyncIterable = this.dataProvider.fetchFirst({ size: -1 });
                try {
                    for (var asyncIterable_1 = __asyncValues(asyncIterable), asyncIterable_1_1; asyncIterable_1_1 = yield asyncIterable_1.next(), !asyncIterable_1_1.done;) {
                        const results = asyncIterable_1_1.value;
                        const contextArray = results.data.map((item, index) => {
                            return {
                                data: item,
                                key: results.metadata[index].key,
                                metadata: results.metadata[index]
                            };
                        });
                        fetchedData.push(...contextArray);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return)) yield _a.call(asyncIterable_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                this.currentData = fetchedData.slice();
                return fetchedData;
            });
        }
        _fetchDataAndNotify() {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                const resolver = this.addBusyState('fetching data');
                const fetchedData = yield this._fetchData();
                (_b = (_a = this.callback) === null || _a === void 0 ? void 0 : _a.onDataUpdated) === null || _b === void 0 ? void 0 : _b.call(_a, fetchedData);
                resolver();
            });
        }
    }
    exports.DataProviderHandler = DataProviderHandler;
});
