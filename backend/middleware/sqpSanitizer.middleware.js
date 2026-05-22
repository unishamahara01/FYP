/**
 * SQP (SQL/NoSQL Query Parameter) Sanitizer Middleware
 * Secures the application from NoSQL operator injection, SQL injection patterns,
 * and XSS (Cross-Site Scripting) attacks.
 * 
 * Protection layers:
 * 1. NoSQL operator injection prevention (strips keys starting with $ or containing .)
 * 2. SQL injection pattern detection and neutralization
 * 3. HTML/XSS encoding for stored string inputs
 * 4. Logging of blocked injection attempts
 */

// ==================== NoSQL Injection Prevention ====================
// Recursive NoSQL operator injection prevention (stripping keys starting with $ or containing .)
const sanitizeNoSQL = (target) => {
  if (target && typeof target === 'object') {
    if (Array.isArray(target)) {
      for (let i = 0; i < target.length; i++) {
        target[i] = sanitizeNoSQL(target[i]);
      }
    } else {
      for (const key in target) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
          if (key.startsWith('$') || key.includes('.')) {
            // Delete dangerous keys to prevent operator injection
            console.warn(`🛡️ [SQP] Blocked NoSQL operator injection: key="${key}"`);
            delete target[key];
          } else {
            target[key] = sanitizeNoSQL(target[key]);
          }
        }
      }
    }
  }
  return target;
};

// ==================== SQL Injection & XSS Prevention ====================
// SQL Injection pattern and HTML XSS sanitizer
const sanitizeSQLAndXSS = (value, fieldName = 'unknown') => {
  if (typeof value !== 'string') {
    return value;
  }

  let sanitized = value;

  // 1. Detect common SQL injection patterns:
  // - SQL comments: -- or /* ... */
  // - SQL injection keywords: UNION SELECT, DROP TABLE, SELECT ... FROM, etc.
  // - Quote breakouts combined with logical operators: ' OR '1'='1
  const sqlPatterns = [
    /\bunion\s+select\b/i,
    /\bselect\s+.*\s+from\b/i,
    /\binsert\s+into\b/i,
    /\bupdate\s+.*\s+set\b/i,
    /\bdelete\s+from\b/i,
    /\bdrop\s+table\b/i,
    /\bdrop\s+database\b/i,
    /\balter\s+table\b/i,
    /--/g, // SQL comments
    /\/\*/g, // SQL block comment start
    /\*\//g, // SQL block comment end
    /'\s*(or|and)\s+.*=.*(--|\/\*|'|")/i // Logical breakouts
  ];

  sqlPatterns.forEach(pattern => {
    if (pattern.test(sanitized)) {
      console.warn(`🛡️ [SQP] Neutralized SQL injection pattern in "${fieldName}": ${pattern}`);
      sanitized = sanitized.replace(pattern, '');
    }
  });

  // 2. HTML/XSS encode critical characters to prevent Stored XSS
  const htmlReplacements = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  sanitized = sanitized.replace(/[&<>"'/]/g, (char) => htmlReplacements[char]);

  return sanitized;
};

// Recursively sanitize all string properties in a request payload
const sanitizeRequestStrings = (target, prefix = '') => {
  if (target && typeof target === 'object') {
    if (Array.isArray(target)) {
      for (let i = 0; i < target.length; i++) {
        target[i] = sanitizeRequestStrings(target[i], `${prefix}[${i}]`);
      }
    } else {
      for (const key in target) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
          if (typeof target[key] === 'string') {
            target[key] = sanitizeSQLAndXSS(target[key], `${prefix}.${key}`);
          } else {
            target[key] = sanitizeRequestStrings(target[key], `${prefix}.${key}`);
          }
        }
      }
    }
  }
  return target;
};

// Global Express Middleware
exports.sqpSanitizer = (req, res, next) => {
  // Apply NoSQL operator stripping
  if (req.query) req.query = sanitizeNoSQL(req.query);
  if (req.params) req.params = sanitizeNoSQL(req.params);
  if (req.body) req.body = sanitizeNoSQL(req.body);

  // Apply SQL injection pattern neutralization and XSS encoding
  if (req.query) req.query = sanitizeRequestStrings(req.query, 'query');
  if (req.params) req.params = sanitizeRequestStrings(req.params, 'params');
  if (req.body) req.body = sanitizeRequestStrings(req.body, 'body');

  next();
};
