import { IContextNode } from '@mweb/core'
import { TransferableContext } from '../../types/transferable-context'
import { ScalarType, TargetCondition, Target } from './target.entity'

export class TargetService {
  static *findContextsByTarget(
    target: Target | TransferableContext,
    context: IContextNode
  ): Generator<IContextNode> {
    if (this.isTargetMet(target, context)) {
      yield context
    }

    for (const child of context.children) {
      yield* this.findContextsByTarget(target, child)
    }
  }

  static findContextByTarget(
    target: Target | TransferableContext,
    context: IContextNode
  ): IContextNode | null {
    for (const ctx of this.findContextsByTarget(target, context)) {
      return ctx
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

    // for TransferableContext
    if ('id' in target && target.id !== context.id) {
      return false
    }

    // for Target
    if ('if' in target && !this._areConditionsMet(target.if, context.parsedContext)) {
      return false
    }

    // for Target
    if ('isVisible' in target && target.isVisible !== context.isVisible) {
      return false
    }

    // ToDo: disabled
    // for TransferableContext
    // if ('parsed' in target && !isDeepEqual(target.parsed, context.parsedContext)) {
    //   return false
    // }

    if (
      target.parent &&
      (!context.parentNode || !this.isTargetMet(target.parent, context.parentNode))
    ) {
      return false
    }

    return true
  }

  static getRootContext(context: IContextNode): IContextNode {
    return context.parentNode ? this.getRootContext(context.parentNode) : context
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
