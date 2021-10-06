# Family Maker restoration

**family maker** is a computer app by artist [Ryan Kuo](https://left.gallery/work/family-maker), [distributed by left gallery](https://left.gallery/work/family-maker).

Original contract address: [0xe8f6f556d571d149a4156aeb642a3acc7e966fe8](https://etherscan.io/token/0xe8f6f556d571d149a4156aeb642a3acc7e966fe8).

Problem: the contract [doesn't work on opensea](https://opensea.io/assets?search[query]=0xe8f6f556d571d149a4156aeb642a3acc7e966fe8).

Solution: create a new contract to wrap the old one, and mint all remaining tokens.

## How does the wrapper works

- Transfer ownership to 0x0 to stop minting.
