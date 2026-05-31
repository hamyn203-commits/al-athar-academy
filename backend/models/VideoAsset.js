const mongoose = require('mongoose');

const VideoAssetSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  titleEn: { type: String, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['quran', 'tajweed', 'arabic', 'aqeedah', 'fiqh', 'seerah', 'kids'],
    default: 'quran',
  },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  language: { type: String, default: 'ar' },
  views: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

VideoAssetSchema.index({ category: 1, isPublished: 1, sortOrder: 1 });

module.exports = mongoose.model('VideoAsset', VideoAssetSchema);
