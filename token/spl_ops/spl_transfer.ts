import { Keypair, PublicKey } from "@solana/web3.js";
import {
  transfer,
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  establishConnection,
  mintKey,
  tokenDecimals,
} from "../uitls/connection";
import wallet from "../wallet/wallet.json";

async function main() {
  const kp = Keypair.fromSecretKey(Uint8Array.from(wallet));
  console.log("Wallet Ready... ", kp.publicKey.toBase58());
  const mint = new PublicKey(mintKey);

  const transferTokens = async (to: PublicKey, amount: number) => {
    try {
      const connection = await establishConnection();

      const sourceAta = await getAssociatedTokenAddress(mint, kp.publicKey);
      const destinationAta = await getOrCreateAssociatedTokenAccount(
        connection,
        kp,
        mint,
        to
      );

      const amountToSend: bigint = BigInt(amount * tokenDecimals);
      const tx = await transfer(
        connection,
        kp,
        sourceAta,
        destinationAta.address,
        kp,
        amountToSend
      );
      console.log(amount, " Tokens Transferred ", tx);
    } catch (error) {
      console.log("Error transferring tokens: ", error);
    }
  };

  const TO = new PublicKey("AhaqZkm3CBJW8Fr2jxjWXa1bmueTyUaBF9GpRrWPzHdt");
  const AMOUNT = 1000;
  await transferTokens(TO, AMOUNT);
}

main();
