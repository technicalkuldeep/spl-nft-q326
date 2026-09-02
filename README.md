# Solana SPL Token & NFT Assignment

This repository contains my implementation of the Solana SPL Token and Metaplex Core NFT assignment.

The project was completed on Solana Devnet for practice and learning purposes.

## Requirements Completed

### Mandatory Tasks

- [x] Create and initialize an SPL token mint
- [x] Add metadata to the SPL token
- [x] Mint SPL tokens
- [x] Transfer SPL tokens to another wallet
- [x] Upload an NFT image to Irys
- [x] Upload NFT metadata to Irys
- [x] Mint an NFT using Metaplex Core
- [x] Update the NFT name and metadata as the update authority

### Optional Tasks

The following optional tasks were not required for the submission:

- [ ] Transfer NFT ownership
- [ ] Permanently destroy the NFT and reclaim rent

## Technologies Used

- Solana Devnet
- TypeScript
- Node.js
- `@solana/kit`
- `@solana-program/token`
- Metaplex Core
- Metaplex Token Metadata
- Umi
- Irys

## Project Structure

```text
spl-nft-q326/
├── assets/
│   └── Srinath.png
│
├── src/
│   ├── nft/
│   │   ├── nft_image.ts
│   │   ├── nft_metadata.ts
│   │   ├── nft_mint.ts
│   │   └── nft_update.ts
│   │
│   └── spl/
│       ├── spl_init.ts
│       ├── spl_metadata.ts
│       ├── spl_mint.ts
│       └── spl_transfer.ts
│
├── .gitignore
├── package.json
├── README.md
├── package-lock.json
└── tsconfig.json