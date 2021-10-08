import { task } from "hardhat/config";
import { mergeNetworkArtifact } from "./utils";
import { readFile } from "fs/promises";
import { join } from "path";

const solc = require("solc").setupMethods(
  require("../solidity-compiler/soljson-v0.4.26+commit.4563c3fc.js")
);

task("deploy-legacy", "Deploy FamilyMakerLegacy", async (_, hre) => {
  console.log("Deploy FamilyMakerLegacy");
  const [owner] = await hre.ethers.getSigners();
  const source = await readFile(
    join(__dirname, "../legacy-contracts/FamilyMaker.sol"),
    "utf8"
  );

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
  const bytecode = leftGalleryToken.evm.bytecode;
  const abi = leftGalleryToken.abi;
  const factory = new hre.ethers.ContractFactory(abi, bytecode, owner);
  const contract = await factory.deploy();
  console.log("  Address", contract.address);
  const receipt = await contract.deployed();
  console.log("  Receipt", receipt.deployTransaction.hash);

  const { chainId } = await hre.ethers.provider.getNetwork();

  const config = {
    FamilyMakerLegacy: contract.address,
  };

  await mergeNetworkArtifact(chainId, config);
});
