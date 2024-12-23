import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { ContextService } from './context.service';
import { StoreContextDto } from './dtos/store-context.dto';

@Controller('/context')
export class ContextController {
  constructor(private readonly contextService: ContextService) {}

  @Post()
  async storeContext(@Body() storeContextDto: StoreContextDto) {
    return await this.contextService.storeContext(storeContextDto);
  }

  @Get()
  async getContexts() {
    return this.contextService.getContexts();
  }

  @Get(':hash')
  async getContext(@Param() params: any) {
    return this.contextService.getContext(params.hash);
  }
}
