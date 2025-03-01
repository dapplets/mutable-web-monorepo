import { Injectable } from '@nestjs/common';
import { Task, TaskHandler } from 'nestjs-graphile-worker';
import { Logger } from '@nestjs/common';
import {
  Configuration as OpenFaasConfig,
  FunctionApi as OpenFaasFnApi,
  SystemApi as OpenFaasSysApi,
} from '@mweb/openfaas-client';
import { ConfigService } from '@nestjs/config';
import { AgentService } from 'src/agent/agent.service';
import { ContextService } from 'src/context/context.service';

@Injectable()
@Task('run-agent')
export class RunnerService {
  private logger = new Logger(RunnerService.name);

  private openfaasFnApi: OpenFaasFnApi;
  private openfaasSysApi: OpenFaasSysApi;
  private options: any;

  constructor(
    private configService: ConfigService,
    private agentService: AgentService,
    private contextService: ContextService,
  ) {
    const config = this.configService;

    const username = config.get('OPENFAAS_USERNAME') ?? 'admin';
    const password = config.getOrThrow('OPENFAAS_PASSWORD');

    this.options = {
      headers: {
        Authorization: `Basic ${btoa(`${username}:${password}`)}`,
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

  @TaskHandler()
  async handler({
    agentId,
    contextId,
  }: {
    agentId: string;
    contextId: string;
  }) {
    const agent = await this.agentService.getAgentById(agentId);

    if (!agent) {
      this.logger.error(`Agent ${agentId} not found`);
      return;
    }

    const context = await this.contextService.getContextNodeById(contextId);

    if (!context) {
      this.logger.error(`Context ${contextId} not found`);
      return;
    }

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

      if (!result?.context) {
        this.logger.error(`Agent ${agent.id}: no context returned`);
        return;
      }

      const savedContext = await this.contextService.saveContextNode(
        result.context,
      );

      await this.contextService.saveEdge({
        parent: context.metadata.hash,
        child: savedContext.metadata.hash,
      });

      this.logger.log(`Agent ${agent.id} executed successfully`);

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
