import React from "react";
import {
  MiniOverlay,
  AppSwitcher,
  useMutableWeb,
  useMutationApp,
} from "mutable-web-engine";

function AppSwitcherContainer({ app }) {
  // ToDo: move to mutable-web-engine
  const { enableApp, disableApp, isLoading } = useMutationApp(app.id);
  return (
    <AppSwitcher
      app={app}
      enableApp={enableApp}
      disableApp={disableApp}
      isLoading={isLoading}
    />
  );
}

function MutableOverlayContainer() {
  // ToDo: move to mutable-web-engine
  const { selectedMutation, mutationApps } = useMutableWeb();
  return (
    <MiniOverlay baseMutation={selectedMutation} mutationApps={mutationApps}>
      {mutationApps.map((app) => (
        <AppSwitcherContainer key={app.id} app={app} />
      ))}
    </MiniOverlay>
  );
}

export default MutableOverlayContainer;
