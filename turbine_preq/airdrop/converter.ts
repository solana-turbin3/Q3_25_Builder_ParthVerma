import bs58 from 'bs58';
import * as fs from 'fs';

console.log("Starting the process");
// REPLACE WITH YOUR PHANTOM PRIVATE KEY
const phantomPrivateKey = "YOUR_PRIVATE_KEY_HERE";

// Convert to Uint8Array format
const decoded = bs58.decode(phantomPrivateKey);
const walletArray = Array.from(decoded);

// Save to Turbin3-wallet.json
fs.writeFileSync('Turbin3-wallet.json', JSON.stringify(walletArray));
console.log('Turbin3 wallet saved!');
