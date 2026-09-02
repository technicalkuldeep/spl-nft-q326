import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../devnet-wallet.json";
import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import {
  mplCore,
  fetchAsset,
  update,
} from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(
  new Uint8Array(wallet),
);

const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));
umi.use(mplCore());

(async () => {
  try {
    // Address of the NFT we created in nft_mint.ts
    const assetAddress =
      "BxbxaRNxGYpc4FQyNNsu9tYT5hF7Yrm9SxFvdcMpzVgH";

    // Metadata URI for the NFT
    const metadataUri =
      "https://gateway.irys.xyz/BvMeLYujeXCA1nhvLNQ59Z2bKvv6fTGizhRmJwcKbGDc";

    // Fetch the existing MPL Core asset
    const asset = await fetchAsset(umi, assetAddress);

    console.log("Current NFT name:", asset.name);
    console.log("Current NFT URI:", asset.uri);

    // Update the NFT
    const tx = await update(umi, {
      asset: asset,
      name: "Srinath Updated NFT",
      uri: metadataUri,
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];

    console.log("NFT updated successfully!");
    console.log(`Signature: ${signature}`);
    console.log(`Asset address: ${assetAddress}`);
    console.log("New NFT name: Srinath Updated NFT");
    console.log(`New metadata URI: ${metadataUri}`);
  } catch (error) {
    console.log("Error updating NFT:", error);
  }
})();