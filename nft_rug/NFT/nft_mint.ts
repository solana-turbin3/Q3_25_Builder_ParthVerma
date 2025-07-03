import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
  generateSigner,
  percentAmount,
} from "@metaplex-foundation/umi";
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import wallet from "../wallet/wallet.json";
import base58 from "bs58";
import dotenv from "dotenv";

dotenv.config();

// Load RPC endpoint from .env
const RPC_ENDPOINT = process.env.RPC || "https://api.devnet.solana.com";
const umi = createUmi(RPC_ENDPOINT);

// Set up signer from wallet
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);

// Register identity and plugins
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata());

// Generate a new keypair for the mint address
const mint = generateSigner(umi);

(async () => {
  try {
    // Create NFT
    const tx = createNft(umi, {
      mint,
      name: "Rugg... NFT",
      uri: "https://gateway.irys.xyz/Hg7ozC1bpCw3Tq8azBi4kP7YaUxo2aQLyd3q6UGWfFSX",
      sellerFeeBasisPoints: percentAmount(5),
    });

    const result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);

    console.log("✅ Successfully Minted!");
    console.log(
      `🔗 Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
    console.log("Mint Address:", mint.publicKey.toString());
  } catch (error) {
    console.error("❌ Minting failed:", error);
  }
})();
