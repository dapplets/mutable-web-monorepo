import { ModalProps, NotificationType } from '../modal-context/modal-context'

export const mutationSwitched = ({
  fromMutationId,
  toMutationId,
  onBack,
}: {
  fromMutationId: string
  toMutationId: string
  onBack: () => void
}): ModalProps => ({
  subject: 'Mutation Switched',
  body: `The mutation has been switched from ${fromMutationId} to ${toMutationId}`,
  type: NotificationType.Info,
  actions: [
    { label: 'Ok, got it', type: 'primary' },
    {
      label: `Turn back`,
      type: 'default',
      onClick: onBack,
    },
  ],
})

export const mutationDisabled = ({ onBack }: { onBack: () => void }): ModalProps => ({
  subject: 'Mutation Disabled',
  body: `You disabled all mutations`,
  type: NotificationType.Warning,
  actions: [
    { label: 'Ok, got it', type: 'primary' },
    {
      label: `Turn back`,
      type: 'default',
      onClick: onBack,
    },
  ],
})
