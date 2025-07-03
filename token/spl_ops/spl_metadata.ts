import wallet from "../wallet/wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2Args,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
} from "@metaplex-foundation/umi";
import bs58 from "bs58";
import {rpc, mintKey} from "../uitls/connection";

const mint = publicKey(mintKey);

// Create a UMI connection
const umi = createUmi(rpc)
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(signer));

(async () => {
  try {
    // Start here
    let accounts: CreateMetadataAccountV3InstructionAccounts = {
      mint,
      mintAuthority: signer,
    };
    let data: DataV2Args = {
      name: "Ungrate",
      symbol: "UGF",
      uri: "https://amaranth-nearby-bat-484.mypinata.cloud/ipfs/bafkreicz2pvhqgqrpf3z2lolqfflz6zoxakl3fb4226hxmd3xed4o2y7oy",
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    };
    let args: CreateMetadataAccountV3InstructionArgs = {
      data,
      isMutable: true,
      collectionDetails: null,
    };
    let tx = createMetadataAccountV3(umi, {
      ...accounts,
      ...args,
    });
    let result = await tx.sendAndConfirm(umi);
    console.log("Tx signature: ", bs58.encode(result.signature));
  } catch (e) {
    console.error(`Error Creating Metadata account: ${e}`);
  }
})();

