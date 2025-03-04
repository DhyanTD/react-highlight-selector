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
var extractHighlightsFromHtml = function (htmlString, identifier) {
    var preprocessedHtml = htmlString
        .replace(/<div([^>]*)(\sid="selection-[^"]+")([^>]*)>/gi, '<span$1$2$3>')
        .replace(/<\/div>/gi, '</span>');
    var parser = new DOMParser();
    var doc = parser.parseFromString(preprocessedHtml, 'text/html');
    var initialSelections = {};
    var highlightElements = doc.querySelectorAll('span[id^="selection-"]');
    var data = [];
    highlightElements.forEach(function (el) {
        var _a, _b, _c, _d, _e, _f;
        var id = el.getAttribute('id') || "selection-".concat(generateId());
        var className = el.className || defaultSelectionWrapperClassName;
        var text = el.textContent || '';
        var parent = el.parentElement;
        if (parent && text) {
            var prevSibling = el.previousSibling;
            var nextSibling = el.nextSibling;
            var leadingSpace = '';
            var trailingSpace = '';
            if ((prevSibling === null || prevSibling === void 0 ? void 0 : prevSibling.nodeType) === Node.TEXT_NODE) {
                leadingSpace = ((_b = (_a = prevSibling.textContent) === null || _a === void 0 ? void 0 : _a.match(/\s+$/)) === null || _b === void 0 ? void 0 : _b.pop()) || '';
                prevSibling.textContent = ((_c = prevSibling.textContent) === null || _c === void 0 ? void 0 : _c.replace(/\s+$/, '')) || '';
            }
            if ((nextSibling === null || nextSibling === void 0 ? void 0 : nextSibling.nodeType) === Node.TEXT_NODE) {
                trailingSpace = ((_e = (_d = nextSibling.textContent) === null || _d === void 0 ? void 0 : _d.match(/^\s+/)) === null || _e === void 0 ? void 0 : _e.pop()) || '';
                nextSibling.textContent = ((_f = nextSibling.textContent) === null || _f === void 0 ? void 0 : _f.replace(/^\s+/, '')) || '';
            }
            var textNode = doc.createTextNode("".concat(leadingSpace).concat(text).concat(trailingSpace));
            parent.replaceChild(textNode, el);
            var range = doc.createRange();
            range.selectNodeContents(textNode);
            // const meta = serializeRange(range, parent);
            var meta = el.getAttribute('data-meta') || serializeRange(range, parent);
            data.push({
                id: id,
                text: text,
                className: className,
                meta: meta,
                startContainerText: text,
                endContainerText: text,
            });
        }
    });
    initialSelections[identifier] = data;
    var cleanedHtml = doc.body.innerHTML.trim();
    // const cleanedHtml =  `<div>` +doc.body.innerHTML.trim() + `</div>`;
    console.log(doc.body.innerHTML, 'doc.body.innerHTML cleanedHtml', identifier, initialSelections);
    // const cleanedHtml = `<div><p>hhhhh</p><p>question 101</p> question</div>`
    return { cleanedHtml: cleanedHtml, initialSelections: initialSelections };
};
export var Highlighter = function (_a) {
    var htmlString = _a.htmlString, onClickHighlight = _a.onClickHighlight, disablePopover = _a.disablePopover, maxSelectionLength = _a.maxSelectionLength, minSelectionLength = _a.minSelectionLength, className = _a.className, PopoverChildren = _a.PopoverChildren, PopoverClassName = _a.PopoverClassName, selectionWrapperClassName = _a.selectionWrapperClassName, onSelection = _a.onSelection, onClick = _a.onClick, onCopy = _a.onCopy, disableMultiColorHighlight = _a.disableMultiColorHighlight, identifier = _a.identifier;
    console.log(htmlString, 'removal string cleandHtml');
    var _b = useMemo(function () { return extractHighlightsFromHtml(htmlString, identifier); }, [htmlString]), cleanedHtml = _b.cleanedHtml, initialSelections = _b.initialSelections;
    var _c = useSelections(), selections = _c.selections, setSelections = _c.setSelections, addSelection = _c.addSelection, removeSelection = _c.removeSelection, updateSelection = _c.updateSelection;
    // const rootRef = useRef<HTMLDivElement | null>(null)
    // const tempRef = useRef<HTMLDivElement | null>(null)
    // const div = document.createElement('div')
    // tempRef.current = div
    // tempRef.current.innerHTML = htmlString
    useEffect(function () {
        var _a, _b;
        console.log('cleanedHtml comming here0', initialSelections, selections, cleanedHtml);
        if ((!selections[identifier] || ((_a = selections[identifier]) === null || _a === void 0 ? void 0 : _a.length) === 0) &&
            ((_b = initialSelections[identifier]) === null || _b === void 0 ? void 0 : _b.length) > 0) {
            console.log('cleanedHtml comming here1', initialSelections);
            setSelections(initialSelections);
        }
    }, [initialSelections]);
    var rootRef = useRef(null);
    var tempRef = useRef(null);
    var div = document.createElement('div');
    tempRef.current = div;
    tempRef.current.innerHTML = cleanedHtml;
    console.log(cleanedHtml, 'cleanedHtml', selections, 'initialSelections', initialSelections);
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
            className: (selection === null || selection === void 0 ? void 0 : selection.className) || defaultSelectionWrapperClassName,
            meta: (selection === null || selection === void 0 ? void 0 : selection.meta) || '',
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
        if (minSelectionLength && (selection === null || selection === void 0 ? void 0 : selection.toString().length) < minSelectionLength)
            return;
        if (maxSelectionLength && (selection === null || selection === void 0 ? void 0 : selection.toString().length) > maxSelectionLength)
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
            text: range === null || range === void 0 ? void 0 : range.toString(),
            id: "selection-".concat(generateId()),
            className: selectionWrapperClassName || defaultSelectionWrapperClassName,
            startContainerText: startContainerText,
            endContainerText: endContainerText,
        };
        addSelection(newSelection, identifier);
        onSelection && onSelection(newSelection);
        console.log('cleanedHtml selection --?/p', selections);
    };
    function manageCopy(selection) {
        // const span = getSpanElement({
        //   className: selection.className || defaultSelectionWrapperClassName,
        // })
        console.log(selection, "Coping");
        onCopy && onCopy(selection);
    }
    useEffect(function () {
        var sortedSelections = sortByPositionAndOffset(selections[identifier]);
        if (!rootRef.current)
            return;
        rootRef.current.innerHTML = '';
        // rootRef.current.innerHTML = htmlString
        rootRef.current.innerHTML = cleanedHtml;
        handleHoverAndClickEffects();
        if (sortedSelections && (sortedSelections === null || sortedSelections === void 0 ? void 0 : sortedSelections.length)) {
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
                    root.render(_jsx(PopoverChildren, { selection: item, removeSelection: removeSelection, updateSelection: updateSelection, handleCopy: function (selection) { return manageCopy(selection); }, disableMultiColorHighlight: disableMultiColorHighlight, identifier: identifier }));
                }
                else {
                    root.render(_jsx(DefaultPopover, { removeSelection: removeSelection, selection: item, updateSelection: updateSelection, handleCopy: function (selection) { return manageCopy(selection); }, disableMultiColorHighlight: disableMultiColorHighlight, identifier: identifier }));
                }
            }
        }
    }, [
        selections,
        getWrapper,
        PopoverChildren,
        // htmlString,
        cleanedHtml,
        removeSelection,
        updateSelection,
        disableMultiColorHighlight,
        identifier,
    ]);
    var memoizedChildren = useMemo(function () {
        return (_jsx("div", { ref: rootRef, id: identifier ? "highlighter-root" + identifier : "highlighter-root", onClick: onClick, onMouseUp: handleMouseUp, className: className }));
    }, [onClick, handleMouseUp, className, identifier]);
    return memoizedChildren;
};
