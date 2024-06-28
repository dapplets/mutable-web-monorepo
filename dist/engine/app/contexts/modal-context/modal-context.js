"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModalContext = exports.contextDefaultValues = exports.NotificationType = void 0;
const react_1 = require("react");
var NotificationType;
(function (NotificationType) {
    NotificationType["Error"] = "error";
    NotificationType["Warning"] = "warning";
    NotificationType["Info"] = "info";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
exports.contextDefaultValues = {
    notify: () => { },
};
exports.ModalContext = (0, react_1.createContext)(exports.contextDefaultValues);
