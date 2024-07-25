import { IContextNode, isDeepEqual } from '@mweb/core'
import { TransferableContext } from '../../common/transferable-context'
import { ScalarType, TargetCondition, Target } from './target.entity'

export class TargetService {
  static findContextByTarget(target: Target, context: IContextNode): IContextNode | null {
    if (this.isTargetMet(target, context)) {
      return context
    }

    for (const child of context.children) {
      const found = this.findContextByTarget(target, child)

      if (found) {
        return found
      }
    }

    return null
  }

  static isTargetMet(target: Target | TransferableContext, context: IContextNode): boolean {
    // ToDo: check insertion points?

    if (target.namespace && target.namespace !== context.namespace) {
      return false
    }

    // for Target
    if ('contextType' in target && target.contextType !== context.contextType) {
      return false
    }

    // for TransferableContext
    if ('type' in target && target.type !== context.contextType) {
      return false
    }

    // for Target
    if ('if' in target && !this._areConditionsMet(target.if, context.parsedContext)) {
      return false
    }

    // for TransferableContext
    if ('parsed' in target && !isDeepEqual(target.parsed, context.parsedContext)) {
      return false
    }

    if (
      target.parent &&
      (!context.parentNode || !this.isTargetMet(target.parent, context.parentNode))
    ) {
      return false
    }

    return true
  }

  static _areConditionsMet(
    conditions: Record<string, TargetCondition>,
    values: Record<string, ScalarType>
  ): boolean {
    for (const property in conditions) {
      if (!this._isConditionMet(conditions[property], values[property])) {
        return false
      }
    }

    return true
  }

  static _isConditionMet(condition: TargetCondition, value: ScalarType): boolean {
    const { not: _not, eq: _eq, contains: _contains, in: _in, endsWith: _endsWith } = condition

    if (_not !== undefined) {
      return _not !== value
    }

    if (_eq !== undefined) {
      return _eq === value
    }

    if (_contains !== undefined && typeof value === 'string') {
      return value.includes(_contains)
    }

    if (_endsWith !== undefined && typeof value === 'string') {
      return value.endsWith(_endsWith)
    }

    if (_in !== undefined) {
      return _in.includes(value)
    }

    return false
  }
}
