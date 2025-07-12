import wallet from "../wallet/wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

// Create a devnet connection
const umi = createUmi("https://api.devnet.solana.com");

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader({ address: "https://devnet.irys.xyz/" }));
umi.use(signerIdentity(signer));

(async () => {
  try {
    // Follow this JSON structure
    // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure
    // const image ="";
    const metadata = {
      name: "Rug Day It Is!",
      symbol: "RDJ",
      description: "This is a Turbin3 rug-day NFT dedicated to JEFF.",
      image:
        "https://gateway.irys.xyz/FXYaXnCzi8AkRsryA1CvgcLEtChtFre45ghinVzMDygL",
      attributes: [{ trait_type: "color", value: "20" }],
      properties: {
        files: [
          {
            type: "image/png",
            uri: "https://gateway.irys.xyz/FXYaXnCzi8AkRsryA1CvgcLEtChtFre45ghinVzMDygL",
          },
        ],
      },
      creators: [],
    };
    const metadataJson = Buffer.from(JSON.stringify(metadata));
    const metadataFile = createGenericFile(metadataJson, "metadata.json");

    // Upload metadata.json to Irys
    const [uri] = await umi.uploader.upload([metadataFile]);

    // ✅ Done
    console.log("Your metadata URI: ", uri);
  } catch (error) {
    console.log("Oops.. Something went wrong", error);
  }
})();
