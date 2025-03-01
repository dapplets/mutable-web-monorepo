import { Body, Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ContextService } from './context.service';
import {
  InvokeAgentDto,
  QuerySimilarContextDto,
  StoreContextDto,
} from './dtos/store-context.dto';

@Controller('context')
export class ContextController {
  constructor(private readonly contextService: ContextService) {}

  @Post()
  async storeContext(@Body() storeContextDto: StoreContextDto) {
    return this.contextService.storeContextForRewards(storeContextDto);
  }

  @Post('invoke-agent')
  async invokeAgent(@Body() invokeAgentDto: InvokeAgentDto) {
    return this.contextService.invokeAgent(invokeAgentDto);
  }

  @Get()
  async getContexts() {
    return this.contextService.getContexts();
  }

  @Post('similar')
  async getSimilarContexts(@Body() dto: QuerySimilarContextDto) {
    return this.contextService.getSimilarContexts(dto);
  }

  @Get(':hash(*)')
  async getContext(@Param('hash') hash: string) {
    return this.contextService.getPaidContext(hash);
  }
}
