import { clusterApiUrl, Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { Program, Wallet, AnchorProvider } from "@coral-xyz/anchor";
import { IDL } from "./programs/Turbin3_prereq";
import wallet from "./Turbin3-wallet.json";

const MPL_CORE_PROGRAM_ID = new PublicKey("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d");
const COLLECTION_ADDRESS = new PublicKey("5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2");

// Initialize
const keypair = Keypair.fromSecretKey(Uint8Array.from(wallet));
const connection = new Connection(clusterApiUrl("devnet"));
const provider = new AnchorProvider(connection, new Wallet(keypair), { commitment: "confirmed" });
const program = new Program(IDL, provider);

async function main() {
  // Create PDA for enrollment account
  const [enrollmentPda, enrollmentBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("prereqs"), keypair.publicKey.toBuffer()],
    program.programId
  );

  const [authorityPda, authBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("collection"), COLLECTION_ADDRESS.toBuffer()],
    program.programId
  );

  console.log("The authority pda is: ", authorityPda.toBase58())

  // Initialize Account
  try {
    const initTx = await program.methods.initialize("infoparth") // YOUR GITHUB
      .accounts({
        user: keypair.publicKey,
        account: enrollmentPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    console.log(`Init TX: https://explorer.solana.com/tx/${initTx}?cluster=devnet`);
  } catch (e) {
    console.error("Init failed:", e);
    return;
  }

  // Mint NFT
  try {
    const mintKeypair = Keypair.generate();

    const mintTx = await program.methods.submitTs()
      .accounts({
        user: keypair.publicKey,
        account: enrollmentPda,
        mint: mintKeypair.publicKey,
        collection: COLLECTION_ADDRESS,
        authority: authorityPda,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([mintKeypair])
      .rpc();

    console.log(`Mint TX: https://explorer.solana.com/tx/${mintTx}?cluster=devnet`);
    console.log("NFT Minted! Enrollment complete!");
  } catch (e) {
    console.error("Mint failed:", e);
  }
}

main();
