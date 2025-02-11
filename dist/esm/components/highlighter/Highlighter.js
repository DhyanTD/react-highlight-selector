import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { deserializeRange, serializeRange } from '../../libs/serialize';
import { generateId } from '../../libs/uid';
import { getPopoverElement, getSpanElement } from '../../libs/wrapperElements';
import DefaultPopover from '../DeafultPopover';
import { useSelections } from '../../hooks/UseSelection';
import { defaultMinSelectionLength, defaultSelectionWrapperClassName } from '../../constants/constants';
import { addHighlight, isHighlightable } from '../../libs/dom';
import { getOriginalRange, getRangeStartEndContainerText } from '../../libs/createRange';
import { sortByPositionAndOffset } from '../../libs/sort';
export var Highlighter = function (_a) {
    var htmlString = _a.htmlString, onClickHighlight = _a.onClickHighlight, disablePopover = _a.disablePopover, maxSelectionLength = _a.maxSelectionLength, minSelectionLength = _a.minSelectionLength, className = _a.className, PopoverChildren = _a.PopoverChildren, PopoverClassName = _a.PopoverClassName, selectionWrapperClassName = _a.selectionWrapperClassName, onSelection = _a.onSelection, onClick = _a.onClick, onCopy = _a.onCopy, disableMultiColorHighlight = _a.disableMultiColorHighlight, onHiglightChange = _a.onHiglightChange, identifier = _a.identifier
    // selections,
    ;
    var _b = useSelections(), selections = _b.selections, addSelection = _b.addSelection, removeSelection = _b.removeSelection, updateSelection = _b.updateSelection;
    var rootRef = useRef(null);
    var tempRef = useRef(null);
    var div = document.createElement('div');
    tempRef.current = div;
    tempRef.current.innerHTML = htmlString;
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
                    modal.innerHTML = "\n            <div class=\"modal-content\">\n              <button class=\"close-button\">close</button>\n              ".concat(longHtml, "\n            </div>\n          ");
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
                    modal.innerHTML = "\n            <div class=\"modal-content\">\n              <button class=\"close-button\">close</button>\n              ".concat(longHtml, "\n            </div>\n          ");
                    document.body.appendChild(modal);
                    (_a = modal.querySelector('.close-button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
                        document.body.removeChild(modal);
                    });
                });
            }
        });
    };
    var getWrapper = useCallback(function (selection) {
        var span = getSpanElement({
            className: selection.className || defaultSelectionWrapperClassName,
        });
        if (!disablePopover) {
            var popover_1 = getPopoverElement({ className: PopoverClassName });
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
    var handleMouseUp = function () {
        // e.stopPropagation()
        var selection = window.getSelection();
        if (!selection)
            return;
        if (!minSelectionLength) {
            minSelectionLength = defaultMinSelectionLength;
        }
        if (minSelectionLength && selection.toString().length < minSelectionLength)
            return;
        if (maxSelectionLength && selection.toString().length > maxSelectionLength)
            return;
        var range = selection.getRangeAt(0);
        if (!isHighlightable(range))
            return;
        var expRange = getOriginalRange(range, tempRef.current);
        if (!expRange)
            return;
        var _a = getRangeStartEndContainerText(range), startContainerText = _a.startContainerText, endContainerText = _a.endContainerText;
        var newSelection = {
            meta: serializeRange(expRange, tempRef.current),
            text: range.toString(),
            id: "selection-".concat(generateId()),
            className: selectionWrapperClassName || defaultSelectionWrapperClassName,
            startContainerText: startContainerText,
            endContainerText: endContainerText,
        };
        addSelection(newSelection);
        onSelection && onSelection(newSelection);
    };
    function manageCopy(selection) {
        // const span = getSpanElement({
        //   className: selection.className || defaultSelectionWrapperClassName,
        // })
        onCopy && onCopy(selection);
    }
    useEffect(function () {
        var sortedSelections = sortByPositionAndOffset(selections);
        if (!rootRef.current)
            return;
        rootRef.current.innerHTML = '';
        rootRef.current.innerHTML = htmlString;
        handleHoverAndClickEffects();
        if (sortedSelections && sortedSelections.length) {
            for (var i = 0; i < sortedSelections.length; i++) {
                var item = sortedSelections[i];
                var range = deserializeRange(item.meta, rootRef.current);
                if (range) {
                    addHighlight(range, getWrapper(item));
                    // onHiglightChange && onHiglightChange('')
                }
                var popoverRoot = document.getElementById("pop-".concat(item.id));
                if (!popoverRoot)
                    return;
                var root = ReactDOM.createRoot(popoverRoot);
                if (PopoverChildren) {
                    root.render(_jsx(PopoverChildren, { selection: item, removeSelection: removeSelection, updateSelection: updateSelection, handleCopy: function (selection) { return manageCopy(selection); }, disableMultiColorHighlight: disableMultiColorHighlight }));
                }
                else {
                    root.render(_jsx(DefaultPopover, { removeSelection: removeSelection, selection: item, updateSelection: updateSelection, handleCopy: function (selection) { return manageCopy(selection); }, disableMultiColorHighlight: disableMultiColorHighlight }));
                }
            }
        }
    }, [
        selections,
        getWrapper,
        PopoverChildren,
        htmlString,
        removeSelection,
        updateSelection,
        disableMultiColorHighlight,
    ]);
    var memoizedChildren = useMemo(function () {
        return _jsx("div", { ref: rootRef, id: identifier ? "highlighter-root" + identifier : "highlighter-root", onClick: onClick, onMouseUp: handleMouseUp, className: className });
    }, [onClick, handleMouseUp, className]);
    return memoizedChildren;
};
