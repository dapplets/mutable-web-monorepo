import { BaseCreateDto } from '../../base/base-create.dto'
import { AppId } from '../../application/application.entity'
import { DocumentMetadata } from '../document.entity'

export type DocumentCreateDto = BaseCreateDto & {
  metadata: DocumentMetadata
  openWith: AppId[]
}
