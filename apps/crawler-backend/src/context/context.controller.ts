import { Body, Controller, Get, Post } from '@nestjs/common';
import { ContextService } from './context.service';
import { StoreContextDto } from './dtos/store-context.dto';

@Controller('/context')
export class ContextController {
  constructor(private readonly contextService: ContextService) {}

  @Post()
  async storeContext(@Body() storeContextDto: StoreContextDto) {
    await this.contextService.storeContext(storeContextDto);
  }

  @Get()
  async getContexts() {
    return this.contextService.getContexts();
  }
}
