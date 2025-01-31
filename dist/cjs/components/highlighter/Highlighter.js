"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Highlighter = void 0;
var tslib_1 = require("tslib");
var jsx_runtime_1 = require("react/jsx-runtime");
var react_1 = require("react");
var client_1 = tslib_1.__importDefault(require("react-dom/client"));
var serialize_1 = require("../../libs/serialize");
var uid_1 = require("../../libs/uid");
var wrapperElements_1 = require("../../libs/wrapperElements");
var DeafultPopover_1 = tslib_1.__importDefault(require("../DeafultPopover"));
var UseSelection_1 = require("../../hooks/UseSelection");
var constants_1 = require("../../constants/constants");
var dom_1 = require("../../libs/dom");
var createRange_1 = require("../../libs/createRange");
var sort_1 = require("../../libs/sort");
var Highlighter = function (_a) {
    var htmlString = _a.htmlString, onClickHighlight = _a.onClickHighlight, disablePopover = _a.disablePopover, maxSelectionLength = _a.maxSelectionLength, minSelectionLength = _a.minSelectionLength, className = _a.className, PopoverChildren = _a.PopoverChildren, PopoverClassName = _a.PopoverClassName, selectionWrapperClassName = _a.selectionWrapperClassName, onSelection = _a.onSelection, onClick = _a.onClick, onCopy = _a.onCopy, disableMultiColorHighlight = _a.disableMultiColorHighlight;
    var _b = (0, UseSelection_1.useSelections)(), selections = _b.selections, addSelection = _b.addSelection, removeSelection = _b.removeSelection, updateSelection = _b.updateSelection;
    var rootRef = (0, react_1.useRef)(null);
    var tempRef = (0, react_1.useRef)(null);
    var div = document.createElement('div');
    tempRef.current = div;
    tempRef.current.innerHTML = htmlString;
    var getWrapper = (0, react_1.useCallback)(function (selection) {
        var span = (0, wrapperElements_1.getSpanElement)({
            className: selection.className || constants_1.defaultSelectionWrapperClassName,
        });
        if (!disablePopover) {
            var popover_1 = (0, wrapperElements_1.getPopoverElement)({ className: PopoverClassName });
            if (!PopoverClassName) {
                span.onmouseover = function () {
                    popover_1.style.visibility = 'visible';
                    popover_1.style.opacity = '1';
                };
                span.onmouseout = function () {
                    popover_1.style.visibility = 'hidden';
                    popover_1.style.opacity = '0';
                };
            }
            popover_1.id = "pop-".concat(selection.id);
            span.appendChild(popover_1);
        }
        if (onClickHighlight) {
            span.onclick = function (e) { return onClickHighlight(selection, e); };
        }
        span.id = selection.id;
        return span;
    }, [PopoverClassName, disablePopover, onClickHighlight]);
    var handleHoverAndClickEffects = function () {
        if (!rootRef.current)
            return;
        rootRef.current.querySelectorAll('.hover-content-mark').forEach(function (mark) {
            var _a;
            var uniqueId = mark.getAttribute('data-hover-id');
            var shortHtml = mark.getAttribute('data-short-html');
            var longHtml = mark.getAttribute('data-long-html');
            if (!uniqueId || (!shortHtml && !longHtml))
                return;
            var markElement = mark;
            if (shortHtml && shortHtml.trim() !== '') {
                var popup_1 = document.createElement('div');
                popup_1.className = 'hover-content-popup';
                popup_1.innerHTML = shortHtml + (longHtml ? "<button class=\"view-more\">View More</button>" : '');
                markElement.appendChild(popup_1);
                var timeout_1;
                var showPopup = function () {
                    clearTimeout(timeout_1);
                    popup_1.style.display = 'block';
                };
                var hidePopup = function () {
                    timeout_1 = setTimeout(function () {
                        popup_1.style.display = 'none';
                    }, 100);
                };
                markElement.addEventListener('mouseenter', showPopup);
                markElement.addEventListener('mouseleave', hidePopup);
                popup_1.addEventListener('mouseenter', showPopup);
                popup_1.addEventListener('mouseleave', hidePopup);
                (_a = popup_1.querySelector('.view-more')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
                    var _a;
                    var modal = document.createElement('div');
                    modal.className = 'modal';
                    modal.innerHTML = "\n\n            <div class=\"modal-content\">\n\n              <button class=\"close-button\">close</button>\n\n              ".concat(longHtml, "\n\n            </div>\n\n          ");
                    document.body.appendChild(modal);
                    (_a = modal.querySelector('.close-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
                        document.body.removeChild(modal);
                    });
                });
            }
            else {
                markElement.addEventListener('click', function (event) {
                    var _a;
                    event.preventDefault();
                    var modal = document.createElement('div');
                    modal.className = 'modal';
                    modal.innerHTML = "\n\n            <div class=\"modal-content\">\n\n              <button class=\"close-button\">close</button>\n\n              ".concat(longHtml, "\n\n            </div>\n\n          ");
                    document.body.appendChild(modal);
                    (_a = modal.querySelector('.close-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
                        document.body.removeChild(modal);
                    });
                });
            }
        });
    };
    var handleMouseUp = function () {
        // e.stopPropagation()
        var selection = window.getSelection();
        if (!selection)
            return;
        if (!minSelectionLength) {
            minSelectionLength = constants_1.defaultMinSelectionLength;
        }
        if (minSelectionLength && selection.toString().length < minSelectionLength)
            return;
        if (maxSelectionLength && selection.toString().length > maxSelectionLength)
            return;
        var range = selection.getRangeAt(0);
        if (!(0, dom_1.isHighlightable)(range))
            return;
        var expRange = (0, createRange_1.getOriginalRange)(range, tempRef.current);
        if (!expRange)
            return;
        var _a = (0, createRange_1.getRangeStartEndContainerText)(range), startContainerText = _a.startContainerText, endContainerText = _a.endContainerText;
        var newSelection = {
            meta: (0, serialize_1.serializeRange)(expRange, tempRef.current),
            text: range.toString(),
            id: "selection-".concat((0, uid_1.generateId)()),
            className: selectionWrapperClassName || constants_1.defaultSelectionWrapperClassName,
            startContainerText: startContainerText,
            endContainerText: endContainerText,
        };
        addSelection(newSelection);
        onSelection && onSelection(newSelection);
    };
    function manageCopy(selection) {
        var span = (0, wrapperElements_1.getSpanElement)({
            className: selection.className || constants_1.defaultSelectionWrapperClassName,
        });
        onCopy && onCopy(selection);
    }
    (0, react_1.useEffect)(function () {
        var sortedSelections = (0, sort_1.sortByPositionAndOffset)(selections);
        if (!rootRef.current)
            return;
        rootRef.current.innerHTML = '';
        rootRef.current.innerHTML = htmlString;
        handleHoverAndClickEffects();
        if (sortedSelections && sortedSelections.length) {
            for (var i = 0; i < sortedSelections.length; i++) {
                var item = sortedSelections[i];
                var range = (0, serialize_1.deserializeRange)(item.meta, rootRef.current);
                if (range) {
                    (0, dom_1.addHighlight)(range, getWrapper(item));
                }
                var popoverRoot = document.getElementById("pop-".concat(item.id));
                if (!popoverRoot)
                    return;
                var root = client_1.default.createRoot(popoverRoot);
                if (PopoverChildren) {
                    root.render((0, jsx_runtime_1.jsx)(PopoverChildren, { selection: item, removeSelection: removeSelection, updateSelection: updateSelection, handleCopy: function (selection) { return manageCopy(selection); }, disableMultiColorHighlight: disableMultiColorHighlight }));
                }
                else {
                    root.render((0, jsx_runtime_1.jsx)(DeafultPopover_1.default, { removeSelection: removeSelection, selection: item, updateSelection: updateSelection, handleCopy: function (selection) { return manageCopy(selection); }, disableMultiColorHighlight: disableMultiColorHighlight }));
                }
            }
        }
    }, [selections, getWrapper, PopoverChildren, htmlString, removeSelection, updateSelection, disableMultiColorHighlight]);
    return (0, jsx_runtime_1.jsx)("div", { ref: rootRef, id: 'highlighter-root', onClick: onClick, onMouseUp: handleMouseUp, className: className });
};
exports.Highlighter = Highlighter;
