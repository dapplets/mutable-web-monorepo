"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TargetService = void 0;
const core_1 = require("../../../../core");
class TargetService {
    static isTargetMet(target, context) {
        // ToDo: check insertion points?
        if (target.namespace && target.namespace !== context.namespace) {
            return false;
        }
        // for Target
        if ('contextType' in target && target.contextType !== context.contextType) {
            return false;
        }
        // for TransferableContext
        if ('type' in target && target.type !== context.contextType) {
            return false;
        }
        // for Target
        if ('if' in target && !this._areConditionsMet(target.if, context.parsedContext)) {
            return false;
        }
        // for TransferableContext
        if ('parsed' in target && !(0, core_1.isDeepEqual)(target.parsed, context.parsedContext)) {
            return false;
        }
        if (target.parent &&
            (!context.parentNode || !this.isTargetMet(target.parent, context.parentNode))) {
            return false;
        }
        return true;
    }
    static _areConditionsMet(conditions, values) {
        for (const property in conditions) {
            if (!this._isConditionMet(conditions[property], values[property])) {
                return false;
            }
        }
        return true;
    }
    static _isConditionMet(condition, value) {
        const { not: _not, eq: _eq, contains: _contains, in: _in, endsWith: _endsWith } = condition;
        if (_not !== undefined) {
            return _not !== value;
        }
        if (_eq !== undefined) {
            return _eq === value;
        }
        if (_contains !== undefined && typeof value === 'string') {
            return value.includes(_contains);
        }
        if (_endsWith !== undefined && typeof value === 'string') {
            return value.endsWith(_endsWith);
        }
        if (_in !== undefined) {
            return _in.includes(value);
        }
        return false;
    }
}
exports.TargetService = TargetService;
