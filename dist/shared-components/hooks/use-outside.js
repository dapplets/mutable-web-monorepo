"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOutside = void 0;
const react_1 = require("react");
/**
 * Hook that call callback on click outside of the passed ref
 */
function useOutside(ref, callback) {
    (0, react_1.useEffect)(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.composedPath()[0])) {
                callback();
            }
        }
        // Bind the event listener
        document.addEventListener('click', handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener('click', handleClickOutside);
        };
    }, [ref, callback]);
}
exports.useOutside = useOutside;
