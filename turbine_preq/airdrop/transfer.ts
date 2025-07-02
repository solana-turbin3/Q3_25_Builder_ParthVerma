import { Transaction, SystemProgram, Connection, Keypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction, PublicKey, clusterApiUrl } from "@solana/web3.js";
import wallet from "./dev-wallet.json";

const from = Keypair.fromSecretKey(Uint8Array.from(wallet));
const to = new PublicKey("njPxux8VEXbQ2yPCVfhMJgqqrci4QUmFgz35tDHPL4a")
const connection = new Connection(clusterApiUrl("devnet"));


(async () => {
  try {

    const balance = await connection.getBalance(from.publicKey)

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports: balance, // 0.1 SOL
      })
    );

    const blockhash = await connection.getLatestBlockhash('confirmed')


    console.log("The latest blockhash is: ", blockhash)
    transaction.recentBlockhash = blockhash.blockhash;
    transaction.feePayer = from.publicKey;

    const fee = (await
      connection.getFeeForMessage(transaction.compileMessage(),
        'confirmed')).value

    console.log("The fee for the tx is: ", fee)

    transaction.instructions.pop();

    if (!fee)
      return

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: from.publicKey,
        toPubkey: to,
        lamports: balance - fee,
      })
    );

    transaction.recentBlockhash = blockhash.blockhash;
    transaction.feePayer = from.publicKey;


    const signature = await sendAndConfirmTransaction(connection, transaction, [from]);
    console.log(`TX: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  } catch (e) {
    console.error(`Error: ${e}`);
  }
})();
