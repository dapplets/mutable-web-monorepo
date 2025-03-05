import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Order, Job, Step } from './entities/order.entity';
import { CronJob } from 'cron';
import { SchedulerService } from 'src/scheduler/scheduler.service';
import { ContextService } from 'src/context/context.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService implements OnModuleInit {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,

    @InjectRepository(Job)
    private jobsRepository: Repository<Job>,

    @Inject(SchedulerRegistry)
    private schedulerRegistry: SchedulerRegistry,

    @Inject(SchedulerService)
    private schedulerService: SchedulerService,

    @Inject(ContextService)
    private contextService: ContextService,
  ) {}

  async onModuleInit() {
    await this.loadScheduledJobs();
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = await this.ordersRepository.save(createOrderDto);

    for (const job of order.jobs) {
      this.scheduleJob(job);
    }

    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['jobs', 'jobs.steps'],
    });
  }

  async findOne(id: string): Promise<Order | null> {
    return this.ordersRepository.findOne({
      where: { id },
      relations: ['jobs', 'jobs.steps'],
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const existingOrder = await this.findOne(id);
    if (!existingOrder) {
      return null;
    }
    const updatedOrder = this.ordersRepository.merge(
      existingOrder,
      updateOrderDto,
    );
    const savedOrder = await this.ordersRepository.save(updatedOrder);

    for (const job of savedOrder.jobs) {
      this.scheduleJob(job);
    }

    return savedOrder;
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    if (order) {
      for (const job of order.jobs) {
        this.removeJob(job.id);
      }
    }
    await this.ordersRepository.delete(id);
  }

  private async loadScheduledJobs() {
    const jobs = await this.jobsRepository.find({ relations: ['steps'] });
    jobs.forEach((job) => this.scheduleJob(job));
  }

  private scheduleJob(job: Job) {
    if (this.schedulerRegistry.doesExist('cron', job.id)) {
      this.schedulerRegistry.deleteCronJob(job.id);
    }

    const cronJob = new CronJob(job.schedule, async () => {
      console.log(`Executing Job ${job.id}`);

      for (const step of job.steps) {
        console.log(`Processing Step ${step.id}: ${step.url}`);

        await this.processStep(step);
      }
    });

    this.schedulerRegistry.addCronJob(job.id, cronJob);
    cronJob.start();
  }

  private removeJob(jobId: string) {
    if (this.schedulerRegistry.doesExist('cron', jobId)) {
      this.schedulerRegistry.deleteCronJob(jobId);
      console.log(`Removed Job ${jobId}`);
    }
  }

  private async processStep(step: Step) {
    const url = new URL(step.url);

    const context = {
      namespace: 'engine',
      contextType: 'website',
      id: url.hostname,
      parsedContext: {
        id: url.hostname,
        url: url.href,
      },
    };

    const savedContext = await this.contextService.saveContextNode(context);

    await this.schedulerService.processContext(savedContext);
  }
}
