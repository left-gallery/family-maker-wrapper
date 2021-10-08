import { ethers } from "hardhat";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { FamilyMakerWrapper__factory, FamilyMakerWrapper } from "../typechain";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { deployLegacy } from "./legacy";
import { Contract } from "@ethersproject/contracts";
import { AddressZero } from "@ethersproject/constants";

chai.use(solidity);
chai.use(chaiAsPromised);
const { expect } = chai;

describe("Family Maker Legacy", () => {
  let legacy: Contract;

  let alice: SignerWithAddress, bob: SignerWithAddress;
  let aliceLegacy: Contract;
  let bobLegacy: Contract;

  beforeEach(async () => {
    [alice, bob] = await ethers.getSigners();
    legacy = await deployLegacy(alice);
    aliceLegacy = legacy.connect(alice);
    bobLegacy = legacy.connect(bob);
  });

  it("is deployed", async () => {
    expect(legacy.address).not.equal(AddressZero);
  });

  it("has the correct metadata", async () => {
    expect(await legacy.name()).equal("left gallery token");
    expect(await legacy.symbol()).equal("lgt");
  });

  it("creates works", async () => {
    expect(await legacy.totalSupply()).equal(0);
    await expect(legacy.createWork(bob.address, "https://left.gallery/1"))
      .to.emit(legacy, "Transfer")
      .withArgs(AddressZero, bob.address, 1);
    expect(await legacy.totalSupply()).equal(1);
  });
});
