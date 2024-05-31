"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOutside = void 0;
const react_1 = require("react");
/**
 * Hook that call callback on click outside of the passed ref
 */
function useOutside(ref, callback, trackingRefs, openCloseWalletPopupRef) {
    (0, react_1.useEffect)(() => {
        function handleClickOutside(event) {
            if (ref.current &&
                !ref.current.contains(event.composedPath()[0]) &&
                (!openCloseWalletPopupRef ||
                    (openCloseWalletPopupRef.current &&
                        !event.composedPath().includes(openCloseWalletPopupRef.current)))) {
                callback();
            }
        }
        // Bind the event listener
        document.addEventListener('click', handleClickOutside);
        trackingRefs === null || trackingRefs === void 0 ? void 0 : trackingRefs.forEach((trackingRef) => { var _a; return (_a = trackingRef === null || trackingRef === void 0 ? void 0 : trackingRef.current) === null || _a === void 0 ? void 0 : _a.addEventListener('click', handleClickOutside); });
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener('click', handleClickOutside);
            trackingRefs === null || trackingRefs === void 0 ? void 0 : trackingRefs.forEach((trackingRef) => { var _a; return (_a = trackingRef === null || trackingRef === void 0 ? void 0 : trackingRef.current) === null || _a === void 0 ? void 0 : _a.removeEventListener('click', handleClickOutside); });
        };
    }, [ref, callback, trackingRefs]);
}
exports.useOutside = useOutside;
