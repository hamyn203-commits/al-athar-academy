const AdminAuditLog = require('../models/AdminAuditLog');

function safeMetadata(value) {
  if (!value || typeof value !== 'object') return {};
  const allowed = {};
  for (const [key, item] of Object.entries(value)) {
    if (['reference', 'url', 'token', 'password', 'secret'].some((term) => key.toLowerCase().includes(term))) continue;
    allowed[key] = item;
  }
  return allowed;
}

async function logAdminAction({
  req,
  action,
  entityType,
  entityId,
  reason = '',
  metadata = {},
}) {
  if (!req?.user?.id || !action || !entityType || !entityId) return null;

  return AdminAuditLog.create({
    actor: req.user.id,
    action,
    entityType,
    entityId: String(entityId),
    reason: String(reason || '').trim().slice(0, 1000),
    metadata: safeMetadata(metadata),
    request: {
      method: req.method,
      path: req.originalUrl || req.path,
      ip: req.ip,
      userAgent: String(req.get?.('user-agent') || '').slice(0, 300),
    },
  });
}

module.exports = { logAdminAction };
