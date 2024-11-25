import { AppId } from '../../application/application.entity'
import { BaseDto } from '../../base/base.dto'
import { DocumentMetadata } from '../document.entity'

export type DocumentDto = BaseDto & {
  metadata: DocumentMetadata
  openWith: AppId[]
  content: any
}
