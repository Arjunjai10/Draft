import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Verse from '../models/Verse.js';
import Character from '../models/Character.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/animedraft';

const generateStats = (name, roleKeys) => {
  let powerBase = 75 + Math.floor(Math.random() * 10); // 75-85 average

  const godTier = ['MUI', 'Ultra Instinct', 'Ultra Ego', 'Black Frieza', 'Beerus', 'Whis', 'Baryon', 'Six Paths', 'Kaguya', 'True Bankai', 'Yhwach', 'Soul King', 'Gear 5', 'Roger', 'Whitebeard', 'True Form', 'Gojo (Adult)', 'Demon King', 'Yoriichi', 'Prime', 'Apex'];
  const highTier = ['SSB', 'SSG', 'SSJ4', 'Golden', 'Beast', 'LSSJ', 'KCM', 'Rinnegan', 'Edo', 'Dangai', 'Vasto Lorde', 'Monster', 'Gear 4', 'Yonko', 'Awakened', 'Special Grade', 'Domain', 'Mark', 'Upper Rank', '100%'];
  
  if (godTier.some(t => name.includes(t))) powerBase = 97 + Math.floor(Math.random() * 4); // 97-100
  else if (highTier.some(t => name.includes(t))) powerBase = 90 + Math.floor(Math.random() * 6); // 90-95
  
  const stats = {};
  roleKeys.forEach(k => {
    // Add some random variance to each stat based on the character's general power tier
    let statVal = powerBase + Math.floor(Math.random() * 15 - 7); 
    stats[k] = Math.max(40, Math.min(100, statVal)); // clamp 40-100
  });
  return stats;
}

const versesData = [
  {
    slug: 'dbz',
    name: 'Dragon Ball',
    isOfficial: true,
    roles: [
      { key: 'captain', label: 'Captain', icon: 'crown', description: 'Leads the team' },
      { key: 'vice_captain', label: 'Vice Captain', icon: 'shield-half', description: 'Second in command' },
      { key: 'support', label: 'Support', icon: 'hand-metal', description: 'Ally support' },
      { key: 'tank', label: 'Tank', icon: 'shield', description: 'Absorbs damage' },
      { key: 'healer', label: 'Healer', icon: 'heart', description: 'Restores health' },
      { key: 'ki_control', label: 'Ki Control', icon: 'zap', description: 'Energy efficiency' },
      { key: 'speed', label: 'Speed', icon: 'wind', description: 'Combat speed' },
      { key: 'power_level', label: 'Power Level', icon: 'flame', description: 'Raw power' },
      { key: 'technique', label: 'Technique', icon: 'crosshair', description: 'Skill accuracy' },
      { key: 'iq', label: 'IQ', icon: 'brain', description: 'Combat intelligence' },
      { key: 'energy_manipulation', label: 'Energy Manipulation', icon: 'orbit', description: 'Ki blasts and auras' },
      { key: 'form', label: 'Form', icon: 'layers', description: 'Transformations' },
      { key: 'martial_arts', label: 'Martial Arts', icon: 'swords', description: 'Hand to hand combat' },
    ],
    charNames: [
      'Goku (Base)', 'Goku (Kaioken)', 'Goku (Super Saiyan)', 'Goku (SSJ2)', 'Goku (SSJ3)', 'Goku (SSG)', 'Goku (SSB)', 'Goku (UI Omen)', 'Goku (MUI)',
      'Vegeta (Base)', 'Vegeta (Super Saiyan)', 'Vegeta (Super Vegeta)', 'Majin Vegeta', 'Vegeta (SSJ2)', 'Vegeta (SSB)', 'Vegeta (SSBE)', 'Vegeta (Ultra Ego)',
      'Gohan (Kid)', 'Gohan (SSJ)', 'Gohan (SSJ2 Youth)', 'Gohan (Adult Base)', 'Gohan (Ultimate)', 'Gohan (Beast)',
      'Piccolo (Base)', 'Piccolo (Fused with Kami)', 'Piccolo (Orange)',
      'Frieza (1st Form)', 'Frieza (2nd Form)', 'Frieza (3rd Form)', 'Frieza (Final Form)', 'Frieza (100% Full Power)', 'Golden Frieza', 'Black Frieza',
      'Cell (Imperfect)', 'Cell (Semi-Perfect)', 'Cell (Perfect)', 'Cell (Super Perfect)',
      'Majin Buu (Fat)', 'Evil Buu', 'Super Buu', 'Buutenks', 'Buuhan', 'Kid Buu',
      'Broly (Z Base)', 'Broly (Z SSJ)', 'Broly (Z LSSJ)', 'Broly (Super Base)', 'Broly (Super Ikari)', 'Broly (Super SSJ)', 'Broly (Super Full Power SSJ)',
      'Trunks (Kid)', 'Trunks (Future Base)', 'Trunks (Future SSJ)', 'Super Trunks', 'Trunks (SSJ Rage)',
      'Goten (Base)', 'Goten (SSJ)',
      'Gotenks (Base)', 'Gotenks (SSJ)', 'Gotenks (SSJ3)',
      'Vegito (Base)', 'Vegito (Super Vegito)', 'Vegito (SSB)',
      'Gogeta (Base)', 'Gogeta (Super Gogeta)', 'Gogeta (SSJ4)', 'Gogeta (SSB)',
      'Krillin', 'Tien', 'Yamcha', 'Master Roshi (Base)', 'Master Roshi (Max Power)', 'Yajirobe', 'Chiaotzu',
      'Android 17 (Z)', 'Android 17 (Super)', 'Android 18', 'Android 16', 'Android 19', 'Dr. Gero',
      'Beerus', 'Whis', 'Champa', 'Vados',
      'Jiren', 'Jiren (Full Power)', 'Toppo (Base)', 'Toppo (God of Destruction)', 'Dyspo',
      'Hit', 'Cabba (Base)', 'Cabba (SSJ)', 'Caulifla (Base)', 'Caulifla (SSJ2)', 'Kale (Base)', 'Kale (Berserk)', 'Kefla (Base)', 'Kefla (SSJ2)',
      'Zamasu', 'Goku Black (Base)', 'Goku Black (Super Saiyan Rose)', 'Merged Zamasu', 'Merged Zamasu (Corrupted)',
      'Raditz', 'Nappa', 'Bardock (Base)', 'Bardock (SSJ)',
      'Cooler (Base)', 'Cooler (Final Form)', 'Metal Cooler', 'Janemba (Fat)', 'Super Janemba', 'Bojack', 'Turles'
    ]
  },
  {
    slug: 'naruto',
    name: 'Naruto',
    isOfficial: true,
    roles: [
      { key: 'hokage', label: 'Kage', icon: 'crown', description: 'Village Leader' },
      { key: 'ninjutsu', label: 'Ninjutsu', icon: 'flame', description: 'Ninja arts' },
      { key: 'taijutsu', label: 'Taijutsu', icon: 'swords', description: 'Hand-to-hand' },
      { key: 'genjutsu', label: 'Genjutsu', icon: 'eye', description: 'Illusions' },
      { key: 'chakra', label: 'Chakra', icon: 'droplet', description: 'Chakra reserves' },
      { key: 'speed', label: 'Speed', icon: 'wind', description: 'Movement speed' },
      { key: 'intelligence', label: 'Intelligence', icon: 'brain', description: 'Battle IQ' },
      { key: 'healing', label: 'Medical Ninjutsu', icon: 'heart', description: 'Healing arts' },
      { key: 'summoning', label: 'Summoning', icon: 'paw-print', description: 'Summoning beasts' },
      { key: 'sensory', label: 'Sensory', icon: 'wifi', description: 'Sensing chakra' },
      { key: 'kekkai_genkai', label: 'Kekkai Genkai', icon: 'layers', description: 'Bloodline limit' },
      { key: 'stamina', label: 'Stamina', icon: 'battery-charging', description: 'Endurance' },
    ],
    charNames: [
      'Naruto (Kid Base)', 'Naruto (Kid 1-Tail)', 'Naruto (Shippuden Base)', 'Naruto (Sage Mode)', 'Naruto (KCM 1)', 'Naruto (KCM 2)', 'Naruto (Six Paths Sage Mode)', 'Naruto (Hokage)', 'Naruto (Baryon Mode)',
      'Sasuke (Kid Base)', 'Sasuke (Curse Mark 1)', 'Sasuke (Curse Mark 2)', 'Sasuke (Hebi)', 'Sasuke (Taka/MS)', 'Sasuke (EMS)', 'Sasuke (Rinnegan)', 'Sasuke (Adult)',
      'Sakura (Kid)', 'Sakura (Shippuden)', 'Sakura (War Arc Byakugou)',
      'Kakashi (Base)', 'Kakashi (Sharingan)', 'Kakashi (War Arc)', 'Kakashi (DMS)', 'Kakashi (Hokage)',
      'Shikamaru (Kid)', 'Shikamaru (Shippuden)', 'Shikamaru (Adult)',
      'Ino', 'Choji (Base)', 'Choji (Butterfly Mode)', 'Hinata (Base)', 'Hinata (War Arc)',
      'Kiba', 'Shino', 'Neji (Kid)', 'Neji (Shippuden)', 'Rock Lee (Base)', 'Rock Lee (5th Gate)', 'Rock Lee (6th Gate)', 'Tenten',
      'Gaara (Kid)', 'Gaara (Shukaku)', 'Gaara (Kazekage Base)', 'Gaara (War Arc)', 'Kankuro', 'Temari',
      'Jiraiya (Base)', 'Jiraiya (Sage Mode)', 'Tsunade (Base)', 'Tsunade (100 Healings)', 'Orochimaru (Base)', 'Orochimaru (Hydra)',
      'Minato (Base)', 'Minato (Edo KCM)', 'Hashirama (Base)', 'Hashirama (Sage Mode)', 'Tobirama', 'Hiruzen (Old)', 'Hiruzen (Prime)',
      'Madara (Base)', 'Madara (Edo Tensei)', 'Madara (Alive Rinnegan)', 'Madara (Ten Tails Jinchuriki)',
      'Obito (Kid)', 'Obito (Masked/Yellow Mask)', 'Obito (Tobi)', 'Obito (War Arc/White Mask)', 'Obito (Ten Tails Jinchuriki)',
      'Pain (Deva Path)', 'Nagato (Edo Tensei)', 'Konan',
      'Itachi (Base)', 'Itachi (Edo Tensei)', 'Kisame (Base)', 'Kisame (Fused)', 'Deidara', 'Sasori', 'Hidan', 'Kakuzu', 'Zetsu',
      'Kabuto (Base)', 'Kabuto (Snake Sage)',
      'Killer Bee (Base)', 'Killer Bee (Eight Tails)', 'A (4th Raikage)', 'Mei (Mizukage)', 'Onoki (Tsuchikage)', 'Mu', 'Gengetsu', 'Third Raikage',
      'Kaguya Otsutsuki', 'Momoshiki (Base)', 'Momoshiki (Fused)', 'Kinshiki', 'Toneri', 'Isshiki'
    ]
  },
  {
    slug: 'bleach',
    name: 'Bleach',
    isOfficial: true,
    roles: [
      { key: 'captain', label: 'Captain', icon: 'crown', description: 'Gotei 13 Captain' },
      { key: 'reiatsu', label: 'Reiatsu', icon: 'flame', description: 'Spiritual pressure' },
      { key: 'zanjutsu', label: 'Zanjutsu', icon: 'swords', description: 'Swordsmanship' },
      { key: 'kido', label: 'Kido', icon: 'zap', description: 'Demon magic' },
      { key: 'speed', label: 'Speed', icon: 'wind', description: 'Movement speed' },
      { key: 'intelligence', label: 'Intelligence', icon: 'brain', description: 'Battle IQ' },
      { key: 'healing', label: 'Kaido', icon: 'heart', description: 'Healing arts' },
      { key: 'stamina', label: 'Stamina', icon: 'battery-charging', description: 'Endurance' },
      { key: 'bankai', label: 'Bankai', icon: 'layers', description: 'Final release' },
      { key: 'hakuda', label: 'Hakuda', icon: 'hand-metal', description: 'Hand-to-hand' },
      { key: 'durability', label: 'Durability', icon: 'shield', description: 'Toughness' },
    ],
    charNames: [
      'Ichigo (Substitute)', 'Ichigo (Shikai)', 'Ichigo (Bankai)', 'Ichigo (Hollow Mask)', 'Ichigo (Vasto Lorde)', 'Ichigo (Fullbring)', 'Ichigo (Dangai/Mugetsu)', 'Ichigo (True Shikai)', 'Ichigo (True Bankai)', 'Ichigo (Horn of Salvation)',
      'Rukia (Base)', 'Rukia (Shikai)', 'Rukia (Bankai)',
      'Renji (Base)', 'Renji (Shikai)', 'Renji (Bankai)', 'Renji (True Bankai)',
      'Uryu (Base)', 'Uryu (Letzt Stil)', 'Uryu (TYBW Vollstandig)',
      'Chad (Right Arm)', 'Chad (Left Arm)', 'Orihime (Base)', 'Orihime (TYBW)',
      'Byakuya (Base)', 'Byakuya (Shikai)', 'Byakuya (Bankai)', 'Byakuya (TYBW Bankai)',
      'Kenpachi (Base)', 'Kenpachi (Eyepatch Removed)', 'Kenpachi (Shikai)', 'Kenpachi (Bankai)',
      'Toshiro (Base)', 'Toshiro (Bankai)', 'Toshiro (Adult Bankai)',
      'Shunsui (Base)', 'Shunsui (Shikai)', 'Shunsui (Bankai)',
      'Ukitake (Base)', 'Ukitake (Shikai)',
      'Yamamoto (Base)', 'Yamamoto (Shikai)', 'Yamamoto (Bankai)',
      'Unohana (Base)', 'Unohana (Bankai)',
      'Mayuri (Base)', 'Mayuri (Bankai)', 'Mayuri (Modified Bankai)',
      'Komamura (Base)', 'Komamura (Bankai)', 'Komamura (Human Form)',
      'Soi Fon (Base)', 'Soi Fon (Shunko)', 'Soi Fon (Bankai)',
      'Shinji (Base)', 'Shinji (Hollow Mask)', 'Shinji (Bankai)',
      'Kisuke (Base)', 'Kisuke (Shikai)', 'Kisuke (Bankai)',
      'Yoruichi (Base)', 'Yoruichi (Shunko)', 'Yoruichi (Thunder Cat)',
      'Isshin (Base)', 'Isshin (Shikai)',
      'Aizen (Base Captain)', 'Aizen (Chrysalis)', 'Aizen (Monster)', 'Aizen (TYBW Muken)',
      'Ulquiorra (Base)', 'Ulquiorra (Resurreccion)', 'Ulquiorra (Segunda Etapa)',
      'Grimmjow (Base)', 'Grimmjow (Resurreccion)',
      'Starrk (Base)', 'Starrk (Resurreccion)',
      'Halibel (Base)', 'Halibel (Resurreccion)',
      'Nnoitra (Base)', 'Nnoitra (Resurreccion)',
      'Yhwach (Base)', 'Yhwach (The Almighty)', 'Yhwach (Soul King Absorbed)',
      'Haschwalth', 'Askin', 'Bazz-B', 'Lille Barro (Base)', 'Lille Barro (Vollstandig)', 'Gerard Valkyrie', 'Pernida', 'Gremmy'
    ]
  },
  {
    slug: 'one-piece',
    name: 'One Piece',
    isOfficial: true,
    roles: [
      { key: 'captain', label: 'Captain', icon: 'crown', description: 'Crew Leader' },
      { key: 'conquerors_haki', label: 'Conquerors', icon: 'zap', description: 'King\'s Haki' },
      { key: 'armament_haki', label: 'Armament', icon: 'shield', description: 'Armor Haki' },
      { key: 'observation_haki', label: 'Observation', icon: 'eye', description: 'Sensing Haki' },
      { key: 'devil_fruit', label: 'Devil Fruit', icon: 'star', description: 'Fruit mastery' },
      { key: 'speed', label: 'Speed', icon: 'wind', description: 'Movement speed' },
      { key: 'strength', label: 'Strength', icon: 'anchor', description: 'Physical power' },
      { key: 'durability', label: 'Durability', icon: 'battery-charging', description: 'Toughness' },
      { key: 'intelligence', label: 'Intelligence', icon: 'brain', description: 'Battle IQ' },
      { key: 'swordsmanship', label: 'Swordsmanship', icon: 'swords', description: 'Sword skill' },
    ],
    charNames: [
      'Luffy (Base)', 'Luffy (Gear 2)', 'Luffy (Gear 3)', 'Luffy (Gear 4 Bounceman)', 'Luffy (Gear 4 Snakeman)', 'Luffy (Gear 5)',
      'Zoro (Base)', 'Zoro (Asura)', 'Zoro (King of Hell)',
      'Sanji (Base)', 'Sanji (Diable Jambe)', 'Sanji (Ifrit Jambe)',
      'Nami (Base)', 'Nami (Zeus)', 'Usopp', 'Chopper (Brain Point)', 'Chopper (Monster Point)',
      'Robin (Base)', 'Robin (Demonio Fleur)', 'Franky (Base)', 'Franky (General)', 'Brook', 'Jinbe',
      'Shanks', 'Buggy', 'Mihawk', 'Crocodile', 'Doflamingo (Base)', 'Doflamingo (Awakened)',
      'Moria', 'Kuma', 'Boa Hancock', 'Trafalgar Law (Base)', 'Trafalgar Law (Awakened)',
      'Eustass Kid (Base)', 'Eustass Kid (Awakened)', 'Bege', 'Apoo', 'Hawkins', 'X Drake', 'Urouge', 'Jewelry Bonney',
      'Blackbeard (Yami Yami)', 'Blackbeard (Dual Fruit)',
      'Kaido (Base)', 'Kaido (Dragon)', 'Kaido (Hybrid)', 'Kaido (Flaming Drum Dragon)',
      'Big Mom (Base)', 'Big Mom (Zeus/Prometheus)', 'Big Mom (Bigger Mom)',
      'Whitebeard (Old)', 'Whitebeard (Prime)', 'Marco', 'Portgas D. Ace', 'Sabo (Base)', 'Sabo (Flame Fruit)',
      'Monkey D. Dragon', 'Garp (Old)', 'Garp (Prime)', 'Sengoku (Old)', 'Sengoku (Buddha)',
      'Akainu', 'Aokiji', 'Kizaru', 'Fujitora', 'Ryokugyu', 'Smoker', 'Tashigi',
      'Rob Lucci (Base)', 'Rob Lucci (Leopard)', 'Rob Lucci (Awakened)', 'Kaku', 'Enel', 'Katakuri', 'King', 'Queen', 'Jack'
    ]
  },
  {
    slug: 'jjk',
    name: 'Jujutsu Kaisen',
    isOfficial: true,
    roles: [
      { key: 'cursed_energy', label: 'Cursed Energy', icon: 'flame', description: 'Energy reserves' },
      { key: 'domain_expansion', label: 'Domain Expansion', icon: 'layers', description: 'Pinnacle of sorcery' },
      { key: 'cursed_technique', label: 'Cursed Technique', icon: 'zap', description: 'Innate technique' },
      { key: 'reverse_cursed', label: 'Reverse Cursed', icon: 'heart', description: 'Healing' },
      { key: 'speed', label: 'Speed', icon: 'wind', description: 'Movement speed' },
      { key: 'strength', label: 'Strength', icon: 'anchor', description: 'Physical power' },
      { key: 'durability', label: 'Durability', icon: 'shield', description: 'Toughness' },
      { key: 'intelligence', label: 'Intelligence', icon: 'brain', description: 'Battle IQ' },
      { key: 'hand_to_hand', label: 'Hand-to-Hand', icon: 'hand-metal', description: 'Martial arts' },
      { key: 'black_flash', label: 'Black Flash', icon: 'star', description: 'Critical hit' },
      { key: 'barrier', label: 'Barrier', icon: 'box', description: 'Barrier techniques' },
    ],
    charNames: [
      'Yuji (Goodwill)', 'Yuji (Shibuya)', 'Yuji (Shinjuku Awakened)',
      'Megumi (Base)', 'Megumi (Domain Expansion)',
      'Nobara', 'Gojo (Hidden Inventory)', 'Gojo (Adult)',
      'Geto (Hidden Inventory)', 'Geto (Adult)', 'Kenjaku',
      'Yuta (JJK 0)', 'Yuta (Culling Games)', 'Yuta (Domain Expansion)',
      'Maki (Student)', 'Maki (Awakened)', 'Maki (Fully Realized)',
      'Inumaki', 'Panda (Base)', 'Panda (Gorilla Mode)', 'Panda (Sister Core)',
      'Hakari (Base)', 'Hakari (Jackpot)', 'Kirara',
      'Todo (Base)', 'Todo (Vibraslap)', 'Kamo', 'Mechamaru (Base)', 'Mechamaru (Ultimate)', 'Miwa', 'Mai',
      'Nanami', 'Mei Mei', 'Naobito', 'Naoya (Human)', 'Naoya (Cursed Spirit)',
      'Choso', 'Eso', 'Kechizu',
      'Mahito (Base)', 'Mahito (Instant Spirit of Distorted Killing)',
      'Jogo', 'Hanami', 'Dagon',
      'Sukuna (Yuji Vessel)', 'Sukuna (Megumi Vessel)', 'Sukuna (True Form/Heian Era)',
      'Uraume', 'Kashimo (Base)', 'Kashimo (Mythical Beast Amber)',
      'Higuruma (Base)', 'Higuruma (Domain Expansion)', 'Takaba', 'Ryu Ishigori', 'Uro', 'Yorozu'
    ]
  },
  {
    slug: 'demon-slayer',
    name: 'Demon Slayer',
    isOfficial: true,
    roles: [
      { key: 'breathing', label: 'Breathing Style', icon: 'wind', description: 'Sword technique' },
      { key: 'speed', label: 'Speed', icon: 'zap', description: 'Movement speed' },
      { key: 'strength', label: 'Strength', icon: 'anchor', description: 'Physical power' },
      { key: 'stamina', label: 'Stamina', icon: 'battery-charging', description: 'Endurance' },
      { key: 'durability', label: 'Durability', icon: 'shield', description: 'Toughness' },
      { key: 'regeneration', label: 'Regeneration', icon: 'heart', description: 'Healing (Demons)' },
      { key: 'blood_demon_art', label: 'Blood Demon Art', icon: 'flame', description: 'Demon magic' },
      { key: 'mark', label: 'Slayer Mark', icon: 'star', description: 'Power boost' },
      { key: 'swordsmanship', label: 'Swordsmanship', icon: 'swords', description: 'Blade skill' },
    ],
    charNames: [
      'Tanjiro (Water Breathing)', 'Tanjiro (Hinokami Kagura)', 'Tanjiro (Demon Slayer Mark)', 'Tanjiro (13th Form)', 'Tanjiro (Demon King)',
      'Nezuko (Base)', 'Nezuko (Awakened Form)', 'Nezuko (Sun Conqueror)',
      'Zenitsu (Base)', 'Zenitsu (Godspeed)', 'Inosuke (Base)', 'Inosuke (Beast Breathing)',
      'Giyu (Base)', 'Giyu (Marked)', 'Rengoku (Base)', 'Rengoku (Esoteric Art)',
      'Tengen (Base)', 'Tengen (Musical Score)', 'Shinobu',
      'Muichiro (Base)', 'Muichiro (Marked)', 'Mitsuri (Base)', 'Mitsuri (Marked)',
      'Obanai (Base)', 'Obanai (Marked)', 'Sanemi (Base)', 'Sanemi (Marked)',
      'Gyomei (Base)', 'Gyomei (Marked)',
      'Kanao', 'Genya (Base)', 'Genya (Demon Form)',
      'Muzan (Base)', 'Muzan (Combat Form)', 'Muzan (Baby Form)',
      'Kokushibo (Base)', 'Kokushibo (Long Sword)', 'Kokushibo (Monstrous Form)',
      'Doma', 'Akaza (Base)', 'Akaza (Compass Needle)',
      'Hantengu (Base)', 'Hantengu (Clones)', 'Zohakuten',
      'Gyokko (Base)', 'Gyokko (True Form)',
      'Gyutaro', 'Daki', 'Kaigaku', 'Enmu', 'Rui', 'Susamaru', 'Yahaba', 'Yoriichi Tsugikuni'
    ]
  },
  {
    slug: 'mha',
    name: 'My Hero Academia',
    isOfficial: true,
    roles: [
      { key: 'quirk_power', label: 'Quirk Power', icon: 'zap', description: 'Raw quirk output' },
      { key: 'quirk_control', label: 'Quirk Control', icon: 'sliders', description: 'Mastery of quirk' },
      { key: 'speed', label: 'Speed', icon: 'wind', description: 'Movement speed' },
      { key: 'strength', label: 'Strength', icon: 'anchor', description: 'Physical power' },
      { key: 'durability', label: 'Durability', icon: 'shield', description: 'Toughness' },
      { key: 'intelligence', label: 'Intelligence', icon: 'brain', description: 'Battle IQ' },
      { key: 'technique', label: 'Technique', icon: 'crosshair', description: 'Combat skill' },
      { key: 'stamina', label: 'Stamina', icon: 'battery-charging', description: 'Endurance' },
      { key: 'rescue', label: 'Rescue', icon: 'life-buoy', description: 'Saving civilians' },
    ],
    charNames: [
      'Deku (Base)', 'Deku (Full Cowl 5%)', 'Deku (Full Cowl 20%)', 'Deku (100%)', 'Deku (Blackwhip)', 'Deku (Dark Deku)', 'Deku (Gearshift/Apex)',
      'Bakugo (Base)', 'Bakugo (Cluster)', 'Bakugo (Strafe Panzer)',
      'Todoroki (Base)', 'Todoroki (Phosphor)',
      'Uraraka', 'Iida (Base)', 'Iida (Recipro Burst)', 'Tsuyu',
      'Kirishima (Base)', 'Kirishima (Unbreakable)', 'Yaoyorozu', 'Jiro', 'Kaminari',
      'Tokoyami (Base)', 'Tokoyami (Ragnarok)', 'Ashido', 'Mineta', 'Sero', 'Shoji', 'Ojiro', 'Aoyama', 'Shinsou',
      'Mirio (Base)', 'Mirio (Permeation)', 'Tamaki', 'Nejire',
      'All Might (Golden Age)', 'All Might (Weakened)', 'All Might (Armored Suit)',
      'Endeavor', 'Hawks', 'Best Jeanist', 'Edgeshot', 'Mirko',
      'Eraser Head', 'Present Mic', 'Midnight', 'Mt. Lady', 'Kamui Woods', 'Gran Torino',
      'Shigaraki (Base)', 'Shigaraki (Awakened)', 'Shigaraki (All For One Possessed)', 'Shigaraki (Apex Body)',
      'All For One (Base/Masked)', 'All For One (Prime/Rewind)',
      'Dabi', 'Toga (Base)', 'Toga (Sad Man\'s Parade)', 'Twice', 'Spinner', 'Mr. Compress', 'Kurogiri',
      'Overhaul (Base)', 'Overhaul (Fused)', 'Re-Destro (Base)', 'Re-Destro (100%)', 'Re-Destro (150%)',
      'Gentle Criminal', 'Lady Nagant', 'Muscular', 'Stain'
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for exhaustive seeding...');

    await Verse.deleteMany({});
    await Character.deleteMany({});
    console.log('Cleared existing Verses and Characters.');

    for (const verseData of versesData) {
      const { charNames, ...verseInfo } = verseData;
      
      const verse = new Verse(verseInfo);
      const savedVerse = await verse.save();

      const allRoleKeys = verse.roles.map(r => r.key);

      const charsToInsert = charNames.map(name => ({
        name: name,
        tags: [verseInfo.name], // Just a generic tag for now
        verseId: savedVerse._id,
        stats: generateStats(name, allRoleKeys)
      }));

      await Character.insertMany(charsToInsert);
      console.log(`Seeded ${charsToInsert.length} forms/characters for ${savedVerse.name}.`);

      await Verse.updateOne(
        { _id: savedVerse._id },
        { 
          characterCount: charsToInsert.length,
          roleCount: savedVerse.roles.length
        }
      );
    }

    console.log('Exhaustive seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
};

seedDB();
