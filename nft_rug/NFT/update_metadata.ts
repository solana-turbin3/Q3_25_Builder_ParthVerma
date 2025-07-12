import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import {
  mplTokenMetadata,
  fetchMetadataFromSeeds,
  updateV1,
} from "@metaplex-foundation/mpl-token-metadata";
import "dotenv";
import dotenv from "dotenv";
import wallet from "../wallet/wallet.json";
import base58 from "bs58";

dotenv.config();

function main() {
  // Create a devnet connection
  const rpc = process.env.RPC || "";
  console.log("RPC is: ", rpc);
  const umi = createUmi(rpc);
  const mint = publicKey("GcXhqtY7sBs7d9WWnocJgJ7ZiF9yMo5ZspFzBrzMvX1p");

  let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
  const signer = createSignerFromKeypair(umi, keypair);

  umi.use(signerIdentity(signer));
  umi.use(mplTokenMetadata());

  (async () => {
    try {
      const initialMetadata = await fetchMetadataFromSeeds(umi, { mint });
      console.log("Initial metadata: ", initialMetadata.symbol);
      const updateTx = updateV1(umi, {
        mint,
        authority: signer,
        data: {
          name: initialMetadata.name,
          symbol: "RDJ",
          uri: initialMetadata.uri,
          sellerFeeBasisPoints: initialMetadata.sellerFeeBasisPoints,
          creators: initialMetadata.creators,
        },
      });
      const result = await updateTx.sendAndConfirm(umi);
      const signature = base58.encode(result.signature);

      console.log("Successfully updated the metadata", signature);
      console.log(
        `🔗 Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`
      );
    } catch (error) {
      console.log("Error Updating metadata: ", error);
    }
  })();
}

main();
