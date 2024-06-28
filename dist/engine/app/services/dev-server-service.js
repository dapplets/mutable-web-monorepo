"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedirectMap = void 0;
const constants_1 = require("../../constants");
const getRedirectMap = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const res = yield fetch(constants_1.bosLoaderUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
        throw new Error('Dev server is not available');
    }
    const data = yield res.json();
    return (_a = data === null || data === void 0 ? void 0 : data.components) !== null && _a !== void 0 ? _a : null;
});
exports.getRedirectMap = getRedirectMap;
