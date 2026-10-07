const mongoose = require('mongoose');

const AdminAuditLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  entityType: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  entityId: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  reason: {
    type: String,
    default: '',
    trim: true,
    maxlength: 1000,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  request: {
    method: String,
    path: String,
    ip: String,
    userAgent: String,
  },
}, { timestamps: true });

AdminAuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
AdminAuditLogSchema.index({ actor: 1, createdAt: -1 });

module.exports = mongoose.model('AdminAuditLog', AdminAuditLogSchema);
