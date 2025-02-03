import { useQueryClient } from '@tanstack/react-query'
import { useEngine } from '../engine/use-engine'
import { useEffect } from 'react'
import { AppInstanceWithSettings, EntitySourceType, MutationDto } from '@mweb/backend'

export const useSubscriptions = () => {
  const { engine } = useEngine()
  const queryClient = useQueryClient()

  // ToDo: unify events
  // Backend emits events with changed entity to prevent refetching from the smart contract
  // Smart-contract state propagation takes time
  // Inspired by https://tkdodo.eu/blog/using-web-sockets-with-react-query#consuming-data
  useEffect(() => {
    const handleSaveMutation = (mut: MutationDto) => {
      queryClient.setQueryData(
        ['mutation', { mutationId: mut.id, source: mut.source, version: mut.version }],
        mut
      )
      queryClient.setQueryData(
        ['mutation', { mutationId: mut.id, source: mut.source, version: null }],
        mut
      )
      queryClient.setQueryData(
        ['mutation', { mutationId: mut.id, source: null, version: null }],
        mut
      )
      queryClient.setQueryData(
        ['mutation', { mutationId: mut.id, source: null, version: mut.version }],
        mut
      )
    }

    const subs = [
      engine.eventService.on('mutationCreated', ({ mutation }) => {
        // ToDo: potential bug: mutation will be added twice (see useCreateMutation hook)
        queryClient.setQueryData(['mutations'], (prev: MutationDto[]) =>
          prev ? [...prev, mutation] : undefined
        )
        handleSaveMutation(mutation)
      }),
      engine.eventService.on('mutationEdited', ({ mutation: editedMut }) => {
        queryClient.setQueryData(['mutations'], (prev: MutationDto[]) =>
          prev
            ? prev.map((mut) =>
                mut.id === editedMut.id && mut.source === editedMut.source ? editedMut : mut
              )
            : undefined
        )
        handleSaveMutation(editedMut)
      }),
      engine.eventService.on('mutationSaved', ({ mutation: savedMut }) => {
        queryClient.setQueryData(['mutations'], (prev: MutationDto[]) => {
          if (!prev) return undefined

          const existingMutationIndex = prev.findIndex(
            (mut) => mut.id === savedMut.id && mut.source === savedMut.source
          )

          if (existingMutationIndex === -1) {
            return [...prev, savedMut]
          } else {
            return prev.map((mut, i) => (i === existingMutationIndex ? savedMut : mut))
          }
        })
        handleSaveMutation(savedMut)
      }),
      engine.eventService.on('mutationDeleted', ({ mutationId }) => {
        queryClient.setQueryData(['mutations'], (prev: MutationDto[]) =>
          prev
            ? prev.filter(
                (mut) => !(mut.id === mutationId && mut.source === EntitySourceType.Local)
              )
            : undefined
        )
      }),
      engine.eventService.on('appEnabledStatusChanged', (event) => {
        queryClient.setQueryData(
          ['mutationApp', event.mutationId, event.appInstanceId],
          (app: AppInstanceWithSettings | undefined) =>
            app ? { ...app, settings: { ...app.settings, isEnabled: event.isEnabled } } : undefined
        )
      }),
      engine.eventService.on('favoriteMutationChanged', (event) => {
        queryClient.setQueryData(['favoriteMutationId', event.contextId], event.mutationId)
      }),
      engine.eventService.on('mutationVersionChanged', (event) => {
        queryClient.setQueryData(['selectedMutationVersion', event.mutationId], event.version)
      }),
      engine.eventService.on('mutationLastUsageChanged', (event) => {
        queryClient.setQueryData(
          ['mutationLastUsage', event.mutationId, event.contextId],
          event.value
        )
      }),
      engine.eventService.on('preferredSourceChanged', (event) => {
        queryClient.setQueryData(
          ['preferredSource', event.mutationId, event.contextId],
          event.source
        )
      }),
      engine.eventService.on('selectedMutationChanged', (event) => {
        queryClient.setQueryData(['selectedMutationId', event.contextId], event.mutationId)
      }),
    ]

    return () => subs.forEach((sub) => sub.remove())
  }, [engine, queryClient])
}
