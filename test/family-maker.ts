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

describe("Family Maker", () => {
  let legacy: Contract;
  let wrapper: FamilyMakerWrapper;
  let alice: SignerWithAddress, bob: SignerWithAddress;
  let aliceLegacy: Contract;
  let aliceWrapper: FamilyMakerWrapper;
  let bobLegacy: Contract;
  let bobWrapper: FamilyMakerWrapper;

  beforeEach(async () => {
    [alice, bob] = await ethers.getSigners();
    legacy = await deployLegacy(alice);

    const FamilyMakerWrapperFactory = (await ethers.getContractFactory(
      "FamilyMakerWrapper",
      alice
    )) as FamilyMakerWrapper__factory;

    wrapper = await FamilyMakerWrapperFactory.deploy(legacy.address);
    await wrapper.deployed();

    aliceLegacy = legacy.connect(alice);
    aliceWrapper = wrapper.connect(alice);

    bobLegacy = legacy.connect(bob);
    bobWrapper = wrapper.connect(bob);
  });

  describe("Legacy", async () => {
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

  describe("Wrapper", async () => {
    beforeEach(async () => {
      await aliceLegacy.transferOwnership(wrapper.address);
    });

    it("allows to mint", async () => {
      await aliceWrapper.mintAll(100);
    });
  });
});
