import * as React from "react";
import * as ReactDOM from "react-dom";
import { StyleSheetManager } from "styled-components";

const BootstrapCssUrl =
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
const BootstrapIconsUrl =
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";

export interface OverlayProps {
  children: React.ReactNode;
}

export const Overlay: React.FC<OverlayProps> = ({ children }) => {
  const [{ overlay, container, stylesMountPoint, bootstrapLightDomIcons }] =
    React.useState(() => {
      const overlay = document.createElement("mutable-web-overlay");

      overlay.style.background = "#000000aa";
      overlay.style.position = "fixed";
      // overlay.style.display = "none";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.overflowX = "hidden";
      overlay.style.overflowY = "auto";
      overlay.style.outline = "0";
      overlay.style.fontFamily =
        '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';
      overlay.style.zIndex = "2147483647";

      const shadowRoot = overlay.attachShadow({ mode: "closed" });
      const stylesMountPoint = document.createElement("div");
      const container = document.createElement("div");
      shadowRoot.appendChild(stylesMountPoint);

      // It will prevent inheritance without affecting other CSS defined within the ShadowDOM.
      // https://stackoverflow.com/a/68062098
      const disableCssInheritanceStyle = document.createElement("style");
      disableCssInheritanceStyle.innerHTML = ":host { all: initial; }";
      shadowRoot.appendChild(disableCssInheritanceStyle);

      // Bootstrap styles
      // ToDo: don't use CDN
      const bootstrapStyles = document.createElement("link");
      bootstrapStyles.rel = "stylesheet";
      bootstrapStyles.href = BootstrapCssUrl;
      shadowRoot.appendChild(bootstrapStyles);

      // Bootstrap Icons
      // ToDo: don't use CDN
      const bootstrapIcons = document.createElement("link");
      bootstrapIcons.rel = "stylesheet";
      bootstrapIcons.href = BootstrapIconsUrl;
      shadowRoot.appendChild(bootstrapIcons);

      const bootstrapLightDomIcons = bootstrapIcons.cloneNode();

      shadowRoot.appendChild(container);

      return { overlay, container, stylesMountPoint, bootstrapLightDomIcons };
    });

  React.useEffect(() => {
    document.body.appendChild(overlay);
    document.head.appendChild(bootstrapLightDomIcons);
    return () => {
      document.body.removeChild(overlay);
      document.head.removeChild(bootstrapLightDomIcons);
    };
  }, [overlay]);

  return ReactDOM.createPortal(
    <StyleSheetManager target={stylesMountPoint}>{children}</StyleSheetManager>,
    container
  );
};
