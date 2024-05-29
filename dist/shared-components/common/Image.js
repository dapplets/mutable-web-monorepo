"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Image = void 0;
const react_1 = __importStar(require("react"));
const Image = ({ image, alt, fallbackUrl }) => {
    const [imageUrl, setImageUrl] = (0, react_1.useState)(undefined);
    // todo: image can changed. need watch
    (0, react_1.useEffect)(() => {
        (image === null || image === void 0 ? void 0 : image.ipfs_cid)
            ? setImageUrl(`https://ipfs.near.social/ipfs/${image.ipfs_cid}`)
            : (image === null || image === void 0 ? void 0 : image.url)
                ? setImageUrl(image === null || image === void 0 ? void 0 : image.url)
                : setImageUrl(fallbackUrl);
    }, [image]);
    return (react_1.default.createElement("img", { src: imageUrl, alt: alt, onError: () => {
            if (imageUrl !== fallbackUrl) {
                setImageUrl(fallbackUrl);
            }
        } }));
};
exports.Image = Image;
