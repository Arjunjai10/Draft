import mongoose from 'mongoose';

const matchHistorySchema = new mongoose.Schema({
  draftId:      { type: mongoose.Schema.Types.ObjectId, ref: 'DraftSession', default: null },
  userId:       { type: String, default: null },
  // Player names frozen at write time — display correctly forever even if the
  // underlying player document changes or the draft session is purged.
  player1Name:  { type: String, required: true },
  player2Name:  { type: String, required: true },
  opponentName: { type: String, required: true }, // kept for backwards compatibility
  verseId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Verse' },
  mode:         { type: String, default: 'Solo vs CPU' },
  score: {
    p1: { type: Number, required: true },
    p2: { type: Number, required: true }
  },
  result:  { type: String, enum: ['player1', 'player2', 'tie'], required: true },
  /**
   * picks — denormalised snapshot of both rosters at completion time.
   * Shape:
   *   {
   *     player1: { [roleKey]: { characterId: ObjectId, characterName: String } },
   *     player2: { [roleKey]: { characterId: ObjectId, characterName: String } }
   *   }
   * characterName is the source of truth for display.
   * characterId is stored for optional DB join today; treat as informational if char is later deleted.
   */
  picks:   { type: mongoose.Schema.Types.Mixed, default: {} },
  playedAt:{ type: Date, default: Date.now }
});

// Hot-path indices
matchHistorySchema.index({ playedAt: -1 });
matchHistorySchema.index({ draftId: 1 });

export default mongoose.model('MatchHistory', matchHistorySchema);
