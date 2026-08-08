import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  hostId: { type: String, required: true },
  verseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Verse', required: true },
  playerCount: { type: Number, enum: [3, 4, 8], required: true },
  rolesCount: { type: Number, default: 15 },
  passesPerPlayer: { type: Number, default: 10 },
  status: { type: String, enum: ['pending', 'in_progress', 'complete'], default: 'pending' },
  players: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    token: { type: String, required: true }
  }],
  bracket: [{
    matchId: { type: String, required: true },
    nextMatchId: { type: String }, // null for the final
    round: { type: Number, required: true },
    p1: { 
      id: { type: String },
      name: { type: String }
    },
    p2: {
      id: { type: String },
      name: { type: String }
    },
    draftId: { type: mongoose.Schema.Types.ObjectId, ref: 'DraftSession' },
    winnerId: { type: String }
  }]
}, {
  timestamps: true
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

export default Tournament;
