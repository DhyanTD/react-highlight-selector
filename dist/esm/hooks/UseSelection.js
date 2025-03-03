import { __assign, __awaiter, __generator, __spreadArray } from "tslib";
import { useContext } from 'react';
import { SelectionsContext } from '../providers/SelectionProvider';
export var useSelections = function () {
    var selectionContext = useContext(SelectionsContext);
    if (!selectionContext) {
        throw new Error('useSelection hook must be used inside selectionProvider');
    }
    var selections = selectionContext.selections, setSelections = selectionContext.setSelections;
    var addSelection = function (selection, identifier) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setSelections(function (prev) {
                var _a;
                var _b;
                var idInPrev = (_b = prev[identifier]) !== null && _b !== void 0 ? _b : [];
                var index = idInPrev === null || idInPrev === void 0 ? void 0 : idInPrev.findIndex(function (item) { return item.id === selection.id; });
                console.log(idInPrev, "cleanedHtml---------------", index);
                if (index === -1) {
                    return __assign(__assign({}, prev), (_a = {}, _a[identifier] = __spreadArray(__spreadArray([], idInPrev, true), [selection], false), _a));
                }
                return prev;
            });
            console.log(selection, "cleanedHtml---------------", identifier);
            return [2 /*return*/];
        });
    }); };
    // const addSelection = async (selection: SelectionType) => {
    //   setSelections((prev) => {
    //     const index = prev.findIndex((item) => item.id === selection.id)
    //     if (index === -1) {
    //       return [...prev, selection]
    //     }
    //     return prev
    //   })
    // }
    // const updateSelection = async (id: string, updatedSelection: SelectionType) => {
    //   setSelections((prev) => {
    //     const index = prev.findIndex((item) => item.id === id)
    //     if (index !== -1) {
    //       prev.splice(index, 1)
    //     }
    //     return [...prev, updatedSelection]
    //   })
    // }
    var updateSelection = function (id, updatedSelection, identifier) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setSelections(function (prev) {
                var _a;
                var _b;
                var idInPrev = (_b = prev[identifier]) !== null && _b !== void 0 ? _b : [];
                var index = idInPrev === null || idInPrev === void 0 ? void 0 : idInPrev.findIndex(function (item) { return item.id === id; });
                if (index !== -1) {
                    idInPrev.splice(index, 1);
                }
                return __assign(__assign({}, prev), (_a = {}, _a[identifier] = __spreadArray(__spreadArray([], idInPrev, true), [updatedSelection], false), _a));
            });
            return [2 /*return*/];
        });
    }); };
    // const removeSelection = (selection: SelectionType) => {
    //   console.log('Removing selection:', selection.id, selection);
    //   setSelections((prev) => {
    //     const newSelections = prev.filter((item) => item.id !== selection.id);
    //     console.log('New selections after removal:', newSelections);
    //     return newSelections;
    //   });
    // }
    var removeSelection = function (selection, identifier) {
        console.log('Removing selection:', selection.id, selection);
        setSelections(function (prev) {
            var _a;
            var _b;
            var idInPrev = (_b = prev[identifier]) !== null && _b !== void 0 ? _b : [];
            var newSelections = idInPrev === null || idInPrev === void 0 ? void 0 : idInPrev.filter(function (item) { return item.id !== selection.id; });
            console.log('New selections after removal:', newSelections);
            return __assign(__assign({}, prev), (_a = {}, _a[identifier] = newSelections, _a));
        });
    };
    console.log(selections, "removal selection selection");
    return {
        selections: selections,
        setSelections: setSelections,
        addSelection: addSelection,
        updateSelection: updateSelection,
        removeSelection: removeSelection,
    };
};
