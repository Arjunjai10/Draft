import mongoose from 'mongoose';

const matchHistorySchema = new mongoose.Schema({
  userId: { type: String, default: null }, // Nullable for now
  opponentName: { type: String, required: true },
  verseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Verse' },
  mode: { type: String, default: 'Solo vs CPU' },
  score: {
    p1: { type: Number, required: true },
    p2: { type: Number, required: true }
  },
  result: { type: String, enum: ['player1', 'player2', 'tie'], required: true },
  playedAt: { type: Date, default: Date.now }
});

export default mongoose.model('MatchHistory', matchHistorySchema);
