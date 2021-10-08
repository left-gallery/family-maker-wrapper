import { task } from "hardhat/config";
import { FamilyMakerWrapper__factory } from "../typechain";
import { mergeNetworkArtifact } from "./utils";

task("deploy", "Deploy FamilyMakerWrapper")
  .addParam("legacyAddress", "Address of the family maker contract to wrap")
  .setAction(async ({ legacyAddress }, hre) => {
    console.log("Deploy FamilyMakerWrapper, legacy contract:", legacyAddress);
    const wrapperFactory = (await hre.ethers.getContractFactory(
      "FamilyMakerWrapper"
    )) as FamilyMakerWrapper__factory;

    const wrapperContract = await wrapperFactory.deploy(legacyAddress);
    console.log("  Address", wrapperContract.address);
    const receipt = await wrapperContract.deployed();
    console.log("  Receipt", receipt.deployTransaction.hash);

    const { chainId } = await hre.ethers.provider.getNetwork();

    const config = {
      FamilyMakerWrapper: wrapperContract.address,
    };

    await mergeNetworkArtifact(chainId, config);
  });
