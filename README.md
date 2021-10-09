# Family Maker Wrapper

**family maker** is a computer app by artist [Ryan Kuo](https://left.gallery/ryan-kuo), [distributed by left gallery](https://left.gallery/work/family-maker).

Original contract address: [0xe8f6f556d571d149a4156aeb642a3acc7e966fe8](https://etherscan.io/token/0xe8f6f556d571d149a4156aeb642a3acc7e966fe8).

Problem: the contract [is not indexed by OpenSea](https://opensea.io/assets?search[query]=0xe8f6f556d571d149a4156aeb642a3acc7e966fe8).

Solution: create a new contract to wrap the old one, and mint all remaining tokens.

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

- Legacy: deploy contract in Rinkeby at https://rinkeby.etherscan.io/address/0xA6A1342850c0493e1A528df189AB3C8f5c311F59
- Wrapper: deploy contract in Rinkeby at https://rinkeby.etherscan.io/address/0x6796AFF016478feb7afdd698e413841cF2916821
- Legacy: mint 4 tokens to 0x1979
- Legacy: transfer ownership to Wrapper
- Wrapper: mint/wrap tokens from 1 to 10 https://rinkeby.etherscan.io/tx/0x8d8e8a4a42c9356c1e1390a9e81e131e706a9b5dbcc0ea64aa06965430580a41
