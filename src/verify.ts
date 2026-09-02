import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchAsset, mplCore } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

umi.use(mplCore());

const mintAddress = publicKey(
  "D9WXV9wtsELdTZcCQKCaRGgrBESQjcESZ5dq5EUPe3MK",
);

const nftAddress = publicKey(
  "BxbxaRNxGYpc4FQyNNsu9tYT5hF7Yrm9SxFvdcMpzVgH",
);

const expectedNftName = "Srinath Updated NFT";

async function main() {
  let passed = 0;
  let failed = 0;

  function check(name: string, condition: boolean) {
    if (condition) {
      console.log(`PASS: ${name}`);
      passed++;
    } else {
      console.log(`FAIL: ${name}`);
      failed++;
    }
  }

  console.log("");
  console.log("========================================");
  console.log(" Solana Assignment Verification");
  console.log("========================================");
  console.log("");

  // Verify SPL token mint
  try {
    const mintAccount = await umi.rpc.getAccount(mintAddress);

    check(
      "SPL token mint exists on Devnet",
      mintAccount.exists,
    );
  } catch (error) {
    check("SPL token mint exists on Devnet", false);
    console.log("SPL verification error:", error);
  }

  // Verify Metaplex Core NFT
  try {
    const asset = await fetchAsset(umi, nftAddress);

    check(
      "Metaplex Core NFT exists on Devnet",
      true,
    );

    check(
      "NFT name was updated",
      asset.name === expectedNftName,
    );

    check(
      "NFT has metadata URI",
      typeof asset.uri === "string" && asset.uri.length > 0,
    );

    console.log("");
    console.log("NFT Asset:", nftAddress);
    console.log("NFT Name:", asset.name);
    console.log("NFT URI:", asset.uri);
  } catch (error) {
    check(
      "Metaplex Core NFT exists on Devnet",
      false,
    );

    console.log("NFT verification error:", error);
  }

  console.log("");
  console.log("----------------------------------------");
  console.log(`Tests passed: ${passed}`);
  console.log(`Tests failed: ${failed}`);
  console.log("----------------------------------------");

  if (failed > 0) {
    process.exit(1);
  }

  console.log("");
  console.log("ALL TESTS PASSED!");
  console.log("");
}

main().catch((error) => {
  console.error("Verification failed:", error);
  process.exit(1);
});