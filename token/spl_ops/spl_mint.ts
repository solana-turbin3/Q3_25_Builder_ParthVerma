import { Keypair, Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import {
  createMint,
  mintTo,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import wallet from "../wallet/wallet.json";
import * as fs from "fs";
import { mintKey, establishConnection } from "../uitls/connection";

async function main() {
  const kp = Keypair.fromSecretKey(Uint8Array.from(wallet));
  console.log("KeyPair Ready: ", kp.publicKey.toBase58());

  const mint = new PublicKey(mintKey);
  const tokenDecimals: number = 10_000_000;

  const mintTokensTo = async (to: PublicKey, amount: number) => {
    try {
      const connection = await establishConnection();

      const toAta = await getOrCreateAssociatedTokenAccount(
        connection,
        kp,
        mint,
        to
      );
      console.log("The ATA is: ", toAta.address.toBase58());
      console.log("The ATA has: ", toAta.amount.toString(), " tokens");

      console.log("Minting ", amount, " to your ATA");

      const amountToMint: bigint = BigInt(amount * tokenDecimals);
      const mintTx = await mintTo(
        connection,
        kp,
        mint,
        toAta.address,
        kp,
        amountToMint
      );

      console.log("Your tokens have been successfully minted...", mintTx);
    } catch (error) {
      console.log("Failed to Mint tokens: ", error);
    }
  };

  const AMOUNT: number = 100_000;
  const TO: PublicKey = kp.publicKey;

  await mintTokensTo(TO, AMOUNT);
}

main();
