import { AppId } from '../../application/application.entity'
import { DocumentMetadata } from '../document.entity'
import { BaseDto } from '../../base/base.dto'

export type DocumentCommitDto = BaseDto & {
  metadata: DocumentMetadata
  openWith: AppId[]
  content: any
}
