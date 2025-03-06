import { Injectable } from '@nestjs/common';
import { IRunnerService } from './runner.interface';
import { OpenFaasService } from './openfaas.service';
import { NearAiService } from './nearai.service';

@Injectable()
export class RunnerServiceFactory {
  constructor(
    private readonly openFaasService: OpenFaasService,
    private readonly nearAiService: NearAiService,
  ) {}

  getRunner(runnerType: string): IRunnerService {
    if (runnerType === 'openfaas') {
      return this.openFaasService;
    } else if (runnerType === 'nearai') {
      return this.nearAiService;
    }

    return null;
  }
}
