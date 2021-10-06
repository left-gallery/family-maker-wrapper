import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { readFile } from "fs/promises";
import { ethers } from "hardhat";
const solc = require("solc").setupMethods(
  require("../solidity-compiler/soljson-v0.4.25+commit.59dbf8f1.js")
);

function layout(o: any, l: number = 0) {
  if (o.constructor == Object) {
    for (let k of Object.keys(o)) {
      console.log(`${"  ".repeat(l)}${k}`);
      layout(o[k], l + 1);
    }
  }
}

export async function deployLegacy(s: SignerWithAddress) {
  const source = await readFile("./legacy-contracts/FamilyMaker.sol", "utf8");
  const input = {
    language: "Solidity",
    sources: {
      "FamilyMaker.sol": {
        content: source,
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const leftGalleryToken = output.contracts["FamilyMaker.sol"].LeftGalleryToken;
  //layout(leftGalleryToken);
  const bytecode = leftGalleryToken.evm.bytecode;
  const abi = leftGalleryToken.abi;
  const factory = new ethers.ContractFactory(abi, bytecode, s);
  const contract = await factory.deploy();
  return contract;
}
