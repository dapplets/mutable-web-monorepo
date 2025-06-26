import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectBot } from 'nestjs-telegraf';
import { NftMintedEvent } from 'src/capability/nft-minted.event';
import { TelegrafContext } from 'src/common/telegraf-context.interface';
import { RewardFailedEvent } from 'src/reward/reward-failed.event';
import { RewardSucceedEvent } from 'src/reward/reward-succeed.event';
import { Telegraf } from 'telegraf';

@Injectable()
export class MonitorService {
  private readonly logger = new Logger(MonitorService.name);

  constructor(
    private configService: ConfigService,
    @InjectBot() private bot: Telegraf<TelegrafContext>,
  ) {}

  async notify(message: string) {
    const chatId = this.configService.get<string | null>(
      'TELEGRAM_MONITORING_CHAT_ID',
    )!;
    const topicId = this.configService.get<string | null>(
      'TELEGRAM_MONITORING_TOPIC_ID',
    )!;

    if (!chatId) {
      this.logger.warn(
        'Monitoring chat is disabled. Set TELEGRAM_MONITORING_CHAT_ID and TELEGRAM_MONITORING_TOPIC_ID to enable.',
      );
      return;
    }

    await this.bot.telegram.sendMessage(chatId, message, {
      message_thread_id: topicId ? Number(topicId) : undefined,
    });
  }

  @OnEvent('capability.minted')
  async handleNftMinted(event: NftMintedEvent) {
    // ToDo: human readable caller id
    await this.notify(
      `New NFT minted: https://nearblocks.io/nft-token/${event.contractId}/${event.tokenId}\nCaller: @${event.userId}`,
    );
  }

  @OnEvent('reward.succeed')
  async handleRewardSuccess(event: RewardSucceedEvent) {
    // ToDo: different reward reasons
    // ToDo: notify caller also
    // ToDo: human readable caller id
    await this.notify(
      `NEAR account ${event.beneficiaryAccountId} rewarded\n` +
        `Tx: https://nearblocks.io/txns/${event.txHash} \n` +
        `Caller: @${event.callerUserId}`,
    );
  }

  @OnEvent('reward.failed')
  async handleRewardFailed(event: RewardFailedEvent) {
    // ToDo: different reward reasons
    // ToDo: human readable caller id
    await this.notify(
      `Cannot reward ${event.beneficiaryAccountId}\n` +
        `Caller: @${event.callerUserId}\n`,
    );
  }
}
