import { DescribeDBClustersCommand,NeptuneClient } from '@aws-sdk/client-neptune';

import { GraphDatabaseEndpoints } from '../../getActionProcessor/core/graphDatabase/customActions/actions';
import { createAwsClient } from '../createAwsClient';

export const getNeptuneEndpoints = async (clusterIdentifier: string, region: string): Promise<GraphDatabaseEndpoints> => {
  const neptuneClient = createAwsClient(NeptuneClient, { region });

  const command = new DescribeDBClustersCommand({
    DBClusterIdentifier: clusterIdentifier,
  });

  try {
    const response = await neptuneClient.send(command);

    if (response.DBClusters && response.DBClusters.length > 0) {
      const cluster = response.DBClusters[0];

      const writeEndpoint = cluster.Endpoint && cluster.Port ? `https://${cluster.Endpoint}:${cluster.Port}` : undefined;
      const readEndpoint = cluster.ReaderEndpoint && cluster.Port ? `https://${cluster.ReaderEndpoint}:${cluster.Port}` : undefined;

      return { writeEndpoint, readEndpoint };
    }

    return {};
  } catch (error) {
    console.error('Error fetching Neptune cluster endpoints:', error);
    throw new Error(`Failed to retrieve Neptune endpoints: ${error}`);
  }
};
