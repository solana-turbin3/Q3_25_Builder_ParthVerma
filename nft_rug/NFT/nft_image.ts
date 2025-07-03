import wallet from "../wallet/wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";
import { getEditionMarkerGpaBuilder } from "@metaplex-foundation/mpl-token-metadata";
import path from "path";
import "dotenv";
import dotenv from "dotenv";

dotenv.config();

// Create a devnet connection
const rpc = process.env.RPC || "";
const umi = createUmi(rpc);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

// umi.use(irysUploader());
umi.use(irysUploader({ address: "https://devnet.irys.xyz/" }));
umi.use(signerIdentity(signer));

(async () => {
  try {
    //1. Load image
    const imagePath = path.join(__dirname, "../images/generug.png");
    const imageFile = await readFile(imagePath);
    //2. Convert image to generic file.
    const geneFile = await createGenericFile(imageFile, "generug.png", {
      contentType: "image/png",
    });
    //3. Upload image
    // const image = ???
    const [myUri] = await umi.uploader.upload([geneFile]);
    console.log("My Image URI is: ", myUri);
    // console.log("Your image URI: ", myUri);
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
})();
