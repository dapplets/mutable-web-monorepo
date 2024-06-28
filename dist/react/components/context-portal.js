"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextPortal = void 0;
const react_1 = require("react");
const react_dom_1 = require("react-dom");
const interface_1 = require("../../core/adapters/interface");
const DefaultInsertionType = interface_1.InsertionType.End;
const ContextPortal = ({ context, children, injectTo }) => {
    // ToDo: replace insPoints.find with Map
    const target = injectTo
        ? context.insPoints.find((ip) => ip.name === injectTo)
        : { element: context.element, insertionType: DefaultInsertionType };
    const containerRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (!target || !target.element)
            return;
        if (!containerRef.current) {
            containerRef.current = document.createElement('div');
            containerRef.current.className = 'mweb-context-portal';
        }
        const { element, insertionType } = target;
        switch (insertionType) {
            case interface_1.InsertionType.Before:
                element.before(containerRef.current);
                break;
            case interface_1.InsertionType.After:
                element.after(containerRef.current);
                break;
            case interface_1.InsertionType.Begin:
                element.insertBefore(containerRef.current, element.firstChild);
                break;
            case interface_1.InsertionType.End:
                element.appendChild(containerRef.current);
                break;
            default:
                break;
        }
        return () => {
            var _a;
            (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.remove();
        };
    }, [target]);
    if (!target || !target.element || !containerRef.current)
        return null;
    return (0, react_dom_1.createPortal)(children, containerRef.current);
};
exports.ContextPortal = ContextPortal;
