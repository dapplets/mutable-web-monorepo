import { Injectable } from '@nestjs/common';
import k8s from '@kubernetes/client-node';

@Injectable()
export class AgentRunnerService {
  private k8sApi: k8s.CoreV1Api;
  private namespace: string = 'default';

  constructor() {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    this.k8sApi = kc.makeApiClient(k8s.CoreV1Api);
  }

  async createAgentPod(image: string): Promise<string> {
    const agentName = `agent-${Date.now()}`;

    const podManifest = {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: { name: agentName, labels: { app: agentName } },
      spec: {
        containers: [
          {
            name: agentName,
            image: image,
            ports: [{ containerPort: 3000 }], // ToDo: move to agent manifest
            resources: {
              requests: { cpu: '500m', memory: '1Gi' }, // ToDo: move to agent manifest
              limits: { cpu: '2', memory: '4Gi' }, // ToDo: move to agent manifest
            },
          },
        ],
      },
    };

    await this.k8sApi.createNamespacedPod({
      namespace: this.namespace,
      body: podManifest,
    });

    console.log(`Pod ${agentName} created.`);

    return agentName;
  }

  async waitForPodReady(podName: string): Promise<void> {
    console.log(`Waiting for pod ${podName} to be ready...`);

    while (true) {
      const pod = await this.k8sApi.readNamespacedPod({
        name: podName,
        namespace: this.namespace,
      });

      if (pod?.status?.phase === 'Running') {
        console.log(`Pod ${podName} is ready!`);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  //   async queryAgent(podName: string, context: object): Promise<any> {
  //     try {
  //       const response = await this.k8sApi.connectPostNamespacedPodProxyWithPath({
  //         name: podName,
  //         namespace: this.namespace,
  //         path: 'query', // The API path inside the pod
  //         body: context, // The request body
  //       });

  //       return response.body; // Response from the pod
  //     } catch (error) {
  //       console.error(`Error querying agent via K8s API: ${error}`);
  //       return null;
  //     }
  //   }

  async deleteAgentPod(agentName: string): Promise<void> {
    console.log(`Deleting pod ${agentName}...`);

    await this.k8sApi.deleteNamespacedPod({
      name: agentName,
      namespace: this.namespace,
    });

    console.log(`Pod ${agentName} deleted.`);
  }

  async execute(image: string, input: any): Promise<any> {
    const agentName = await this.createAgentPod(image);
    await this.waitForPodReady(agentName);

    // const response = await this.queryAgent(agentName, context);

    await this.deleteAgentPod(agentName);
    return {
      success: true,
    };
    // return response;
  }
}
