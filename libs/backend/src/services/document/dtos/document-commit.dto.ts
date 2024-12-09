import { AppId } from '../../application/application.entity'
import { BaseDto } from '../../base/base.dto'
import { DocumentMetadata } from '../document.entity'

export type DocumentCommitDto = BaseDto & {
  metadata: DocumentMetadata
  openWith: AppId[]
  content: any
}
