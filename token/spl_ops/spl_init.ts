import {
  Connection,
  Commitment,
  Keypair,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import wallet from "../wallet/wallet.json";
import * as fs from "fs";
import { establishConnection } from "../uitls/connection";

function main() {
  const commitment: Commitment = "confirmed";
  const kp = Keypair.fromSecretKey(Uint8Array.from(wallet));
  console.log("Wallet Ready... :", kp.publicKey.toBase58());

  (async () => {
    try {
      const connection = await establishConnection();
      const mint = await createMint(connection, kp, kp.publicKey, null, 7);

      console.log("---------------------------------------------------");
      console.log("The mint account is: ", mint.toBase58());
      console.log("---------------------------------------------------");

      fs.writeFileSync("spl_ops/mint.txt", mint.toString());
      console.log("Writing file to mint.txt");
    } catch (error) {
      console.log("Error Creating the mint ", error);
    }
  })();
}

main();
