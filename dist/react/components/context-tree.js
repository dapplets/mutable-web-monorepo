"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextTree = void 0;
const react_1 = require("react");
const react_2 = __importDefault(require("react"));
const core_context_1 = require("../contexts/core-context");
const ContextTree = ({ children }) => {
    const { tree } = (0, core_context_1.useCore)();
    if (!tree)
        return null;
    return react_2.default.createElement(TreeItem, { node: tree, component: children });
};
exports.ContextTree = ContextTree;
const ChildrenTreeItem = ({ node, component: Component }) => {
    const [children, setChildren] = (0, react_1.useState)([...node.children]);
    // ToDo: refactor it. It stores unique key for each context node
    const contextKeyRef = (0, react_1.useRef)(new WeakMap(node.children.map((c, i) => [c, i])));
    const contextKeyCounter = (0, react_1.useRef)(node.children.length - 1); // last index
    (0, react_1.useEffect)(() => {
        const subscriptions = [
            node.on('childContextAdded', ({ child }) => {
                contextKeyRef.current.set(child, ++contextKeyCounter.current);
                setChildren((prev) => [...prev, child]);
            }),
            node.on('childContextRemoved', ({ child }) => {
                setChildren((prev) => prev.filter((c) => c !== child));
            }),
        ];
        return () => {
            subscriptions.forEach((sub) => sub.remove());
        };
    }, [node]);
    return children.map((child) => (react_2.default.createElement(TreeItem
    // key={`${child.namespace}/${child.contextType}/${child.id}`}
    , { 
        // key={`${child.namespace}/${child.contextType}/${child.id}`}
        key: contextKeyRef.current.get(child), node: child, component: Component })));
};
const TreeItem = ({ node, component: Component }) => {
    const [wrappedNode, setWrappedNode] = (0, react_1.useState)({ node });
    const [insPoints, setInsPoints] = (0, react_1.useState)([...node.insPoints]);
    (0, react_1.useEffect)(() => {
        // The Component re-renders when the current node changes only.
        // Changing the children and the parent node will not cause a re-render.
        // So it's not recommended to depend on another contexts in the Component.
        const subscriptions = [
            node.on('insertionPointAdded', ({ insertionPoint }) => {
                setInsPoints((prev) => [...prev, insertionPoint]);
            }),
            node.on('insertionPointRemoved', ({ insertionPoint }) => {
                setInsPoints((prev) => prev.filter((ip) => ip !== insertionPoint));
            }),
            node.on('contextChanged', () => {
                setWrappedNode({ node });
                // ToDo: don't replace whole node
            }),
        ];
        return () => {
            subscriptions.forEach((sub) => sub.remove());
        };
    }, [node]);
    return (react_2.default.createElement(react_2.default.Fragment, null,
        wrappedNode.node.element ? (react_2.default.createElement(Component, { context: wrappedNode.node, insPoints: insPoints })) : null,
        react_2.default.createElement(ChildrenTreeItem, { node: wrappedNode.node, component: Component })));
};
