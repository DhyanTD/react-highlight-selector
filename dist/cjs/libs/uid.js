"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
function generateId() {
    return "".concat(Date.now(), "-").concat(Math.random().toString(36).substring(2, 9));
}
