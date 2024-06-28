"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useModal = void 0;
const react_1 = require("react");
const modal_context_1 = require("./modal-context");
function useModal() {
    return (0, react_1.useContext)(modal_context_1.ModalContext);
}
exports.useModal = useModal;
