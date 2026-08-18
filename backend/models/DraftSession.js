import mongoose from 'mongoose';

const draftSessionSchema = new mongoose.Schema({
  verseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Verse', required: true },
  tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
  joinCode: { type: String, unique: true, sparse: true, uppercase: true },
  mode: { type: String, enum: ['cpu', 'local', 'online', 'tournament'], required: true },
  players: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    token: { type: String }, // Used for reconnects
    isCPU: { type: Boolean, default: false },
    cpuDifficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
  }],
  rosters: {
    type: Map,
    of: {
      type: Map,
      of: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' }
    }
  },
  passesRemaining: {
    type: Map,
    of: Number
  },
  turnOrder: [{ type: String }],
  currentTurnIndex: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'drafting', 'complete'], default: 'drafting' },
  excludedCharacters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }]
}, {
  timestamps: true
});

const DraftSession = mongoose.model('DraftSession', draftSessionSchema);

export default DraftSession;
