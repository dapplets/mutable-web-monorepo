"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDeepEqual = exports.generateGuid = void 0;
function generateGuid() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}
exports.generateGuid = generateGuid;
function isDeepEqual(obj1, obj2) {
    if (obj1 === obj2)
        return true;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
        return false;
    }
    const keysA = Object.keys(obj1);
    const keysB = Object.keys(obj2);
    if (keysA.length !== keysB.length) {
        return false;
    }
    let result = true;
    keysA.forEach((key) => {
        if (!keysB.includes(key)) {
            result = false;
        }
        if (typeof obj1[key] === 'function' || typeof obj2[key] === 'function') {
            if (obj1[key].toString() !== obj2[key].toString()) {
                result = false;
            }
        }
        if (!isDeepEqual(obj1[key], obj2[key])) {
            result = false;
        }
    });
    return result;
}
exports.isDeepEqual = isDeepEqual;
