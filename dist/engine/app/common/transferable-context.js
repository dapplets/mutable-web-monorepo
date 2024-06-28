"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTransferableContext = void 0;
// ToDo: reuse in ContextPicker
const buildTransferableContext = (context) => ({
    namespace: context.namespace,
    type: context.contextType,
    id: context.id,
    parsed: context.parsedContext,
    parent: context.parentNode ? (0, exports.buildTransferableContext)(context.parentNode) : null,
});
exports.buildTransferableContext = buildTransferableContext;
