import mongoose from 'mongoose';

const roundSchema = new mongoose.Schema({
  role: { type: String, required: true },
  charA: { type: Object, default: null },
  charB: { type: Object, default: null },
  statA: { type: Number, required: true },
  statB: { type: Number, required: true },
  winner: { type: String, required: true }
}, { _id: false });

const battleResultSchema = new mongoose.Schema({
  draftId: { type: mongoose.Schema.Types.ObjectId, ref: 'DraftSession', required: true },
  scoreA: { type: Number, required: true },
  scoreB: { type: Number, required: true },
  overallWinner: { type: String, required: true },
  rounds: [roundSchema]
}, { timestamps: true });

const BattleResult = mongoose.model('BattleResult', battleResultSchema);

export default BattleResult;
