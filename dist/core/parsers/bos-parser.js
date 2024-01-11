"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BosParser = void 0;
const utils_1 = require("./utils");
class BosParser {
    parseContext(element) {
        var _a;
        return JSON.parse((_a = element.getAttribute("data-props")) !== null && _a !== void 0 ? _a : "{}");
    }
    findChildElements(element) {
        return (0, utils_1.getChildContextElements)(element, "data-component").map((element) => ({
            element,
            contextName: element
                .getAttribute("data-component")
                .replace("/widget/", "--"), // ToDo: how to escape slashes?
        }));
    }
    findInsertionPoint(element, _, insertionPoint) {
        return element.querySelector(`[data-component="${insertionPoint}"]`);
    }
}
exports.BosParser = BosParser;
