# Family Maker restoration

**family maker** is a computer app by artist [Ryan Kuo](https://left.gallery/ryan-kuo), [distributed by left gallery](https://left.gallery/work/family-maker).

Original contract address: [0xe8f6f556d571d149a4156aeb642a3acc7e966fe8](https://etherscan.io/token/0xe8f6f556d571d149a4156aeb642a3acc7e966fe8).

Problem: the contract [is not indexed by OpenSea](https://opensea.io/assets?search[query]=0xe8f6f556d571d149a4156aeb642a3acc7e966fe8).

Solution: create a new contract to wrap the old one, and mint all remaining tokens.

## How does the wrapper works

- It wraps the original family maker token.
- It is a valid ERC-721 token.
- Transfer ownership to 0x0 to stop minting.

MIT License

## How to use it

Example, deploy on Rinkeby:

```
npx hardhat --network rinkeby deploy-legacy
# ...copy the legacy contract address

npx hardhat --network rinkeby deploy --legacy-address <legacy-contract-address>
# ...copy the wrapper contract address

npx hardhat verify --network rinkeby <wrapper-contract-address> <legacy-contract-address>
```
