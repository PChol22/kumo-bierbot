import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Table } from 'dynamodb-toolbox';

import { PK, SK } from 'libs/constants';

const client = new DynamoDBClient({});

const documentClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.TABLE_NAME;

if (tableName === undefined) {
  throw new Error('TABLE_NAME environment variable is not defined');
}

export const coreTable = new Table({
  name: tableName,
  partitionKey: PK,
  sortKey: SK,
  DocumentClient: documentClient,
});
