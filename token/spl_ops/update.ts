import {
  updateV1,
  updateMetadataAccountV2,
  fetchMetadataFromSeeds,
} from "@metaplex-foundation/mpl-token-metadata";
import wallet from "../wallet/wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import { rpc, mintKey } from "../uitls/connection";
import base58 from "bs58";

function main() {
  const mint = publicKey(mintKey);

  // Create a UMI connection
  const umi = createUmi(rpc);
  const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
  const signer = createSignerFromKeypair(umi, keypair);
  umi.use(signerIdentity(signer));
  (async () => {
    try {
      const initialMetadata = await fetchMetadataFromSeeds(umi, { mint });
      console.log("The metadata is: ", initialMetadata.publicKey);

      const updateTx = updateMetadataAccountV2(umi, {
        metadata: initialMetadata.publicKey,
        updateAuthority: signer,
        data: {
          name: "Ungrate",
          symbol: "UGF",
          uri: "https://amaranth-nearby-bat-484.mypinata.cloud/ipfs/bafkreicz2pvhqgqrpf3z2lolqfflz6zoxakl3fb4226hxmd3xed4o2y7oy", // update to new metadata JSON
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable: true,
      });

      const result = await updateTx.sendAndConfirm(umi);
      const signature = base58.encode(result.signature);

      console.log("Successfully updated the metadata", signature);
      console.log(
        `🔗 Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`
      );
    } catch (error) {
      console.log("Failed to update the metadata: ", error);
    }
  })();
}

main();
