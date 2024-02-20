"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaiveBosParser = void 0;
const utils_1 = require("./utils");
const CompAttr = 'data-component';
const PropsAttr = 'data-props';
class NaiveBosParser {
    parseContext(element) {
        var _a;
        return JSON.parse((_a = element.getAttribute(PropsAttr)) !== null && _a !== void 0 ? _a : '{}');
    }
    findChildElements(element) {
        return (0, utils_1.getChildContextElements)(element, CompAttr).map((element) => ({
            element,
            contextName: element.getAttribute(CompAttr).replace('/widget/', '--'), // ToDo: how to escape slashes?
        }));
    }
    findInsertionPoint(element, _, insertionPoint) {
        return element.querySelector(`[${CompAttr}="${insertionPoint}"]`);
    }
    getInsertionPoints(element) {
        return (0, utils_1.getChildContextElements)(element, CompAttr).map((el) => ({
            name: el.getAttribute(CompAttr).replace('/widget/', '--'),
        }));
    }
}
exports.NaiveBosParser = NaiveBosParser;
