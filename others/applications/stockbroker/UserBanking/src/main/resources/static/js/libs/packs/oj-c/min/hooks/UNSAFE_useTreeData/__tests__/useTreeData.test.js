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
define(["require", "exports", "chai", "ojs/ojarraytreedataprovider", "../useTreeData", "@testing-library/preact-hooks"], function (require, exports, chai_1, ojarraytreedataprovider_1, useTreeData_1, preact_hooks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ojarraytreedataprovider_1 = __importDefault(ojarraytreedataprovider_1);
    describe('Test useTree hook', () => {
        it('render', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const countPerLevel = 20;
                const numLevels = 3;
                const createData = (level, parentId) => {
                    const data = [];
                    const count = countPerLevel;
                    if (level == null) {
                        level = 1;
                    }
                    if (parentId == null) {
                        parentId = '';
                    }
                    for (let i = 0; i < count; i++) {
                        const key = parentId + 'l' + level + 'i' + i;
                        const obj = { key: key, name: 'Item ' + (i + 1) };
                        obj.level = level;
                        obj.parentKey = parentId;
                        obj.setSize = countPerLevel;
                        obj.posInSet = i + 1;
                        if (level === numLevels) {
                            obj.isLeaf = true;
                        }
                        else {
                            obj.isLeaf = false;
                        }
                        if (level < numLevels) {
                            obj.children = createData(level + 1, key);
                        }
                        data.push(obj);
                    }
                    return data;
                };
                const treeDataProvider = new ojarraytreedataprovider_1.default(createData(null, null), {
                    keyAttributes: 'key'
                });
                const { result } = (0, preact_hooks_1.renderHook)(() => (0, useTreeData_1.useTreeData)(treeDataProvider, {
                    initialRowsFetched: 0,
                    includeClosestParents: true
                }));
                (0, chai_1.expect)(result.current).to.be.an('array');
            });
        });
    });
});
