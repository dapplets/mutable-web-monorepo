import { Injectable, Logger } from '@nestjs/common';
import {
  Configuration as OpenFaasConfig,
  FunctionApi as OpenFaasFnApi,
  SystemApi as OpenFaasSysApi,
} from '@mweb/openfaas-client';
import { ConfigService } from '@nestjs/config';
import { Agent } from 'src/agent/agent.service';
import { ContextNode } from 'src/context/entities/context-node.entity';
import { IRunnerService } from './runner.interface';

@Injectable()
export class OpenFaasService implements IRunnerService {
  private logger = new Logger(OpenFaasService.name);

  private openfaasFnApi: OpenFaasFnApi;
  private openfaasSysApi: OpenFaasSysApi;
  private options: any;

  constructor(private configService: ConfigService) {
    const config = this.configService;

    const username = config.get('OPENFAAS_USERNAME') ?? 'admin';
    const password = config.getOrThrow('OPENFAAS_PASSWORD');

    this.options = {
      headers: {
        Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        'Content-Type': 'application/json',
      },
    };

    const openFaasConfig: OpenFaasConfig = {
      basePath: config.get('OPENFAAS_URL') ?? 'http://127.0.0.1:31112',
    };

    this.openfaasFnApi = new OpenFaasFnApi(
      openFaasConfig,
      openFaasConfig.basePath,
      fetch,
    );

    this.openfaasSysApi = new OpenFaasSysApi(
      openFaasConfig,
      openFaasConfig.basePath,
      fetch,
    );
  }

  async run({ agent, context }: { agent: Agent; context: ContextNode }) {
    const fnName = agent.id.replace(/[^a-zA-Z0-9]+/g, '-'); // ToDo: too naive

    const isFnExist = await this._checkFnExistance(fnName);

    if (!isFnExist) {
      this.logger.log(`Deploying new agent ${agent.id}`);
      await this._deployFn(fnName, agent.image);
      this.logger.log(`Deployed new agent ${agent.id}`);
    }

    const inputData = {
      context: {
        namespace: context.metadata.namespace,
        contextType: context.metadata.contextType,
        id: context.metadata.id,
        parsedContext: context.content,
      },
    };

    try {
      const response = await this.openfaasFnApi.invokeFunction(
        fnName,
        inputData,
        this.options,
      );

      const result = await response.json();

      return result;

      // this.logger.log(`Agent ${agent.id} executed successfully`);

      // return response;
    } catch (errorResponse) {
      this.logger.error(`Function invoking error: ${errorResponse}`);
    }
  }

  private async _checkFnExistance(fnName: string) {
    return this.openfaasSysApi
      .getFunctionStatus(fnName, undefined, this.options)
      .catch(() => false)
      .then((status) => !!status);
  }

  private async _deployFn(fnName: string, image: string) {
    await this.openfaasSysApi.deployFunction(
      { image, service: fnName },
      this.options,
    );
  }
}
