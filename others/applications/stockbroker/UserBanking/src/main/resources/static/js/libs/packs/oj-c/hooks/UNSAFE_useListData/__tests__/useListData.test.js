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
define(["require", "exports", "chai", "ojs/ojarraydataprovider", "ojs/ojmodel", "ojs/ojcollectiondataprovider", "../useListData", "@testing-library/preact-hooks"], function (require, exports, chai_1, ojarraydataprovider_1, ojmodel_1, ojcollectiondataprovider_1, useListData_1, preact_hooks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ojarraydataprovider_1 = __importDefault(ojarraydataprovider_1);
    ojcollectiondataprovider_1 = __importDefault(ojcollectiondataprovider_1);
    function checkDataState(dataState, count, precision) {
        if (dataState.status === 'error') {
            console.log(dataState.error);
        }
        (0, chai_1.expect)(dataState.status).to.be.eq('success');
        if (dataState.status === 'success') {
            (0, chai_1.expect)(dataState.data.offset).to.be.eq(0);
            (0, chai_1.expect)(dataState.data.data.length).to.be.eq(count);
            (0, chai_1.expect)(dataState.data.sizePrecision).to.be.eq(precision);
        }
    }
    function sleep() {
        return new Promise((r) => setTimeout(r, 100));
    }
    describe('Test useListData hook - ArrayDataProvider', () => {
        it('initialRowsFetched', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const createData = (count) => {
                    const data = [];
                    for (let i = 0; i < count; i++) {
                        const key = 'i' + i;
                        const obj = { key: key, name: 'Item ' + (i + 1) };
                        data.push(obj);
                    }
                    return data;
                };
                const dataProvider = new ojarraydataprovider_1.default(createData(50), {
                    keyAttributes: 'key'
                });
                const { result } = (0, preact_hooks_1.renderHook)(() => (0, useListData_1.useListData)(dataProvider, {
                    initialRowsFetched: 0
                }));
                if (result.current) {
                    const dataState = result.current[0];
                    (0, chai_1.expect)(dataState.status).to.be.eq('success');
                    checkDataState(dataState, 0, 'atLeast');
                }
            });
        });
        it('ArrayDataProvider - fetch next', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const createData = (count) => {
                    const data = [];
                    for (let i = 0; i < count; i++) {
                        const key = 'i' + i;
                        const obj = { key: key, name: 'Item ' + (i + 1) };
                        data.push(obj);
                    }
                    return data;
                };
                const dataProvider = new ojarraydataprovider_1.default(createData(50), {
                    keyAttributes: 'key'
                });
                const { result } = (0, preact_hooks_1.renderHook)(() => (0, useListData_1.useListData)(dataProvider, {}));
                if (result.current) {
                    let dataState = result.current[0];
                    (0, chai_1.expect)(dataState.status).to.be.eq('loading');
                    yield sleep();
                    dataState = result.current[0];
                    checkDataState(dataState, 25, 'atLeast');
                    let loadRange = result.current[1];
                    loadRange({ offset: 0, count: 50 });
                    yield sleep();
                    dataState = result.current[0];
                    checkDataState(dataState, 50, 'atLeast');
                    loadRange = result.current[1];
                    loadRange({ offset: 0, count: 75 });
                    yield sleep();
                    dataState = result.current[0];
                    checkDataState(dataState, 50, 'exact');
                }
            });
        });
        it('CollectionDataProvider - fetch next', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const createData = (count) => {
                    const data = [];
                    for (let i = 0; i < count; i++) {
                        const key = 'i' + i;
                        const obj = new ojmodel_1.Model({ id: key, name: 'Item ' + (i + 1) });
                        data.push(obj);
                    }
                    return new ojmodel_1.Collection(data);
                };
                const dataProvider = new ojcollectiondataprovider_1.default(createData(50));
                const { result } = (0, preact_hooks_1.renderHook)(() => (0, useListData_1.useListData)(dataProvider, {}));
                if (result.current) {
                    let dataState = result.current[0];
                    (0, chai_1.expect)(dataState.status).to.be.eq('loading');
                    yield sleep();
                    dataState = result.current[0];
                    checkDataState(dataState, 25, 'atLeast');
                    let loadRange = result.current[1];
                    loadRange({ offset: 0, count: 50 });
                    yield sleep();
                    dataState = result.current[0];
                    checkDataState(dataState, 50, 'atLeast');
                    loadRange = result.current[1];
                    loadRange({ offset: 0, count: 75 });
                    yield sleep();
                    dataState = result.current[0];
                    checkDataState(dataState, 50, 'exact');
                }
            });
        });
    });
});
