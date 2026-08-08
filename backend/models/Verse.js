import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  key: { type: String, required: true },
  label: { type: String, required: true },
  icon: { type: String, required: true },
  description: { type: String }
}, { _id: false });

const verseSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  isOfficial: { type: Boolean, default: false },
  coverImages: [{ type: String }],
  roles: [roleSchema],
  characterCount: { type: Number, default: 0 },
  roleCount: { type: Number, default: 0 },
  powerScore: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  publishedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Verse = mongoose.model('Verse', verseSchema);

export default Verse;
