"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickerContext = exports.contextDefaultValues = void 0;
const react_1 = require("react");
exports.contextDefaultValues = {
    pickerTask: null,
    setPickerTask: () => undefined,
};
exports.PickerContext = (0, react_1.createContext)(exports.contextDefaultValues);
