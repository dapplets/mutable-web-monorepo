import {
  AppId,
  ApplicationDto,
  BosUserLinkWithInstance,
  BuiltInLayoutManagers,
  ControllerLink,
  DocumentCommitDto,
  DocumentDto,
  EntityId,
  EntitySourceType,
  LinkedDataByAccountDto,
  LinkIndexRules,
  Target,
  TransferableContext,
  UserLinkId,
  utils,
} from '@mweb/backend'
import { IContextNode, InsertionPointWithElement } from '@mweb/core'
import { ContextPortal, ContextTree } from '@mweb/react'
import { Widget } from 'near-social-vm'
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { filterAndDiscriminate } from '../common/filter-and-discriminate'
import { memoize } from '../common/memoize'
import { buildTransferableContext } from '../common/transferable-context'
import { ShadowDomWrapper } from '../components/shadow-dom-wrapper'
import { useModal } from '../contexts/modal-context'
import { ModalProps } from '../contexts/modal-context/modal-context'
import { useMutableWeb } from '../contexts/mutable-web-context'
import { usePortal, Portal } from '../contexts/portal-context'
import { useDev } from '../contexts/dev-context'
import {
  useAppControllers,
  useCommitDocumentToMutation,
  useContextApps,
  useCreateUserLink,
  useDeleteUserLink,
  useSetPreferredSource,
  useUserLinks,
} from '@mweb/react-engine'

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
  commitDocument: (document: DocumentCommitDto) => Promise<DocumentDto>
  getDocument: (options?: {
    id?: EntityId
    source?: EntitySourceType
  }) => Promise<DocumentDto | null>
  deleteLocalDocument: () => Promise<void>
  getConnectedAccountsNet: (accountId: string, origin: string) => Promise<string[] | null>
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
  const { selectedMutation, isEngineLoading } = useMutableWeb()

  if (!selectedMutation || isEngineLoading) return null

  return <ContextTree children={ContextHandler} />
}

const ContextHandler: FC<{ context: IContextNode; insPoints: InsertionPointWithElement[] }> = ({
  context,
  insPoints,
}) => {
  const { engine, selectedMutation, activeApps, tree } = useMutableWeb()

  if (!selectedMutation) throw new Error('No selected mutation')
  if (!tree) throw new Error('Context tree is not initialized')

  const { setPreferredSource } = useSetPreferredSource()
  const { controllers } = useAppControllers(selectedMutation.id, context, activeApps)
  const { links } = useUserLinks(selectedMutation.id, context, activeApps)
  const { createUserLink } = useCreateUserLink(selectedMutation.id, context, activeApps)
  const { deleteUserLink } = useDeleteUserLink(selectedMutation.id, context, activeApps)
  const { commitDocumentToMutation } = useCommitDocumentToMutation()
  const { apps } = useContextApps(context, activeApps)
  const { portals } = usePortal()

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

          // ToDo: move to @mweb/react-engine
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

          // ToDo: move to @mweb/react-engine
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

  const _getCurrentDocumentId = useCallback(
    async (appInstanceId: string) => {
      if (!selectedMutation) throw new Error('No selected mutation')
      const appInstance = selectedMutation.apps.find(
        (app) => utils.constructAppInstanceId(app) === appInstanceId
      )
      if (!appInstance) throw new Error('The app is not active')

      if (!appInstance.documentId) return null

      return appInstance.documentId
    },
    [selectedMutation]
  )

  const handleGetDocumentCurry = useCallback(
    memoize(
      (appInstanceId: string) => async (options?: { id?: EntityId; source?: EntitySourceType }) => {
        // allow for _documentId to be passed in to check existence of document before creation
        const documentId = options?.id ?? (await _getCurrentDocumentId(appInstanceId))

        if (!documentId) return null

        // ToDo: local or remote?
        const document = await engine.documentService.getDocument(documentId, options?.source)

        return document
      }
    ),
    [engine, _getCurrentDocumentId]
  )

  const handleDeleteDocumentCurry = useCallback(
    memoize((appInstanceId: string) => async () => {
      // allow for _documentId to be passed in to check existence of document before creation
      const documentId = await _getCurrentDocumentId(appInstanceId)

      if (!documentId) {
        throw new Error('The running app does not contain a document')
      }

      // ToDo: delete document from mutation

      await engine.documentService.deleteLocalDocument(documentId)
    }),
    [engine, _getCurrentDocumentId]
  )

  const handleCommitDocumentCurry = useCallback(
    memoize(
      (appInstanceId: string) =>
        async (document: DocumentCommitDto): Promise<DocumentDto> => {
          if (!selectedMutation) throw new Error('No selected mutation')
          const appInstance = selectedMutation.apps.find(
            (app) => utils.constructAppInstanceId(app) === appInstanceId
          )
          if (!appInstance) throw new Error('The app is not active')
          if (!tree.id) throw new Error('No root context id')

          // ToDo: show fork dialog

          const { mutation, document: savedDocument } = await commitDocumentToMutation({
            mutationId: selectedMutation.id,
            appId: appInstance.appId,
            document,
          })

          // is mutation changed?
          if (mutation && mutation.id === selectedMutation.id) {
            setPreferredSource(mutation.id, tree.id, mutation.source)
          }

          return savedDocument
        }
    ),
    [engine, selectedMutation, tree]
  )

  const handleGetConnectedAccountsNet = useCallback(
    async (accountId: string, origin: string) =>
      engine.connectedAccountsService.getNet(`${accountId}/${origin}`),
    [engine]
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
          onDeleteDocumentCurry={handleDeleteDocumentCurry}
          onGetConnectedAccountsNet={handleGetConnectedAccountsNet}
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
        onDeleteDocumentCurry={handleDeleteDocumentCurry}
        onGetConnectedAccountsNet={handleGetConnectedAccountsNet}
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
          onDeleteDocumentCurry={handleDeleteDocumentCurry}
          onGetConnectedAccountsNet={handleGetConnectedAccountsNet}
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
  ) => (document: DocumentCommitDto) => Promise<DocumentDto>
  onGetDocumentCurry: (
    appInstanceId: string
  ) => (options?: { id?: EntityId; source?: EntitySourceType }) => Promise<DocumentDto | null>
  onDeleteDocumentCurry: (appInstanceId: string) => () => Promise<void>
  onGetConnectedAccountsNet: (accountId: string, origin: string) => Promise<string[] | null>
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
  onDeleteDocumentCurry,
  onGetConnectedAccountsNet,
}) => {
  const { redirectMap, isDevServerLoading } = useDev()
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
        deleteLocalDocument: onDeleteDocumentCurry(link.appInstanceId),
        getConnectedAccountsNet: onGetConnectedAccountsNet,
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
  ) => (document: DocumentCommitDto) => Promise<DocumentDto>
  onGetDocumentCurry: (
    appInstanceId: string
  ) => (options?: { id?: EntityId; source?: EntitySourceType }) => Promise<DocumentDto | null>
  onDeleteDocumentCurry: (appInstanceId: string) => () => Promise<void>
  onGetConnectedAccountsNet: (accountId: string, origin: string) => Promise<string[] | null>
}> = ({
  transferableContext,
  controller,
  onContextQuery,
  onGetLinkDataCurry,
  onSetLinkDataCurry,
  onCommitDocumentCurry,
  onGetDocumentCurry,
  onDeleteDocumentCurry,
  onGetConnectedAccountsNet,
}) => {
  const { redirectMap, isDevServerLoading } = useDev()
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
    deleteLocalDocument: onDeleteDocumentCurry(controller.appInstanceId),
    getConnectedAccountsNet: onGetConnectedAccountsNet,
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
