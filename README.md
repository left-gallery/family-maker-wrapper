# Family Maker Wrapper

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

## Rinkeby testing logs

- Legacy: deploy contract in Rinkeby at 0x666d599ff1f5fceB8A278825538Df1F7F5C72621
- Wrapper: deploy contract in Rinkeby at 0xD8940552648071060294EE36aaF969D7F06287D1
- Legacy: mint token 1 to 0x1979
- Legacy: transfer token 1 to Wrapper https://rinkeby.etherscan.io/tx/0xaba5747834ee3f87c4ae86197cf74365be5016ae0000a670c905980d6d51267f
- Collection appears in opensea https://testnets.opensea.io/collection/left-gallery-familymaker
- Token is indexed by opensea https://testnets.opensea.io/assets/0xd8940552648071060294ee36aaf969d7f06287d1/1
