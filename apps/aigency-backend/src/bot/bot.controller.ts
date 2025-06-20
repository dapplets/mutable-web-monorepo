import { Update, On, Message } from 'nestjs-telegraf';
import { UseFilters } from '@nestjs/common';
import { AllExceptionsFilter } from '../common/all-exceptions.filter';

@UseFilters(AllExceptionsFilter)
@Update()
export class BotController {
  constructor() {}

  @On('text')
  onMessage(@Message('text') text: string): string {
    return 'hello + ' + text;
  }
}
