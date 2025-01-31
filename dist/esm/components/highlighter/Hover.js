import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ReactDOM from 'react-dom';
var HoverSpan = function (_a) {
    var text = _a.text, shortContent = _a.shortContent, longContent = _a.longContent;
    var _b = React.useState(false), isHovered = _b[0], setIsHovered = _b[1];
    var _c = React.useState(false), isModalOpen = _c[0], setIsModalOpen = _c[1];
    var handleMouseEnter = function () {
        setIsHovered(true);
    };
    var handleMouseLeave = function () {
        setTimeout(function () {
            if (!document.querySelector('.hover-content-popup:hover')) {
                setIsHovered(false);
            }
        }, 100);
    };
    var handlePopupMouseEnter = function () {
        setIsHovered(true);
    };
    var handlePopupMouseLeave = function () {
        setIsHovered(false);
    };
    var handleViewMore = function () {
        setIsModalOpen(true);
    };
    return (_jsxs("span", { style: { position: 'relative', display: 'inline-block' }, children: [_jsx("span", { style: {
                    cursor: 'help',
                    borderBottom: '1px dashed #4B5563',
                    color: '#6a60b0'
                }, onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave, children: text || 'Hover over me' }), isHovered && shortContent && (_jsxs("div", { className: "hover-content-popup", style: {
                    position: 'absolute',
                    left: 0,
                    top: '100%',
                    marginTop: '0.25rem',
                    width: '500px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    backgroundColor: '#FFFFFF',
                    padding: '8px 8px 30px 8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
                    zIndex: 50,
                    display: 'block',
                    minWidth: '200px'
                }, onMouseEnter: handlePopupMouseEnter, onMouseLeave: handlePopupMouseLeave, children: [_jsx("div", { dangerouslySetInnerHTML: { __html: shortContent } }), longContent && (_jsx("button", { onClick: handleViewMore, style: {
                            position: 'absolute',
                            bottom: '2px',
                            right: '5px',
                            background: 'transparent',
                            color: '#36c',
                            border: 'none',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontSize: '12px'
                        }, children: "View More" }))] })), isModalOpen && (_jsx("div", { style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1100,
                }, children: _jsxs("div", { style: {
                        backgroundColor: '#fff',
                        padding: '20px',
                        borderRadius: '8px',
                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)',
                        width: 'auto',
                        maxWidth: '70%',
                        minWidth: '350px',
                        maxHeight: '90vh',
                        position: 'relative',
                        overflowY: 'auto',
                    }, children: [_jsx("button", { onClick: function () { return setIsModalOpen(false); }, style: {
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                backgroundColor: '#f9f9f9f9',
                                border: 'none',
                                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.3)',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                padding: '5px 10px',
                            }, children: "close" }), _jsx("div", { dangerouslySetInnerHTML: { __html: longContent || '' } })] }) }))] }));
};
import React from 'react';
export default function HoverElement(_a) {
    var selection = _a.selection, span = _a.span, hoverContent = _a.hoverContent;
    ReactDOM.render(_jsx(HoverSpan, { text: selection.text, shortContent: hoverContent.shortContent, longContent: hoverContent.longContent }), span);
}
