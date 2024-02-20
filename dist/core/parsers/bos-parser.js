"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceMustaches = exports.BosParser = void 0;
const CompAttr = 'data-component';
const PropsAttr = 'data-props';
class BosParser {
    constructor(config) {
        // ToDo: validate config
        this.config = config;
        if (!this.config.contexts['root']) {
            this.config.contexts['root'] = {
                props: {
                    id: 'root',
                },
                children: ['post'], // ToDo:
            };
        }
    }
    parseContext(element, contextName) {
        var _a;
        const contextProperties = this.config.contexts[contextName].props;
        if (!contextProperties)
            return {};
        const parsed = {};
        const bosProps = JSON.parse((_a = element.getAttribute(PropsAttr)) !== null && _a !== void 0 ? _a : '{}');
        for (const [prop, mustacheTemplate] of Object.entries(contextProperties)) {
            const value = replaceMustaches(mustacheTemplate, { props: bosProps });
            parsed[prop] = value;
        }
        return parsed;
    }
    findChildElements(element, contextName) {
        var _a, _b;
        const contextConfig = this.config.contexts[contextName];
        if (!((_a = contextConfig.children) === null || _a === void 0 ? void 0 : _a.length))
            return [];
        const result = [];
        for (const childContextName of (_b = contextConfig.children) !== null && _b !== void 0 ? _b : []) {
            const childConfig = this.config.contexts[childContextName];
            if (!childConfig.component)
                continue;
            const childElements = Array.from(element.querySelectorAll(`[${CompAttr}="${childConfig.component}"]`));
            for (const childElement of childElements) {
                result.push({ element: childElement, contextName: childContextName });
            }
        }
        return result;
    }
    findInsertionPoint(element, contextName, insertionPoint) {
        var _a;
        const contextConfig = this.config.contexts[contextName];
        const insPointConfig = (_a = contextConfig.insertionPoints) === null || _a === void 0 ? void 0 : _a[insertionPoint];
        if (insPointConfig === null || insPointConfig === void 0 ? void 0 : insPointConfig.component) {
            return element.querySelector(`[${CompAttr}="${insPointConfig.component}"]`);
        }
        else if (insPointConfig) {
            // if `component` is not defined use self
            return element;
        }
        else {
            return null;
        }
    }
    getInsertionPoints(_, contextName) {
        const contextConfig = this.config.contexts[contextName];
        if (!contextConfig.insertionPoints)
            return [];
        return Object.entries(contextConfig.insertionPoints).map(([name, selectorOrObject]) => ({
            name,
            insertionType: selectorOrObject.insertionType,
            bosLayoutManager: selectorOrObject.bosLayoutManager,
        }));
    }
}
exports.BosParser = BosParser;
/**
 * Executes a template string by replacing placeholders with corresponding values from the provided data object.
 *
 * @param {string} template - The template string containing placeholders in the format '{{key.subkey}}'.
 * @param {Object} data - The data object containing values to replace the placeholders in the template.
 * @returns {string} - The result string after replacing placeholders with actual values.
 *
 * @example
 * const template = "{{props.a}}/{{props.b.c}}";
 * const data = {
 *   props: {
 *     a: 1,
 *     b: {
 *       c: 2
 *     }
 *   }
 * };
 * const result = exec(template, data);
 * console.log(result); // "1/2"
 */
function replaceMustaches(template, data) {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const keys = key.split('.');
        let value = data;
        for (const k of keys) {
            if (value.hasOwnProperty(k)) {
                value = value[k];
            }
            else {
                return match;
            }
        }
        return String(value);
    });
}
exports.replaceMustaches = replaceMustaches;
