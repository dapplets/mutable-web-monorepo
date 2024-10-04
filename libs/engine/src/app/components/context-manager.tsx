import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ContextPortal } from '@mweb/react'
import { IContextNode, InsertionPointWithElement } from '@mweb/core'
import {
  BosUserLinkWithInstance,
  ControllerLink,
  UserLinkId,
  ApplicationDto,
  AppId,
  BuiltInLayoutManagers,
  TransferableContext,
  LinkedDataByAccountDto,
  LinkIndexRules,
  Target,
  DocumentId,
  DocumentMetadata,
  DocumentDto,
  utils,
} from '@mweb/backend'
import { useEngine } from '../contexts/engine-context'
import { useUserLinks } from '../contexts/mutable-web-context/use-user-links'
import { Widget } from 'near-social-vm'
import { ShadowDomWrapper } from '../components/shadow-dom-wrapper'
import { ContextTree } from '@mweb/react'
import { useContextApps } from '../contexts/mutable-web-context/use-context-apps'
import { useAppControllers } from '../contexts/mutable-web-context/use-app-controllers'
import { buildTransferableContext } from '../common/transferable-context'
import { useModal } from '../contexts/modal-context'
import { useMutableWeb } from '../contexts/mutable-web-context'
import { memoize } from '../common/memoize'
import { createPortal } from 'react-dom'
import { ModalProps } from '../contexts/modal-context/modal-context'
import { Portal } from '../contexts/engine-context/engine-context'
import { filterAndDiscriminate } from '../common/filter-and-discriminate'

interface WidgetProps {
  context: TransferableContext
  link?: {
    id: UserLinkId // Static link ID can also be here
    authorId: string
  }
  notify: (modalProps: ModalProps) => void
  query: (target: Target) => TransferableContext | null
  linkDb: {
    get: (
      ctx: TransferableContext,
      accountIds?: string[] | string,
      indexRules?: LinkIndexRules
    ) => Promise<LinkedDataByAccountDto>
    set: (
      ctx: TransferableContext,
      dataByAccount: LinkedDataByAccountDto,
      indexRules: LinkIndexRules
    ) => Promise<void>
  }
  commitDocument: (
    appDocId: DocumentId,
    appDocMeta: DocumentMetadata,
    ctx: TransferableContext,
    dataByAccount: LinkedDataByAccountDto
  ) => Promise<void>
  getDocument: () => Promise<DocumentDto | null>
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
  components: Portal[]
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
  const { engine, selectedMutation, refreshMutation, activeApps } = useMutableWeb()
  const { portals } = useEngine()

  const portalComponents = useMemo(() => {
    return Array.from(portals.values())
      .filter(({ target }) => utils.isTargetMet(target, context))
      .sort((a, b) => (b.key > a.key ? 1 : -1))
  }, [portals, context.parsedContext, context.isVisible])

  useEffect(() => {
    portalComponents.forEach(({ onContextStarted }) => {
      onContextStarted?.(context)
    })

    return () => {
      portalComponents.forEach(({ onContextFinished }) => {
        onContextFinished?.(context)
      })
    }
  }, [portalComponents])

  const [materializedComponents, nonMaterializedComponents] = useMemo(() => {
    return filterAndDiscriminate(portalComponents, (portal) => portal.inMemory)
  }, [portalComponents])

  const componentsByInsPoint = useMemo(() => {
    return insPoints.map((insPoint) =>
      materializedComponents.filter(({ target }) => target.injectTo === insPoint.name)
    )
  }, [insPoints, materializedComponents])

  const componentsForContextInsPoint = useMemo(() => {
    return materializedComponents.filter(({ target }) => target.injectTo === undefined)
  }, [materializedComponents])

  const [isEditMode, setIsEditMode] = useState(false)

  // ToDo: memoize
  const transferableContext = buildTransferableContext(context)

  // For OverlayTrigger
  const attachContextRef = useCallback(
    (callback: (r: React.Component | Element | null | undefined) => void) => {
      callback(context.element)
    },
    [context]
  )

  const handleContextQuery = useCallback(
    (target: Target): TransferableContext | null => {
      const rootContext = utils.getRootContext(context)
      const foundContext = utils.findContextByTarget(target, rootContext)
      return foundContext ? buildTransferableContext(foundContext) : null
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
      (appInstanceId: string) =>
        (ctx: TransferableContext, accountIds?: string[] | string, indexRules?: LinkIndexRules) => {
          if (!selectedMutation) throw new Error('No selected mutation')
          const appInstance = selectedMutation.apps.find(
            (app) => utils.constructAppInstanceId(app) === appInstanceId
          )
          if (!appInstance) throw new Error('The app is not active')

          return engine.linkDbService.get(
            selectedMutation.id,
            appInstance.appId,
            appInstance.documentId,
            ctx,
            accountIds,
            indexRules
          )
        }
    ),
    [engine, selectedMutation]
  )

  const handleSetLinkDataCurry = useCallback(
    memoize(
      (appInstanceId: string) =>
        (
          ctx: TransferableContext,
          dataByAccount: LinkedDataByAccountDto,
          indexRules: LinkIndexRules
        ) => {
          if (!selectedMutation) throw new Error('No selected mutation')
          const appInstance = selectedMutation.apps.find(
            (app) => utils.constructAppInstanceId(app) === appInstanceId
          )
          if (!appInstance) throw new Error('The app is not active')

          return engine.linkDbService.set(
            selectedMutation.id,
            appInstance.appId,
            appInstance.documentId,
            ctx,
            dataByAccount,
            indexRules
          )
        }
    ),
    [engine, selectedMutation]
  )

  const handleGetDocumentCurry = useCallback(
    memoize((appInstanceId: string) => async () => {
      if (!selectedMutation) throw new Error('No selected mutation')
      const appInstance = selectedMutation.apps.find(
        (app) => utils.constructAppInstanceId(app) === appInstanceId
      )
      if (!appInstance) throw new Error('The app is not active')

      if (!appInstance.documentId) return null

      const document = await engine.documentService.getDocument(appInstance.documentId)

      return document
    }),
    [engine, selectedMutation, refreshMutation]
  )

  const handleCommitDocumentCurry = useCallback(
    memoize(
      (appInstanceId: string) =>
        async (
          appDocId: DocumentId, // ToDo: remove
          appDocMeta: DocumentMetadata,
          ctx: TransferableContext,
          dataByAccount: LinkedDataByAccountDto
        ) => {
          if (!selectedMutation) throw new Error('No selected mutation')
          const appInstance = selectedMutation.apps.find(
            (app) => utils.constructAppInstanceId(app) === appInstanceId
          )
          if (!appInstance) throw new Error('The app is not active')

          // ToDo: replace with DocumentCreateDto
          const document: DocumentDto = {
            id: appDocId,
            authorId: appDocId.split('/')[0],
            localId: appDocId.split('/')[2],
            blockNumber: 0,
            timestamp: 0,
            metadata: appDocMeta,
            openWith: [appInstance.appId],
          }

          const { mutation } = await engine.documentService.createDocumentWithData(
            selectedMutation.id,
            appInstance.appId,
            document,
            ctx,
            dataByAccount
          )

          // ToDo: workaround to wait when blockchain changes will be propagated
          await new Promise((resolve) => setTimeout(resolve, 3000))

          await refreshMutation(mutation)
        }
    ),
    [engine, selectedMutation, refreshMutation]
  )

  // ToDo: check context.element

  return (
    <>
      {insPoints.map((ip, index) => (
        <InsPointHandler
          key={ip.name}
          element={ip.element}
          insPointName={ip.name}
          bosLayoutManager={ip.bosLayoutManager}
          context={context}
          transferableContext={transferableContext}
          allUserLinks={links}
          components={componentsByInsPoint[index]}
          apps={apps}
          isEditMode={isEditMode}
          onContextQuery={handleContextQuery}
          onCreateUserLink={createUserLink}
          onDeleteUserLink={deleteUserLink}
          onEnableEditMode={handleEnableEditMode}
          onDisableEditMode={handleDisableEditMode}
          onAttachContextRef={attachContextRef}
          onGetLinkDataCurry={handleGetLinkDataCurry}
          onSetLinkDataCurry={handleSetLinkDataCurry}
          onCommitDocumentCurry={handleCommitDocumentCurry}
          onGetDocumentCurry={handleGetDocumentCurry}
        />
      ))}

      {/* For OverlayTrigger */}
      <InsPointHandler
        element={context.element}
        context={context}
        transferableContext={transferableContext}
        allUserLinks={links}
        components={componentsForContextInsPoint}
        apps={apps}
        isEditMode={isEditMode}
        onContextQuery={handleContextQuery}
        onCreateUserLink={createUserLink}
        onDeleteUserLink={deleteUserLink}
        onEnableEditMode={handleEnableEditMode}
        onDisableEditMode={handleDisableEditMode}
        onAttachContextRef={attachContextRef}
        onGetLinkDataCurry={handleGetLinkDataCurry}
        onSetLinkDataCurry={handleSetLinkDataCurry}
        onCommitDocumentCurry={handleCommitDocumentCurry}
        onGetDocumentCurry={handleGetDocumentCurry}
      />

      {controllers.map((c) => (
        <ControllerHandler
          key={c.id}
          transferableContext={transferableContext}
          controller={c}
          onContextQuery={handleContextQuery}
          onGetLinkDataCurry={handleGetLinkDataCurry}
          onSetLinkDataCurry={handleSetLinkDataCurry}
          onCommitDocumentCurry={handleCommitDocumentCurry}
          onGetDocumentCurry={handleGetDocumentCurry}
        />
      ))}

      {nonMaterializedComponents.map((portal) => (
        <PortalRenderer
          key={portal.key}
          portal={portal}
          context={context}
          transferableContext={transferableContext}
          onAttachContextRef={attachContextRef}
        />
      ))}
    </>
  )
}

const InsPointHandler: FC<{
  insPointName?: string
  element: HTMLElement | null
  bosLayoutManager?: string
  context: IContextNode
  transferableContext: TransferableContext
  allUserLinks: BosUserLinkWithInstance[]
  components: Portal[]
  apps: ApplicationDto[]
  isEditMode: boolean
  onContextQuery: (target: Target) => TransferableContext | null
  onCreateUserLink: (appId: AppId) => Promise<void>
  onDeleteUserLink: (userLinkId: UserLinkId) => Promise<void>
  onEnableEditMode: () => void
  onDisableEditMode: () => void
  onAttachContextRef: (callback: (r: React.Component | Element | null | undefined) => void) => void
  onGetLinkDataCurry: (
    appInstanceId: string
  ) => (
    ctx: TransferableContext,
    accountIds?: string[] | string,
    indexRules?: LinkIndexRules
  ) => Promise<LinkedDataByAccountDto>
  onSetLinkDataCurry: (
    appInstanceId: string
  ) => (
    ctx: TransferableContext,
    dataByAccount: LinkedDataByAccountDto,
    indexRules: LinkIndexRules
  ) => Promise<void>
  onCommitDocumentCurry: (
    appInstanceId: string
  ) => (
    appDocId: DocumentId,
    appDocMetadata: DocumentMetadata,
    ctx: TransferableContext,
    dataByAccount: LinkedDataByAccountDto
  ) => Promise<void>
  onGetDocumentCurry: (appInstanceId: string) => () => Promise<DocumentDto | null>
}> = ({
  insPointName,
  element,
  bosLayoutManager,
  context,
  transferableContext,
  allUserLinks,
  components,
  apps,
  isEditMode,
  onContextQuery,
  onCreateUserLink,
  onDeleteUserLink,
  onEnableEditMode,
  onDisableEditMode,
  onAttachContextRef,
  onGetLinkDataCurry,
  onSetLinkDataCurry,
  onCommitDocumentCurry,
  onGetDocumentCurry,
}) => {
  const { redirectMap, isDevServerLoading } = useEngine()
  const { config, engine } = useMutableWeb()
  const { notify } = useModal()

  const attachInsPointRef = useCallback(
    (callback: (r: React.Component | Element | null | undefined) => void) => callback(element),
    [element]
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
          (target) => !target.static && utils.isTargetMet(target, context)
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
        query: onContextQuery,
        link: {
          id: link.id,
          authorId: link.authorId,
        },
        notify,
        linkDb: {
          // ToDo: which instance id should be used for user links?
          get: onGetLinkDataCurry(link.appInstanceId),
          set: onSetLinkDataCurry(link.appInstanceId),
        },
        commitDocument: onCommitDocumentCurry(link.appInstanceId),
        getDocument: onGetDocumentCurry(link.appInstanceId),
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
    <ContextPortal context={context} injectTo={insPointName}>
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
    </ContextPortal>
  )
}

/**
 * Executes a BOS widget in-memory without rendering it
 */
const ControllerHandler: FC<{
  transferableContext: TransferableContext
  controller: ControllerLink
  onContextQuery: (target: Target) => TransferableContext | null
  onGetLinkDataCurry: (
    appInstanceId: string
  ) => (
    ctx: TransferableContext,
    accountIds?: string[] | string,
    indexRules?: LinkIndexRules
  ) => Promise<LinkedDataByAccountDto>
  onSetLinkDataCurry: (
    appInstanceId: string
  ) => (
    ctx: TransferableContext,
    dataByAccount: LinkedDataByAccountDto,
    indexRules: LinkIndexRules
  ) => Promise<void>
  onCommitDocumentCurry: (
    appInstanceId: string
  ) => (
    appDocId: DocumentId,
    appDocMetadata: DocumentMetadata,
    ctx: TransferableContext,
    dataByAccount: LinkedDataByAccountDto
  ) => Promise<void>
  onGetDocumentCurry: (appInstanceId: string) => () => Promise<DocumentDto | null>
}> = ({
  transferableContext,
  controller,
  onContextQuery,
  onGetLinkDataCurry,
  onSetLinkDataCurry,
  onCommitDocumentCurry,
  onGetDocumentCurry,
}) => {
  const { redirectMap, isDevServerLoading } = useEngine()
  const { notify } = useModal()

  if (isDevServerLoading) {
    return null
  }

  const props: WidgetProps = {
    context: transferableContext,
    query: onContextQuery,
    notify,
    linkDb: {
      get: onGetLinkDataCurry(controller.appInstanceId),
      set: onSetLinkDataCurry(controller.appInstanceId),
    },
    commitDocument: onCommitDocumentCurry(controller.appInstanceId),
    getDocument: onGetDocumentCurry(controller.appInstanceId),
  }

  return (
    <InMemoryRenderer>
      <Widget src={controller.bosWidgetId} props={props} loading={<></>} config={{ redirectMap }} />
    </InMemoryRenderer>
  )
}

const InMemoryRenderer: FC<{ children: React.ReactNode }> = ({ children }) => {
  const portalRef = useRef<DocumentFragment | null>(null)

  if (!portalRef.current) {
    // A document fragment where BOS widget will be "rendered" to
    portalRef.current = document.createDocumentFragment()
  }

  return createPortal(children, portalRef.current)
}

const PortalRenderer: FC<{
  portal: Portal
  context: IContextNode
  transferableContext: TransferableContext
  onAttachContextRef: (callback: (r: React.Component | Element | null | undefined) => void) => void
}> = ({ portal, context, transferableContext, onAttachContextRef }) => {
  const { component: PortalComponent, target } = portal

  const attachInsPointRef = useCallback(
    (callback: (r: React.Component | Element | null | undefined) => void) => {
      const ip = context.insPoints.find((ip) => ip.name === target.injectTo)
      callback(ip ? ip.element : null)
    },
    [target, context]
  )

  if (!PortalComponent) return null

  return (
    <InMemoryRenderer>
      <PortalComponent
        context={transferableContext}
        attachContextRef={onAttachContextRef}
        attachInsPointRef={attachInsPointRef}
      />
    </InMemoryRenderer>
  )
}
