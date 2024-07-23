import React, { FC, useCallback, useMemo, useRef, useState } from 'react'
import { ContextPortal } from '@mweb/react'
import { IContextNode, InsertionPointWithElement } from '@mweb/core'
import { useEngine } from '../contexts/engine-context'
import { useUserLinks } from '../contexts/mutable-web-context/use-user-links'
import { Widget } from 'near-social-vm'
import { usePortalFilter } from '../contexts/engine-context/use-portal-filter'
import { ShadowDomWrapper } from '../components/shadow-dom-wrapper'
import { ContextTree } from '@mweb/react'
import { useContextApps } from '../contexts/mutable-web-context/use-context-apps'
import { useAppControllers } from '../contexts/mutable-web-context/use-app-controllers'
import { AppId, AppMetadata } from '../services/application/application.entity'
import { BosUserLink, ControllerLink, UserLinkId } from '../services/user-link/user-link.entity'
import { TransferableContext, buildTransferableContext } from '../common/transferable-context'
import { useModal } from '../contexts/modal-context'
import { useMutableWeb } from '../contexts/mutable-web-context'
import { BuiltInLayoutManagers } from '../../constants'
import { TargetService } from '../services/target/target.service'
import { LinkedDataByAccount, LinkIndexRules } from '../services/link-db/link-db.entity'
import { memoize } from '../common/memoize'
import { createPortal } from 'react-dom'
import { ModalProps } from '../contexts/modal-context/modal-context'
import { InjectableTarget } from '../contexts/engine-context/engine-context'

interface WidgetProps {
  context: TransferableContext
  link?: {
    id: UserLinkId // Static link ID can also be here
    authorId: string
  }
  notify: (modalProps: ModalProps) => void
  linkDb: {
    get: (
      ctx: TransferableContext,
      accountIds?: string[] | string,
      indexRules?: LinkIndexRules
    ) => Promise<LinkedDataByAccount>
    set: (
      ctx: TransferableContext,
      dataByAccount: LinkedDataByAccount,
      indexRules: LinkIndexRules
    ) => Promise<void>
  }
}

interface LayoutManagerProps {
  context: TransferableContext
  apps: {
    id: string
    metadata: {
      name?: string
      description?: string
      image?: {
        ipfs_cid?: string
      }
    }
  }[]
  widgets: {
    linkId: UserLinkId // Static link ID can also be here
    linkAuthorId: string
    static: boolean
    src: string
    props: WidgetProps
    isSuitable: boolean
  }[]
  components: {
    key: string
    target: InjectableTarget
    component: React.FC<unknown>
  }[]
  isEditMode: boolean
  createUserLink: (appId: AppId) => Promise<void>
  deleteUserLink: (userLinkId: UserLinkId) => Promise<void>
  enableEditMode: () => void
  disableEditMode: () => void
  attachContextRef: (callback: (r: React.Component | Element | null | undefined) => void) => void
  attachInsPointRef: (callback: (r: React.Component | Element | null | undefined) => void) => void
  notify: (modalProps: ModalProps) => void
}

export const ContextManager: FC = () => {
  return <ContextTree children={ContextHandler} />
}

const ContextHandler: FC<{ context: IContextNode; insPoints: InsertionPointWithElement[] }> = ({
  context,
  insPoints,
}) => {
  const { controllers } = useAppControllers(context)
  const { links, createUserLink, deleteUserLink } = useUserLinks(context)
  const { apps } = useContextApps(context)
  const { engine, selectedMutation } = useMutableWeb()

  const [isEditMode, setIsEditMode] = useState(false)

  const transferableContext = useMemo(() => buildTransferableContext(context), [context])

  // For OverlayTrigger
  const attachContextRef = useCallback(
    (callback: (r: React.Component | Element | null | undefined) => void) => {
      callback(context.element)
    },
    [context]
  )

  const handleEnableEditMode = useCallback(() => {
    setIsEditMode(true)
  }, [setIsEditMode])

  const handleDisableEditMode = useCallback(() => {
    setIsEditMode(false)
  }, [setIsEditMode])

  // These handlers are memoized to prevent unnecessary rerenders
  // Move to a separate hook when App wrapper is ready
  const handleGetLinkDataCurry = useCallback(
    memoize(
      (appId: AppId) =>
        (ctx: TransferableContext, accountIds?: string[] | string, indexRules?: LinkIndexRules) => {
          if (!selectedMutation) throw new Error('No selected mutation')
          return engine.linkDbService.get(selectedMutation.id, appId, ctx, accountIds, indexRules)
        }
    ),
    [engine, selectedMutation]
  )

  const handleSetLinkDataCurry = useCallback(
    memoize(
      (appId: AppId) =>
        (
          ctx: TransferableContext,
          dataByAccount: LinkedDataByAccount,
          indexRules: LinkIndexRules
        ) => {
          if (!selectedMutation) throw new Error('No selected mutation')
          return engine.linkDbService.set(
            selectedMutation.id,
            appId,
            ctx,
            dataByAccount,
            indexRules
          )
        }
    ),
    [engine, selectedMutation]
  )

  return (
    <>
      {insPoints.map((ip) => (
        <ContextPortal key={ip.name} context={context} injectTo={ip.name}>
          <InsPointHandler
            insPointName={ip.name}
            bosLayoutManager={ip.bosLayoutManager}
            context={context}
            transferableContext={transferableContext}
            allUserLinks={links}
            apps={apps}
            isEditMode={isEditMode}
            onCreateUserLink={createUserLink}
            onDeleteUserLink={deleteUserLink}
            onEnableEditMode={handleEnableEditMode}
            onDisableEditMode={handleDisableEditMode}
            onAttachContextRef={attachContextRef}
            onGetLinkDataCurry={handleGetLinkDataCurry}
            onSetLinkDataCurry={handleSetLinkDataCurry}
          />
        </ContextPortal>
      ))}
      {/* For OverlayTrigger */}
      <ContextPortal context={context}>
        <InsPointHandler
          context={context}
          transferableContext={transferableContext}
          allUserLinks={links}
          apps={apps}
          isEditMode={isEditMode}
          onCreateUserLink={createUserLink}
          onDeleteUserLink={deleteUserLink}
          onEnableEditMode={handleEnableEditMode}
          onDisableEditMode={handleDisableEditMode}
          onAttachContextRef={attachContextRef}
          onGetLinkDataCurry={handleGetLinkDataCurry}
          onSetLinkDataCurry={handleSetLinkDataCurry}
        />
      </ContextPortal>

      {controllers.map((c) => (
        <ControllerHandler
          key={c.id}
          transferableContext={transferableContext}
          controller={c}
          onGetLinkDataCurry={handleGetLinkDataCurry}
          onSetLinkDataCurry={handleSetLinkDataCurry}
        />
      ))}
    </>
  )
}

const InsPointHandler: FC<{
  insPointName?: string
  bosLayoutManager?: string
  context: IContextNode
  transferableContext: TransferableContext
  allUserLinks: BosUserLink[]
  apps: AppMetadata[]
  isEditMode: boolean
  onCreateUserLink: (appId: AppId) => Promise<void>
  onDeleteUserLink: (userLinkId: UserLinkId) => Promise<void>
  onEnableEditMode: () => void
  onDisableEditMode: () => void
  onAttachContextRef: (callback: (r: React.Component | Element | null | undefined) => void) => void
  onGetLinkDataCurry: (
    appId: string
  ) => (
    ctx: TransferableContext,
    accountIds?: string[] | string,
    indexRules?: LinkIndexRules
  ) => Promise<LinkedDataByAccount>
  onSetLinkDataCurry: (
    appId: string
  ) => (
    ctx: TransferableContext,
    dataByAccount: LinkedDataByAccount,
    indexRules: LinkIndexRules
  ) => Promise<void>
}> = ({
  insPointName,
  bosLayoutManager,
  context,
  transferableContext,
  allUserLinks,
  apps,
  isEditMode,
  onCreateUserLink,
  onDeleteUserLink,
  onEnableEditMode,
  onDisableEditMode,
  onAttachContextRef,
  onGetLinkDataCurry,
  onSetLinkDataCurry,
}) => {
  const { redirectMap, isDevServerLoading } = useEngine()
  const { config, engine } = useMutableWeb()
  const { components } = usePortalFilter(context, insPointName) // ToDo: extract to the separate AppManager component
  const { notify } = useModal()

  const attachInsPointRef = useCallback(
    (callback: (r: React.Component | Element | null | undefined) => void) => {
      // ToDo: the similar logic is used in ContextPortal
      const targetElement = insPointName
        ? context.insPoints.find((ip) => ip.name === insPointName)?.element
        : context.element

      callback(targetElement)
    },
    [context, insPointName]
  )

  // prevents blinking
  if (isDevServerLoading) {
    return null
  }

  const layoutManagerId = bosLayoutManager
    ? config.layoutManagers[bosLayoutManager as keyof BuiltInLayoutManagers] ?? bosLayoutManager
    : config.layoutManagers.horizontal

  // Don't render layout manager if there are no components
  // It improves performance
  if (
    components.length === 0 &&
    !allUserLinks.some((link) => link.insertionPoint === insPointName) &&
    layoutManagerId !== config.layoutManagers.ear // ToDo: hardcode
  ) {
    return null
  }

  // ToDo: extract App specific links to the separate AppManager component

  const props: LayoutManagerProps = {
    // ToDo: unify context forwarding
    context: transferableContext,
    apps: apps
      .filter((app) => {
        const suitableNonStaticTargets = app.targets.filter(
          (target) => !target.static && TargetService.isTargetMet(target, context)
        )

        if (suitableNonStaticTargets.length === 0) {
          return false
        }

        if (suitableNonStaticTargets.some((target) => !target.injectOnce)) {
          return true
        }

        const injectedWidgets = allUserLinks.filter((link) => link.appId === app.id)

        // ToDo: the similar logic is used in createLink
        const isThereInjectedWidgets = suitableNonStaticTargets
          .filter((target) => target.injectOnce)
          .some((target) => injectedWidgets.some((link) => link.insertionPoint === target.injectTo))

        return !isThereInjectedWidgets
      })
      .map((app) => ({
        id: app.id,
        metadata: app.metadata,
      })),
    widgets: allUserLinks.map((link) => ({
      linkId: link.id,
      linkAuthorId: link.authorId,
      static: link.static,
      src: link.bosWidgetId,
      props: {
        context: transferableContext,
        link: {
          id: link.id,
          authorId: link.authorId,
        },
        notify,
        linkDb: {
          get: onGetLinkDataCurry(link.appId),
          set: onSetLinkDataCurry(link.appId),
        },
      }, // ToDo: add props
      isSuitable: link.insertionPoint === insPointName, // ToDo: LM know about widgets from other LM
    })),
    components: components,
    isEditMode: isEditMode,

    // ToDo: move functions to separate api namespace?
    createUserLink: onCreateUserLink,
    deleteUserLink: onDeleteUserLink,
    enableEditMode: onEnableEditMode,
    disableEditMode: onDisableEditMode,

    // For OverlayTrigger
    attachContextRef: onAttachContextRef,
    attachInsPointRef,

    notify,
  }

  // ToDo: hardcode. The ear should be positioned relative to the contexts.
  // Inside of BOS-components impossible to set :host styles
  const shadowDomHostStyles: React.CSSProperties | undefined =
    config.layoutManagers.ear === layoutManagerId ? { position: 'relative' } : undefined

  return (
    <ShadowDomWrapper
      className="mweb-layout-manager"
      style={shadowDomHostStyles}
      stylesheetSrc={engine.config.bosElementStyleSrc}
    >
      <Widget
        src={layoutManagerId ?? config.layoutManagers.horizontal}
        props={props}
        loading={<></>}
        config={{ redirectMap }}
      />
    </ShadowDomWrapper>
  )
}

/**
 * Executes a BOS widget in-memory without rendering it
 */
const ControllerHandler: FC<{
  transferableContext: TransferableContext
  controller: ControllerLink
  onGetLinkDataCurry: (
    appId: string
  ) => (
    ctx: TransferableContext,
    accountIds?: string[] | string,
    indexRules?: LinkIndexRules
  ) => Promise<LinkedDataByAccount>
  onSetLinkDataCurry: (
    appId: string
  ) => (
    ctx: TransferableContext,
    dataByAccount: LinkedDataByAccount,
    indexRules: LinkIndexRules
  ) => Promise<void>
}> = ({ transferableContext, controller, onGetLinkDataCurry, onSetLinkDataCurry }) => {
  const { redirectMap, isDevServerLoading } = useEngine()
  const portalRef = useRef<DocumentFragment | null>(null)
  const { notify } = useModal()

  if (!portalRef.current) {
    // A document fragment where BOS widget will be "rendered" to
    portalRef.current = document.createDocumentFragment()
  }

  if (isDevServerLoading) {
    return null
  }

  const props: WidgetProps = {
    context: transferableContext,
    notify,
    linkDb: {
      get: onGetLinkDataCurry(controller.appId),
      set: onSetLinkDataCurry(controller.appId),
    },
  }

  return createPortal(
    <Widget src={controller.bosWidgetId} props={props} loading={<></>} config={{ redirectMap }} />,
    portalRef.current
  )
}
