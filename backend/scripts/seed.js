import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Verse from '../models/Verse.js';
import Character from '../models/Character.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/animedraft';

const roles = [
  { key: 'captain', label: 'Captain', icon: 'crown', description: 'Leads the team' },
  { key: 'vice_captain', label: 'Vice Captain', icon: 'shield-half', description: 'Second in command' },
  { key: 'support_1', label: 'Support 1', icon: 'hand-metal', description: 'Primary support' },
  { key: 'support_2', label: 'Support 2', icon: 'life-buoy', description: 'Secondary support' },
  { key: 'tank', label: 'Tank', icon: 'shield', description: 'Absorbs damage' },
  { key: 'healer', label: 'Healer', icon: 'heart', description: 'Restores health' },
  { key: 'ki_control', label: 'Ki Control', icon: 'zap', description: 'Energy efficiency' },
  { key: 'speed', label: 'Speed', icon: 'wind', description: 'Combat speed' },
  { key: 'power_level', label: 'Power Level', icon: 'flame', description: 'Raw power' },
  { key: 'technique', label: 'Technique', icon: 'crosshair', description: 'Skill accuracy' },
  { key: 'iq', label: 'IQ', icon: 'brain', description: 'Combat intelligence' },
  { key: 'energy_manipulation', label: 'Energy Manipulation', icon: 'orbit', description: 'Ki blasts and auras' },
  { key: 'form', label: 'Form', icon: 'layers', description: 'Transformations' },
  { key: 'sensei', label: 'Sensei', icon: 'book-open', description: 'Mentorship' },
  { key: 'martial_arts', label: 'Martial Arts', icon: 'swords', description: 'Hand to hand combat' },
];

const allRoleKeys = roles.map(r => r.key);

const generateStats = (peaks) => {
  const stats = {};
  allRoleKeys.forEach(k => {
    if (peaks[k]) {
      stats[k] = peaks[k];
    } else {
      // Background stats are between 40 and 84
      stats[k] = Math.floor(Math.random() * 45) + 40; 
    }
  });
  return stats;
}

// Note: variantOf is intentionally unused. Forms (like Goku SSJ) and Fusions (Vegito)
// are treated as fully independent characters to keep the draft pool logic simple.
const charactersData = [
  { name: 'Goku', tags: ['Saiyan', 'Z-Fighter'], stats: generateStats({ captain: 95, form: 98, martial_arts: 96 }) },
  { name: 'Vegeta', tags: ['Saiyan', 'Z-Fighter'], stats: generateStats({ vice_captain: 95, power_level: 96, energy_manipulation: 94 }) },
  { name: 'Gohan', tags: ['Saiyan', 'Z-Fighter', 'Earthling'], stats: generateStats({ iq: 95, form: 96, power_level: 93 }) },
  { name: 'Piccolo', tags: ['Namekian', 'Z-Fighter'], stats: generateStats({ sensei: 95, iq: 96, technique: 92 }) },
  { name: 'Krillin', tags: ['Earthling', 'Z-Fighter'], stats: generateStats({ support_1: 95, support_2: 90, technique: 94 }) },
  { name: 'Master Roshi', tags: ['Earthling', 'Sensei'], stats: generateStats({ sensei: 99, martial_arts: 98, iq: 90 }) },
  { name: 'Yamcha', tags: ['Earthling', 'Z-Fighter'], stats: generateStats({ support_2: 95, speed: 84, technique: 80 }) },
  { name: 'Tien', tags: ['Earthling', 'Z-Fighter'], stats: generateStats({ technique: 96, martial_arts: 92, support_1: 85 }) },
  { name: 'Trunks', tags: ['Saiyan', 'Earthling', 'Time Traveler'], stats: generateStats({ speed: 90, form: 88, power_level: 88 }) },
  { name: 'Goten', tags: ['Saiyan', 'Earthling'], stats: generateStats({ support_2: 88, speed: 85, form: 86 }) },
  { name: 'Frieza', tags: ['Villain', 'Alien'], stats: generateStats({ form: 96, energy_manipulation: 95, captain: 94 }) },
  { name: 'Cell', tags: ['Villain', 'Android'], stats: generateStats({ technique: 98, form: 94, iq: 95 }) },
  { name: 'Majin Buu', tags: ['Villain', 'Majin'], stats: generateStats({ tank: 99, healer: 98, power_level: 94 }) },
  { name: 'Broly', tags: ['Saiyan', 'Villain'], stats: generateStats({ power_level: 99, tank: 98, form: 97 }) },
  { name: 'Beerus', tags: ['Deity', 'Destroyer'], stats: generateStats({ power_level: 99, energy_manipulation: 99, speed: 96 }) },
  { name: 'Whis', tags: ['Deity', 'Angel'], stats: generateStats({ sensei: 100, ki_control: 100, speed: 99 }) },
  { name: 'Android 17', tags: ['Android', 'Z-Fighter'], stats: generateStats({ ki_control: 99, tank: 96, support_1: 94 }) },
  { name: 'Android 18', tags: ['Android', 'Z-Fighter'], stats: generateStats({ ki_control: 99, vice_captain: 90, speed: 88 }) },
  { name: 'Jiren', tags: ['Pride Trooper', 'Alien'], stats: generateStats({ power_level: 100, tank: 97, speed: 96 }) },
  { name: 'Hit', tags: ['Assassin', 'Alien'], stats: generateStats({ technique: 99, speed: 95, martial_arts: 90 }) },
  { name: 'Raditz', tags: ['Saiyan', 'Villain'], stats: generateStats({ martial_arts: 88, power_level: 85, speed: 85 }) },
  { name: 'Nappa', tags: ['Saiyan', 'Villain'], stats: generateStats({ tank: 90, power_level: 88, martial_arts: 85 }) },
  { name: 'Bardock', tags: ['Saiyan'], stats: generateStats({ captain: 92, martial_arts: 90, form: 88 }) },
  { name: 'Vegito', tags: ['Saiyan', 'Fusion'], stats: generateStats({ power_level: 100, martial_arts: 99, form: 99 }) },
  { name: 'Gogeta', tags: ['Saiyan', 'Fusion'], stats: generateStats({ speed: 100, technique: 99, form: 99 }) },
  { name: 'Gotenks', tags: ['Saiyan', 'Fusion', 'Earthling'], stats: generateStats({ form: 95, energy_manipulation: 94, speed: 92 }) },
  { name: 'Cabba', tags: ['Saiyan'], stats: generateStats({ martial_arts: 88, speed: 88, form: 86 }) },
  { name: 'Caulifla', tags: ['Saiyan'], stats: generateStats({ form: 92, martial_arts: 90, power_level: 89 }) },
  { name: 'Kale', tags: ['Saiyan'], stats: generateStats({ power_level: 94, tank: 92, form: 93 }) },
  { name: 'Kefla', tags: ['Saiyan', 'Fusion'], stats: generateStats({ power_level: 97, speed: 95, form: 96 }) },
  { name: 'Toppo', tags: ['Pride Trooper', 'Deity'], stats: generateStats({ vice_captain: 94, tank: 95, energy_manipulation: 93 }) },
  { name: 'Dyspo', tags: ['Pride Trooper'], stats: generateStats({ speed: 99, martial_arts: 88, technique: 85 }) },
  { name: 'Zamasu', tags: ['Deity', 'Villain'], stats: generateStats({ healer: 98, ki_control: 95, iq: 92 }) },
  { name: 'Goku Black', tags: ['Villain', 'Deity'], stats: generateStats({ power_level: 95, form: 96, martial_arts: 95 }) },
  { name: 'Frost', tags: ['Alien', 'Villain'], stats: generateStats({ technique: 90, speed: 88, iq: 88 }) },
  { name: 'Champa', tags: ['Deity', 'Destroyer'], stats: generateStats({ power_level: 98, energy_manipulation: 98, tank: 92 }) },
  { name: 'Vados', tags: ['Deity', 'Angel'], stats: generateStats({ sensei: 99, ki_control: 99, speed: 98 }) },
  { name: 'Dende', tags: ['Namekian', 'Deity'], stats: generateStats({ healer: 99, support_1: 95, iq: 90 }) },
  { name: 'Kami', tags: ['Namekian', 'Deity'], stats: generateStats({ sensei: 92, support_2: 90, iq: 92 }) },
  { name: 'Mr. Popo', tags: ['Deity', 'Sensei'], stats: generateStats({ sensei: 94, martial_arts: 90, ki_control: 92 }) },
  { name: 'Yajirobe', tags: ['Earthling'], stats: generateStats({ support_2: 85, tank: 80, speed: 70 }) },
  { name: 'Korin', tags: ['Deity', 'Sensei'], stats: generateStats({ sensei: 95, support_1: 92, iq: 94 }) },
  { name: 'King Kai', tags: ['Deity', 'Sensei'], stats: generateStats({ sensei: 97, iq: 96, support_1: 90 }) },
  { name: 'Supreme Kai', tags: ['Deity'], stats: generateStats({ support_1: 92, iq: 90, ki_control: 90 }) },
  { name: 'Kibito', tags: ['Deity'], stats: generateStats({ healer: 92, support_2: 88, ki_control: 85 }) },
  { name: 'Uub', tags: ['Earthling'], stats: generateStats({ power_level: 92, martial_arts: 90, potential: 95 }) },
  { name: 'Buuhan', tags: ['Villain', 'Majin'], stats: generateStats({ power_level: 97, iq: 95, technique: 96 }) },
  { name: 'Buutenks', tags: ['Villain', 'Majin'], stats: generateStats({ speed: 96, technique: 95, form: 94 }) },
  { name: 'Janemba', tags: ['Villain', 'Demon'], stats: generateStats({ technique: 97, speed: 95, energy_manipulation: 94 }) },
  { name: 'Cooler', tags: ['Villain', 'Alien'], stats: generateStats({ form: 94, power_level: 92, martial_arts: 90 }) },
  { name: 'Turles', tags: ['Saiyan', 'Villain'], stats: generateStats({ form: 88, power_level: 86, martial_arts: 85 }) },
  { name: 'Lord Slug', tags: ['Namekian', 'Villain'], stats: generateStats({ form: 88, tank: 88, power_level: 85 }) },
  { name: 'Bojack', tags: ['Villain', 'Alien'], stats: generateStats({ power_level: 90, martial_arts: 88, tank: 88 }) },
  { name: 'Android 16', tags: ['Android'], stats: generateStats({ tank: 95, power_level: 90, ki_control: 95 }) },
  { name: 'Android 19', tags: ['Android', 'Villain'], stats: generateStats({ energy_manipulation: 92, tank: 85, ki_control: 90 }) }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await Verse.deleteMany({});
    await Character.deleteMany({});
    console.log('Cleared existing Verses and Characters.');

    const verse = new Verse({
      slug: 'dbz',
      name: 'Dragon Ball',
      isOfficial: true,
      roles: roles,
    });

    const savedVerse = await verse.save();
    console.log(`Created Verse: ${savedVerse.name}`);

    const charsToInsert = charactersData.map(char => ({
      ...char,
      verseId: savedVerse._id
    }));

    await Character.insertMany(charsToInsert);
    console.log(`Inserted ${charsToInsert.length} characters.`);

    // Update the verse counts
    await Verse.updateOne(
      { _id: savedVerse._id },
      { 
        characterCount: charsToInsert.length,
        roleCount: savedVerse.roles.length
      }
    );
    console.log('Updated Verse character and role counts.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
};

seedDB();
