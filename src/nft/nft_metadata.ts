import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import wallet from "../../devnet-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

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
    // URI of the image that we uploaded to Irys
    const image =
      "https://gateway.irys.xyz/2ttotKkCP6roFpVvP2wQsb8JkjvLRHSGwYFsCKLRifLc";

    // NFT metadata
    const metadata = {
      name: "Srinath NFT",
      description: "My first NFT created using Metaplex Core.",
      image: image,
      attributes: [
        {
          trait_type: "Creator",
          value: "Srinath",
        },
        {
          trait_type: "Type",
          value: "MPL Core NFT",
        },
      ],
    };

    // Convert metadata object into a JSON file
    const metadataFile = createGenericFile(
      JSON.stringify(metadata),
      "metadata.json",
      {
        contentType: "application/json",
      },
    );

    // Upload metadata JSON to Irys
    const [myUri] = await umi.uploader.upload([metadataFile]);

    console.log("Metadata URI:", myUri);
  } catch (error) {
    console.log("Error:", error);
  }
})();