#!/usr/bin/env node

import { Command } from 'commander'
import { CrawlerAgent } from './agent'
import { ConsoleLogger } from './utils/logger'

// Create a logger instance for consistent logging
const logger = new ConsoleLogger()

export const program = new Command()

program
  .name('mweb-crawler-agent')
  .description('Headless Crawler Agent for Mutable Web')
  .version('0.1.0')

program
  .command('start')
  .description('Start the crawler agent')
  .action(async () => {
    try {
      const agent = new CrawlerAgent()

      logger.info('The crawler agent is running...')

      while (true) {
        logger.info('Fetching...')
        await agent.run()
        await new Promise((resolve) => setTimeout(resolve, 5000))
      }
    } catch (error) {
      logger.error('Failed to start:', {
        message: error instanceof Error ? error.message : String(error),
      })
      process.exit(1)
    }
  })

// Only parse if this is the main module
if (require.main === module) {
  program.parse()
}
