export function convertObjectToDynamoMap(obj: any) {
  const map: any = {};

  for (const property in obj) {
    console.log('starting', property);

    const value = obj[property];
    const valueType = typeof value;

    console.log({ property, value, valueType });

    switch (valueType) {
      case 'string':
        map[property] = { S: value };
        break;
      case 'number':
        map[property] = { N: value.toString() };
        break;
      case 'boolean':
        map[property] = { BOOL: value };
        break;
      case 'object':
        if (Array.isArray(value)) {
          map[property] = {
            L: value.map((item) => convertObjectToDynamoMap({ temp: item }).temp),
          };
        } else if (value !== null) {
          map[property] = { M: convertObjectToDynamoMap(value) };
        } else {
          map[property] = { NULL: true };
        }
        break;
      default:
        throw new Error(`Unsupported data type: ${valueType}`);
    }

    console.log('ending', property);
  }

  return map;
}

export function convertDynamoMapToObject(dynamoMap: any): any {
  const obj: any = {};

  for (const property in dynamoMap) {
    const value = dynamoMap[property];
    const valueType = Object.keys(value)[0];

    switch (valueType) {
      case 'S':
        obj[property] = value.S;
        break;
      case 'N':
        obj[property] = parseFloat(value.N);
        break;
      case 'BOOL':
        obj[property] = value.BOOL;
        break;
      case 'NULL':
        obj[property] = null;
        break;
      case 'L':
        obj[property] = value.L.map((item: any) => convertDynamoMapToObject({ temp: item }).temp);
        break;
      case 'M':
        obj[property] = convertDynamoMapToObject(value.M);
        break;
      default:
        throw new Error(`Unsupported DynamoDB data type: ${valueType}`);
    }
  }

  return obj;
}
