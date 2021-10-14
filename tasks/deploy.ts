import { formatUnits } from "@ethersproject/units";
import { task } from "hardhat/config";
import { FamilyMakerWrapper__factory } from "../typechain";
import { confirm, mergeNetworkArtifact } from "./utils";

task("deploy", "Deploy FamilyMakerWrapper")
  .addParam("legacyAddress", "Address of the family maker contract to wrap")
  .setAction(async ({ legacyAddress }, hre) => {
    const { chainId } = await hre.ethers.provider.getNetwork();
    console.log("Deploy FamilyMakerWrapper, legacy contract:", legacyAddress);
    const wrapperFactory = (await hre.ethers.getContractFactory(
      "FamilyMakerWrapper"
    )) as FamilyMakerWrapper__factory;

    const feeData = await hre.ethers.provider.getFeeData();
    if (feeData.maxFeePerGas) {
      console.log("  Max Fee:", formatUnits(feeData.maxFeePerGas, "gwei"));
    }
    if (feeData.maxPriorityFeePerGas) {
      console.log(
        "  Max Priority Fee:",
        formatUnits(feeData.maxPriorityFeePerGas, "gwei")
      );
    }
    if (feeData.gasPrice) {
      console.log("  Gas Price:", formatUnits(feeData.gasPrice, "gwei"));
    }

    if (!(await confirm("Deploy? (yes/no)"))) {
      return;
    }

    const wrapperContract = await wrapperFactory.deploy(legacyAddress);
    console.log("  Address", wrapperContract.address);
    const receipt = await wrapperContract.deployed();
    console.log("  Receipt", receipt.deployTransaction.hash);

    const config = {
      FamilyMakerWrapper: wrapperContract.address,
    };

    await mergeNetworkArtifact(chainId, config);
  });
