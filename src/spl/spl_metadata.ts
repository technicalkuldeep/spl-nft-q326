import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";

import wallet from "../../devnet-wallet.json";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2Args,
} from "@metaplex-foundation/mpl-token-metadata";

import bs58 from "bs58";

// Your SPL token mint address
const mint = publicKey(
  "D9WXV9wtsELdTZcCQKCaRGgrBESQjcESZ5dq5EUPe3MK",
);

const umi = createUmi("https://api.devnet.solana.com");

const keypair = umi.eddsa.createKeypairFromSecretKey(
  new Uint8Array(wallet),
);

const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

(async () => {
  try {
    const accounts: CreateMetadataAccountV3InstructionAccounts = {
      mint,
      mintAuthority: signer,
    };

    // Token metadata
    const data: DataV2Args = {
      name: "Srinath Token",
      symbol: "SRIN",
      uri: "",
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    };

    const args: CreateMetadataAccountV3InstructionArgs = {
      data,
      isMutable: true,
      collectionDetails: null,
    };

    // Create the metadata account
    const tx = createMetadataAccountV3(umi, {
      ...accounts,
      ...args,
    });

    // Send and confirm transaction
    const result = await tx.sendAndConfirm(umi);

    console.log(
      "Metadata transaction signature:",
      bs58.encode(Buffer.from(result.signature)),
    );

    console.log("Token metadata created successfully!");
    console.log("Mint address:", mint);
    console.log("Token name: Srinath Token");
    console.log("Token symbol: SRIN");
  } catch (error) {
    console.log("Error:", error);
  }
})();