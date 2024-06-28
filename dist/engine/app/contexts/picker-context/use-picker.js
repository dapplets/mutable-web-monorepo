"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePicker = void 0;
const react_1 = require("react");
const picker_context_1 = require("./picker-context");
function usePicker() {
    return (0, react_1.useContext)(picker_context_1.PickerContext);
}
exports.usePicker = usePicker;
