import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";

import wallet from "../../devnet-wallet.json";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(
  new Uint8Array(wallet),
);

const signer = createSignerFromKeypair(umi, keypair);

umi.use(
  irysUploader({
    address: "https://devnet.irys.xyz/",
  }),
);

umi.use(signerIdentity(signer));

(async () => {
  try {
    // Read the image from the assets folder
    const image = await readFile("./assets/Srinath.png");

    // Convert the image into a GenericFile
    const file = createGenericFile(image, "Srinath.png", {
      contentType: "image/png",
    });

    // Upload the image to Irys
    const [myUri] = await umi.uploader.upload([file]);

    // Print the image URI
    console.log("Your image URI: ", myUri);
  } catch (error) {
    console.log(error);
  }
})();