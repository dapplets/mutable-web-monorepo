import { BosComponent } from "./bos/bos-widget";
import { ContextManager } from "./context-manager";
import { BosUserLink, UserLinkId } from "./providers/provider";

export interface LayoutManagerProps {
  context: any;
  contextType: string;
  widgets: {
    linkId: UserLinkId;
    linkAuthorId: string;
    src: string;
    props: any;
  }[];
  isEditMode: boolean;
  createUserLink: (bosWidgetId: string) => Promise<void>;
  deleteUserLink: (userLinkId: UserLinkId) => Promise<void>;
  enableEditMode: () => void;
  disableEditMode: () => void;
}

export class LayoutManager {
  #contextManager: ContextManager;
  #layoutManager: BosComponent;
  #userLinks: Map<UserLinkId, BosUserLink> = new Map();
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

    this._setProps({
      // ToDo: unify context forwarding
      context: context.parsedContext,
      contextType: context.tagName,
      widgets: links.map((link) => ({
        linkId: link.id,
        linkAuthorId: link.authorId,
        src: link.bosWidgetId,
        props: {
          context: context.parsedContext,
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

  _setProps(props: LayoutManagerProps) {
    this.#layoutManager.props = props;
  }

  // Widget API methods

  _createUserLink(bosWidgetId: string) {
    return this.#contextManager.createUserLink(bosWidgetId);
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
}
