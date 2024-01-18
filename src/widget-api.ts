import { BosComponent } from "./bos/bos-widget";
import { IContextNode } from "./core/tree/types";
import { BosUserLink, IProvider } from "./providers/provider";

export class WidgetApi {
  #context: IContextNode;
  #insertionPoint: string;
  #provider: IProvider;
  #layoutManager: BosComponent;

  constructor(
    provider: IProvider,
    context: IContextNode,
    insertionPoint: string,
    layoutManager: BosComponent
  ) {
    this.#provider = provider;
    this.#context = context;
    this.#insertionPoint = insertionPoint;
    this.#layoutManager = layoutManager;
  }

  createUserLink = async (bosWidgetId: string) => {
    const templates = await this.#provider.getLinkTemplates(bosWidgetId);

    const suitableTemplates = templates.filter((template) => {
      if (template.contextType !== this.#context.tagName) return false;

      // ToDo: get rid of magic values
      // context id required
      if (template.contextId === "" && !this.#context.id) return false;

      // template for specific context
      if (
        template.contextId !== null &&
        template.contextId !== "" &&
        this.#context.id !== template.contextId
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

    const newLink: Omit<BosUserLink, "id"> = {
      namespace: this.#context.namespaceURI!,
      contextType: this.#context.tagName,
      contextId: template.contextId === null ? null : this.#context.id, // ToDo: get rid of magic values
      insertionPoint: template.insertionPoint,
      bosWidgetId: bosWidgetId,
    };

    await this.#provider.createLink(newLink);

    // Add new widget to the layout manager
    this.#layoutManager.props = {
      ...this.#layoutManager.props,
      widgets: [
        ...this.#layoutManager.props.widgets,
        { src: bosWidgetId, props: {} },
      ],
    };
  };

  deleteUserLink = async (bosWidgetId: string, userLinkId: string) => {
    await this.#provider.deleteUserLink({
      id: userLinkId,
      bosWidgetId: bosWidgetId,
    });

    // Remove widget from the layout manager
    this.#layoutManager.props = {
      ...this.#layoutManager.props,
      widgets: this.#layoutManager.props.widgets.filter(
        (widget: { src: string; props: any; linkId: string }) =>
          widget.linkId !== userLinkId
      ),
    };
  };
}
