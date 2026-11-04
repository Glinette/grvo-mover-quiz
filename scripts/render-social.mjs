// Optional art regeneration: npm install --no-save --package-lock=false sharp
// The production build uses the committed PNG and needs no image library.
import {createRequire} from 'node:module';
import {makeArt} from './art.mjs';
const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_MODULE || 'sharp');
await makeArt();
await sharp('public/assets/social-preview.svg').png().toFile('public/assets/social-preview.png');
console.log('Created 1200 × 630 social-preview.png');
