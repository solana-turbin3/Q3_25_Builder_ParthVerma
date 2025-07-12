import { Connection, Keypair, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import wallet from "./dev-wallet.json";

const keypair = Keypair.fromSecretKey(Uint8Array.from(wallet));
console.log("Keypair fetched: ", keypair.publicKey.toBase58());
const connection = new Connection(clusterApiUrl("devnet"));

console.log("Connection established: ", connection);

(async () => {
  try {
    const txhash = await connection.requestAirdrop(
      keypair.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    const latestBlockHash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature: txhash,
      ...latestBlockHash
    });
    console.log(`Success! TX: https://explorer.solana.com/tx/${txhash}?cluster=devnet`);
  } catch (e) {
    console.error(`Error: ${e}`);
  }
})();
