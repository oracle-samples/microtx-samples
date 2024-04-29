define(["require", "exports", "@oracle/oraclejet-preact/hooks/UNSAFE_useUncontrolledState", "preact/hooks"], function (require, exports, UNSAFE_useUncontrolledState_1, hooks_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.useValueItems = void 0;
    function useValueItems(propValueItems, onValueItemsChanged) {
        const [valueItems, setValueItems] = (0, UNSAFE_useUncontrolledState_1.useUncontrolledState)(propValueItems, onValueItemsChanged);
        (0, hooks_1.useEffect)(() => {
            if (valueItems !== propValueItems) {
                setValueItems(propValueItems);
            }
        }, [propValueItems]);
        const preactValueItems = (0, hooks_1.useMemo)(() => {
            return valueItems ? Array.from(valueItems.values()) : undefined;
        }, [valueItems]);
        return {
            valueItems,
            setValueItems,
            preactValueItems
        };
    }
    exports.useValueItems = useValueItems;
});
