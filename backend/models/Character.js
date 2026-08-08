import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema({
  verseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Verse', required: true },
  name: { type: String, required: true },
  imageUrl: { type: String },
  tags: [{ type: String }],
  // variantOf intentionally unused — forms/fusions treated as independent chars to keep draft logic simple
  stats: {
    type: Map,
    of: Number,
    required: true
  },
  variantOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Character', default: null }
}, {
  timestamps: true
});

const Character = mongoose.model('Character', characterSchema);

export default Character;
