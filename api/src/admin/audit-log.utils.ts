
const SENSITIVE_FIELDS = [
  'password',
  'confirmPassword',
  'currentPassword',
  'newPassword',
  'oldPassword',
  'token',
  'secret',
  'accessToken',
  'refreshToken',
  'apiKey',
  'privateKey',
  'cvv',
  'cardNumber',
  'smtpPassword',
  'smtpUser',
  'keySecret',
  'apiSecret',
  'webhookSecret',
  'razorpayWebhookSecret',
  'razorpayKeySecret',
  'geminiApiKey',
  'authToken',
  'auth',
  'authorization',
];

const EXCLUDED_FIELDS = ['createdAt', 'updatedAt', 'id', '_id', '__v'];

/**
 * Checks if a key is sensitive.
 */
function isSensitive(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_FIELDS.some(f => lowerKey.includes(f.toLowerCase()));
}

/**
 * Masks a value based on the field type.
 */
function maskValue(val: any, key: string): any {
  if (val === null || val === undefined) return val;
  if (!isSensitive(key)) return val;

  const str = String(val);
  if (lowerKeyIncludes(key, 'password') || lowerKeyIncludes(key, 'secret') || lowerKeyIncludes(key, 'key')) {
    return '********';
  }
  if (str.includes('@')) {
    const [name, domain] = str.split('@');
    if (name.length <= 2) return `*@${domain}`;
    return `${name[0]}***${name[name.length - 1]}@${domain}`;
  }
  return '********';
}

function lowerKeyIncludes(key: string, search: string): boolean {
  return key.toLowerCase().includes(search.toLowerCase());
}

/**
 * Deeply sanitizes an object by masking sensitive fields.
 */
export function sanitize(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item));
  }

  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (isSensitive(key)) {
      sanitized[key] = maskValue(sanitized[key], key);
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitize(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Optimizes an object by replacing large arrays with their count.
 */
export function optimize(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    if (obj.length > 5) {
      return { count: obj.length, _type: 'array_summary' };
    }
    return obj.map((item) => optimize(item));
  }

  const optimized = { ...obj };
  for (const key in optimized) {
    if (Array.isArray(optimized[key])) {
      if (optimized[key].length > 5) {
        optimized[`${key}Count`] = optimized[key].length;
        delete optimized[key];
      } else {
        optimized[key] = optimize(optimized[key]);
      }
    } else if (typeof optimized[key] === 'object') {
      optimized[key] = optimize(optimized[key]);
    }
  }

  return optimized;
}

/**
 * Extracts the actual data if it's wrapped in a "data" property.
 */
function extractData(obj: any): any {
  if (obj && typeof obj === 'object' && 'data' in obj && Object.keys(obj).length === 1) {
    return obj.data;
  }
  return obj;
}

/**
 * Detects changes between two objects and returns a detailed array of changes.
 */
export function getChanges(before: any, after: any): any {
  // Extract data if nested
  const cleanBefore = extractData(before);
  const cleanAfter = extractData(after);

  const changes: any[] = [];

  // If initial creation
  if (!cleanBefore) {
    const fields = Object.keys(cleanAfter || {}).filter(k => !EXCLUDED_FIELDS.includes(k));
    return {
      changes: fields.map(field => ({
        field,
        before: null,
        after: isSensitive(field) ? 'changed' : optimize(cleanAfter[field]),
      }))
    };
  }

  // If deletion
  if (!cleanAfter) {
    const fields = Object.keys(cleanBefore || {}).filter(k => !EXCLUDED_FIELDS.includes(k));
    return {
      changes: fields.map(field => ({
        field,
        before: isSensitive(field) ? 'hidden' : optimize(cleanBefore[field]),
        after: 'removed',
      }))
    };
  }

  const allKeys = new Set([...Object.keys(cleanBefore || {}), ...Object.keys(cleanAfter || {})]);

  for (const key of allKeys) {
    if (EXCLUDED_FIELDS.includes(key)) continue;

    const valBefore = cleanBefore[key];
    const valAfter = cleanAfter[key];

    // Simple comparison for non-objects
    if (JSON.stringify(valBefore) !== JSON.stringify(valAfter)) {
      if (isSensitive(key)) {
        changes.push({
          field: key,
          before: null,
          after: 'changed',
        });
      } else {
        changes.push({
          field: key,
          before: optimize(valBefore),
          after: optimize(valAfter),
        });
      }
    }
  }

  return changes.length > 0 ? { changes } : null;
}
