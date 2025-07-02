import { Keypair } from "@solana/web3.js";
import * as fs from 'fs';

function main() {
  const kp = Keypair.generate();
  console.log(`Public Key: ${kp.publicKey.toBase58()}`);

  // Save dev wallet
  fs.writeFileSync('dev-wallet.json', JSON.stringify(Array.from(kp.secretKey)));
  console.log('Dev wallet saved to dev-wallet.json');
}

main();
