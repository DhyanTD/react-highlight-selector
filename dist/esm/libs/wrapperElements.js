export var getSpanElement = function (_a) {
    var className = _a.className, meta = _a.meta;
    var span = document.createElement('div');
    if (className) {
        span.className = className;
    }
    if (meta) {
        span.setAttribute('data-meta', meta);
    }
    return span;
};
export var getPopoverElement = function (_a) {
    var className = _a.className;
    var popover = document.createElement('div');
    if (!className) {
        popover.setAttribute('style', " visibility: hidden;\n        min-width:  20px;\n        background-color: transparent;\n        text-align: center;\n        position: absolute;\n        z-index:  1;\n        bottom:  100%;\n        padding-bottom:16px;\n        opacity:  0;\n        display: inline-block; \n        transition: opacity  0.3s;");
        return popover;
    }
    popover.className = className;
    return popover;
};
