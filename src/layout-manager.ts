import { BosComponent } from "./bos/bos-widget";
import { ContextManager } from "./context-manager";
import { IContextNode } from "./core/tree/types";
import {
  AppId,
  AppMetadata,
  BosUserLink,
  UserLinkId,
} from "./providers/provider";

export interface LayoutManagerProps {
  context: any;
  contextType: string;
  apps: { id: string }[];
  widgets: {
    linkId: UserLinkId;
    linkAuthorId: string;
    src: string;
    props: {
      context: ContextTreeProps;
      link: {
        id: UserLinkId;
        authorId: string;
      };
    };
  }[];
  isEditMode: boolean;
  createUserLink: (bosWidgetId: string) => Promise<void>;
  deleteUserLink: (userLinkId: UserLinkId) => Promise<void>;
  enableEditMode: () => void;
  disableEditMode: () => void;
}

interface ContextTreeProps {
  namespace: string | null;
  type: string;
  parsed: any;
  parent: ContextTreeProps | null;
}

export class LayoutManager {
  #contextManager: ContextManager;
  #layoutManager: BosComponent;
  #userLinks: Map<UserLinkId, BosUserLink> = new Map();
  #apps: Map<AppId, AppMetadata> = new Map();
  #isEditMode: boolean;

  constructor(layoutManager: BosComponent, contextManager: ContextManager) {
    this.#layoutManager = layoutManager;
    this.#contextManager = contextManager;
    this.#isEditMode = false;
    this.forceUpdate();
  }

  addUserLink(userLink: BosUserLink) {
    this.#userLinks.set(userLink.id, userLink);
    this.forceUpdate();
  }

  removeUserLink(userLinkId: UserLinkId) {
    this.#userLinks.delete(userLinkId);
    this.forceUpdate();
  }

  addAppMetadata(appMetadata: AppMetadata) {
    this.#apps.set(appMetadata.id, appMetadata);
    this.forceUpdate();
  }

  removeAppMetadata(globalAppId: AppId) {
    this.#apps.delete(globalAppId);
    this.forceUpdate();
  }

  enableEditMode() {
    this.#isEditMode = true;
    this.forceUpdate();
  }

  disableEditMode() {
    this.#isEditMode = false;
    this.forceUpdate();
  }

  forceUpdate() {
    const context = this.#contextManager.context;
    const links = Array.from(this.#userLinks.values());
    const apps = Array.from(this.#apps.values());

    this._setProps({
      // ToDo: unify context forwarding
      context: context.parsedContext,
      contextType: context.tagName,
      apps: apps.map((app) => ({
        id: app.id,
        componentId: app.targets[0]?.componentId, // ToDo: use app metadata instead of widget metadata
      })),
      widgets: links.map((link) => ({
        linkId: link.id,
        linkAuthorId: link.authorId,
        src: link.bosWidgetId,
        props: {
          context: LayoutManager._buildContextTree(context),
          link: {
            id: link.id,
            authorId: link.authorId,
          },
        }, // ToDo: add props
      })),
      isEditMode: this.#isEditMode,

      // ToDo: move functions to separate api namespace?
      createUserLink: this._createUserLink.bind(this),
      deleteUserLink: this._deleteUserLink.bind(this),
      enableEditMode: this._enableEditMode.bind(this),
      disableEditMode: this._disableEditMode.bind(this),
    });
  }

  destroy() {
    this.#layoutManager.remove();
  }

  _setProps(props: LayoutManagerProps) {
    this.#layoutManager.props = props;
  }

  // Widget API methods

  async _createUserLink(globalAppId: string): Promise<void> {
    return this.#contextManager.createUserLink(globalAppId);
  }

  _deleteUserLink(userLinkId: UserLinkId) {
    const userLink = this.#userLinks.get(userLinkId);
    if (!userLink) {
      throw new Error(`User link ${userLinkId} not found`);
    }
    return this.#contextManager.deleteUserLink(userLink);
  }

  _enableEditMode() {
    return this.#contextManager.enableEditMode();
  }

  _disableEditMode() {
    return this.#contextManager.disableEditMode();
  }

  // Utils

  // ToDo: maybe it's better to rename props in IContextNode?
  static _buildContextTree(context: IContextNode): ContextTreeProps {
    return {
      namespace: context.namespaceURI,
      type: context.tagName,
      parsed: context.parsedContext,
      parent: context.parentNode
        ? this._buildContextTree(context.parentNode)
        : null,
    };
  }
}
