import { KvsAdvancedDataType } from '../../../actions';

export function isValidKvsAdvancedDataType(value: any): value is KvsAdvancedDataType {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return true;
  }

  if (Array.isArray(value)) {
    // Ensures array only contains basic data types, no nested arrays or objects
    return value.every((item) => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean');
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    // Check if every value in the object is a KvsBasicDataType (recursive structures not allowed here)
    return Object.values(value).every((v) => typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean');
  }

  // Exclude any other data types or complex nested structures
  return false;
}
