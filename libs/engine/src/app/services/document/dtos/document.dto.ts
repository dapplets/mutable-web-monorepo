import { BaseDto } from '../../base/base.dto'
import { AppId } from '../../application/application.entity'
import { DocumentMetadata } from '../document.entity'

export type DocumentDto = BaseDto & {
  metadata: DocumentMetadata
  openWith: AppId[]
}
