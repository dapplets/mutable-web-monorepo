"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTraceUpdate = void 0;
const react_1 = require("react");
function useTraceUpdate(props) {
    const prev = (0, react_1.useRef)(props);
    (0, react_1.useEffect)(() => {
        const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
            if (prev.current[k] !== v) {
                ps[k] = [prev.current[k], v];
            }
            return ps;
        }, {});
        if (Object.keys(changedProps).length > 0) {
            console.log('Changed props:', changedProps);
        }
        prev.current = props;
    });
}
exports.useTraceUpdate = useTraceUpdate;
