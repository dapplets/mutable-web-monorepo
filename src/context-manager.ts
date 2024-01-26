import { BosWidgetFactory } from "./bos/bos-widget-factory";
import { IAdapter, InsertionType } from "./core/adapters/interface";
import { IContextNode } from "./core/tree/types";
import { LayoutManager } from "./layout-manager";
import { BosUserLink, IProvider, UserLinkId } from "./providers/provider";

const DefaultLayoutManager = "bos.dapplets.near/widget/DefaultLayoutManager";
const DefaultInsertionType: InsertionType = InsertionType.Before;

export type InsertionPointName = string;

export class ContextManager {
  public readonly context: IContextNode;

  #adapter: IAdapter;
  #widgetFactory: BosWidgetFactory;
  #layoutManagers: Map<InsertionPointName, LayoutManager> = new Map();
  #provider: IProvider;
  #userLinks: Map<UserLinkId, BosUserLink> = new Map();

  constructor(
    context: IContextNode,
    adapter: IAdapter,
    widgetFactory: BosWidgetFactory,
    provider: IProvider
  ) {
    this.context = context;
    this.#adapter = adapter;
    this.#widgetFactory = widgetFactory;
    this.#provider = provider;
  }

  forceUpdate() {
    this.#layoutManagers.forEach((layoutManager) => {
      layoutManager.forceUpdate();
    });
  }

  enableEditMode() {
    this.#layoutManagers.forEach((layoutManager) => {
      layoutManager.enableEditMode();
    });
  }

  disableEditMode() {
    this.#layoutManagers.forEach((layoutManager) => {
      layoutManager.disableEditMode();
    });
  }

  addUserLink(link: BosUserLink) {
    // Check if link is suitable for this context
    if (link.contextType && link.contextType !== this.context.tagName) return;
    if (link.contextId && link.contextId !== this.context.id) return;

    this.#userLinks.set(link.id, link); // save link for further layout managers

    this.#layoutManagers.get(link.insertionPoint)?.addUserLink(link);
  }

  removeUserLink(link: BosUserLink) {
    this.#userLinks.delete(link.id);
    this.#layoutManagers.get(link.insertionPoint)?.removeUserLink(link.id);
  }

  async createUserLink(bosWidgetId: string) {
    const context = this.context;

    const templates = await this.#provider.getLinkTemplates(bosWidgetId);

    const suitableTemplates = templates.filter((template) => {
      if (template.contextType !== context.tagName) return false;

      // ToDo: get rid of magic values
      // context id required
      if (template.contextId === "" && !context.id) return false;

      // template for specific context
      if (
        template.contextId !== undefined &&
        template.contextId !== null &&
        template.contextId !== "" &&
        context.id !== template.contextId
      ) {
        return false;
      }

      return true;
    });

    if (suitableTemplates.length === 0) {
      // ToDo: suggest user to select insertion point manually
      throw new Error("No link templates found");
    }

    // ToDo: suggest user to select insertion point manually
    const template = suitableTemplates[0];

    const createdLink = await this.#provider.createLink({
      namespace: context.namespaceURI!,
      contextType: context.tagName,
      contextId:
        template.contextId === null || template.contextId === undefined
          ? null
          : context.id, // ToDo: get rid of magic values
      insertionPoint: template.insertionPoint,
      bosWidgetId: bosWidgetId,
    });

    this.addUserLink(createdLink);
  }

  async deleteUserLink(userLink: BosUserLink) {
    await this.#provider.deleteUserLink({
      id: userLink.id,
      bosWidgetId: userLink.bosWidgetId,
    });

    this.removeUserLink(userLink);
  }

  injectLayoutManager(insPointName: string) {
    const insertionPoints = this.#adapter.getInsertionPoints(this.context);
    const insPoint = insertionPoints.find((ip) => ip.name === insPointName);

    if (!insPoint) {
      return;
    }

    const bosWidgetId = insPoint.bosLayoutManager ?? DefaultLayoutManager;
    const insertionType = insPoint.insertionType ?? DefaultInsertionType;
    const layoutManagerElement = this.#widgetFactory.createWidget(bosWidgetId);

    const layoutManager = new LayoutManager(layoutManagerElement, this);

    try {
      // Inject layout manager
      this.#adapter.injectElement(
        layoutManagerElement,
        this.context,
        insPoint.name,
        insertionType
      );

      this.#layoutManagers.set(insPoint.name, layoutManager);

      const suitableLinks = Array.from(this.#userLinks.values()).filter(
        (link) => link.insertionPoint === insPoint.name
      );

      // Add existing links to layout managers injected later (for lazy loading websites)
      suitableLinks.forEach((link) => layoutManager.addUserLink(link));
    } catch (err) {
      console.error(err);
    }
  }
}
