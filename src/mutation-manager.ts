import { IContextNode } from "./core/tree/types";
import {
  AppId,
  AppMetadata,
  AppMetadataTarget,
  BosUserLink,
  IProvider,
  LinkIndexObject,
  Mutation,
  MutationId,
  ScalarType,
  TargetCondition,
  UserLinkId,
} from "./providers/provider";

export class MutationManager {
  public mutation: Mutation | null = null;

  #provider: IProvider;
  #activeApps: AppMetadata[] = [];

  constructor(provider: IProvider) {
    this.#provider = provider;
  }

  // #region Read methods

  async filterSuitableApps(context: IContextNode): Promise<AppMetadata[]> {
    const suitableApps: AppMetadata[] = [];

    for (const app of this.#activeApps) {
      const suitableTargets = app.targets.filter((target) =>
        MutationManager._isTargetMet(target, context)
      );

      if (suitableTargets.length > 0) {
        suitableApps.push({ ...app, targets: suitableTargets });
      }
    }

    return suitableApps;
  }

  async getLinksForContext(context: IContextNode): Promise<BosUserLink[]> {
    const promises: Promise<BosUserLink[]>[] = [];

    for (const app of this.#activeApps) {
      if (!app) continue;

      const suitableTargets = app.targets.filter((target) =>
        MutationManager._isTargetMet(target, context)
      );

      if (!suitableTargets.length) continue;

      // ToDo: batch requests
      suitableTargets.forEach((target) => {
        promises.push(this._getUserLinksForTarget(app.id, target, context));
      });
    }

    const appLinksNested = await Promise.all(promises);

    return appLinksNested.flat(2);
  }

  // #endregion

  // #region Write methods

  async switchMutation(mutationId: string): Promise<void> {
    const mutation = await this.#provider.getMutation(mutationId);
    if (!mutation) throw new Error("Mutation doesn't exist");

    const apps = await Promise.all(
      mutation.apps.map((app) => this.#provider.getApplication(app))
    );

    this.#activeApps = apps.flatMap((app) => (app ? [app] : [])); // filter empty apps
    this.mutation = mutation;

    console.log("Active apps: ", mutation.apps);
  }

  async createLink(
    appGlobalId: AppId,
    context: IContextNode
  ): Promise<BosUserLink> {
    if (!this.mutation) {
      throw new Error("Mutation is not loaded");
    }

    const app = this.#activeApps.find((app) => app.id === appGlobalId);

    if (!app) {
      throw new Error("App is not active");
    }

    const suitableTargets = app.targets.filter((target) =>
      MutationManager._isTargetMet(target, context)
    );

    if (suitableTargets.length === 0) {
      throw new Error("No suitable targets found");
    }

    if (suitableTargets.length > 1) {
      throw new Error("More than one suitable targets found");
    }

    const [target] = suitableTargets;

    const indexObject = MutationManager._buildLinkIndex(
      app.id,
      this.mutation.id,
      target,
      context
    );

    const indexedLink = await this.#provider.createLink(indexObject);

    return {
      id: indexedLink.id,
      namespace: target.namespace,
      authorId: indexedLink.authorId,
      bosWidgetId: target.componentId,
      insertionPoint: target.injectTo,
    };
  }

  async deleteUserLink(userLinkId: UserLinkId): Promise<void> {
    return this.#provider.deleteUserLink(userLinkId);
  }

  // #endregion

  // #region Private

  private async _getUserLinksForTarget(
    appId: string,
    target: AppMetadataTarget,
    context: IContextNode
  ): Promise<BosUserLink[]> {
    if (!this.mutation) throw new Error("Mutation is not loaded");

    const indexObject = MutationManager._buildLinkIndex(
      appId,
      this.mutation.id,
      target,
      context
    );

    const indexedLinks = await this.#provider.getLinksByIndex(indexObject);

    return indexedLinks.map((link) => ({
      id: link.id,
      authorId: link.authorId,
      namespace: target.namespace,
      bosWidgetId: target.componentId, // ToDo: unify
      insertionPoint: target.injectTo, // ToDo: unify
    }));
  }

  // #endregion

  // #region Utils

  static _buildLinkIndex(
    appId: AppId,
    mutationId: MutationId,
    target: AppMetadataTarget,
    context: IContextNode
  ): LinkIndexObject {
    const indexedContextData = this._buildIndexedContextValues(
      target.if,
      context.parsedContext
    );

    return {
      appId,
      mutationId,
      namespace: target.namespace,
      contextType: target.contextType,
      if: indexedContextData,
    };
  }

  static _buildIndexedContextValues(
    conditions: Record<string, TargetCondition>,
    values: Record<string, ScalarType>
  ): Record<string, ScalarType> {
    const object: Record<string, ScalarType> = {};

    for (const property in conditions) {
      if (conditions[property].index) {
        object[property] = values[property];
      }
    }

    return object;
  }

  static _isTargetMet(
    target: Pick<AppMetadataTarget, "namespace" | "contextType" | "if">,
    context: Pick<IContextNode, "namespaceURI" | "tagName" | "parsedContext">
  ): boolean {
    // ToDo: check insertion points?
    return (
      target.namespace === context.namespaceURI &&
      target.contextType === context.tagName &&
      this._areConditionsMet(target.if, context.parsedContext)
    );
  }

  static _areConditionsMet(
    conditions: Record<string, TargetCondition>,
    values: Record<string, ScalarType>
  ): boolean {
    for (const property in conditions) {
      if (!this._isConditionMet(conditions[property], values[property])) {
        return false;
      }
    }

    return true;
  }

  static _isConditionMet(
    condition: TargetCondition,
    value: ScalarType
  ): boolean {
    const { not: _not, eq: _eq, contains: _contains, in: _in } = condition;

    if (_not !== undefined) {
      return _not !== value;
    }

    if (_eq !== undefined) {
      return _eq === value;
    }

    if (_contains !== undefined && typeof value === "string") {
      return value.includes(_contains);
    }

    if (_in !== undefined) {
      return _in.includes(value);
    }

    return false;
  }

  // #endregion
}
