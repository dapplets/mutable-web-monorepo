import { Body, Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ContextService } from './context.service';
import { StoreContextDto } from './dtos/store-context.dto';

@Controller('context')
export class ContextController {
  constructor(private readonly contextService: ContextService) {}

  @Post()
  async storeContext(@Body() storeContextDto: StoreContextDto) {
    return this.contextService.storeContext(storeContextDto);
  }

  @Get()
  async getContexts() {
    return this.contextService.getContexts();
  }

  @Get('similar')
  async getSimilarContexts(
    @Query('query') query: string,
    @Query('limit') limit: number,
  ) {
    return this.contextService.getSimilarContexts(query, limit);
  }

  @Get(':hash(*)')
  async getContext(@Param('hash') hash: string) {
    return this.contextService.getPaidContext(hash);
  }
}
