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
  let impostor: Contract;

  let alice: SignerWithAddress, bob: SignerWithAddress;
  let aliceLegacy: Contract;
  let aliceImpostor: Contract;
  let aliceWrapper: FamilyMakerWrapper;
  let bobLegacy: Contract;
  let bobWrapper: FamilyMakerWrapper;

  beforeEach(async () => {
    [alice, bob] = await ethers.getSigners();
    legacy = await deployLegacy(alice);
    impostor = await deployLegacy(alice);

    const FamilyMakerWrapperFactory = (await ethers.getContractFactory(
      "FamilyMakerWrapper",
      alice
    )) as FamilyMakerWrapper__factory;

    wrapper = await FamilyMakerWrapperFactory.deploy(legacy.address);
    await wrapper.deployed();

    aliceLegacy = legacy.connect(alice);
    aliceImpostor = impostor.connect(alice);
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
      // Premint some tokens in the legacy contract
      for (let i = 0; i < 10; i++) {
        await legacy.createWork(alice.address, `https://left.gallery/${i + 1}`);
      }
      // Give ownership to the wrapper contract to allow it to mint new tokens.
      await aliceLegacy.transferOwnership(wrapper.address);
      //await aliceLegacy.setApprovalForAll(wrapper.address, true);
    });

    it("wraps a token transfer", async () => {
      await expect(
        aliceLegacy["safeTransferFrom(address,address,uint256)"](
          alice.address,
          wrapper.address,
          1
        )
      )
        .to.emit(legacy, "Transfer")
        .withArgs(alice.address, wrapper.address, 1);
      /*
        .to.emit(wrapper, "Transfer")
        .withArgs(AddressZero, alice.address, 1);
        */

      expect(await legacy.ownerOf(1)).equal(wrapper.address);
      expect(await wrapper.ownerOf(1)).equal(alice.address);
    });

    it("unwraps a token on transfer to legacy contract", async () => {
      // Check precondition
      expect(await legacy.ownerOf(1)).equal(alice.address);

      // Wrap the token
      await aliceLegacy["safeTransferFrom(address,address,uint256)"](
        alice.address,
        wrapper.address,
        1
      );

      // Check Wrapping
      expect(await legacy.ownerOf(1)).equal(wrapper.address);
      expect(await wrapper.ownerOf(1)).equal(alice.address);

      await aliceWrapper["safeTransferFrom(address,address,uint256)"](
        alice.address,
        legacy.address,
        1
      );
      //await aliceWrapper.transferFrom(alice.address, legacy.address, 1);
    });

    it("reverts on transfer from a non legacy contract", async () => {
      await aliceImpostor.createWork(alice.address, `https://left.gallery/1`);
      await expect(
        aliceImpostor["safeTransferFrom(address,address,uint256)"](
          alice.address,
          wrapper.address,
          1
        )
      ).to.be.revertedWith("FMW: Invalid contract");
    });

    it("mints and wraps", async () => {
      // Note: the legacy contract already has tokens 1 to 10.
      /*
      const r = await aliceWrapper.mintAll(alice.address, 3);
      const rr = await r.wait(1);
      const events = rr.events!;
      console.log(events);
      for (let e of events) {
        console.log(e.args);
      }
      console.log("legacy", legacy.address);
      console.log("wrapper", wrapper.address);
      */
      await expect(aliceWrapper.mintAll(alice.address, 3))
        //.to.emit(legacy, "Transfer")
        //.withArgs(AddressZero, wrapper.address, 11)
        //.to.emit(legacy, "Transfer")
        //.withArgs(AddressZero, wrapper.address, 12)
        //.to.emit(legacy, "Transfer")
        //.withArgs(AddressZero, wrapper.address, 13)
        .to.emit(wrapper, "Transfer")
        .withArgs(AddressZero, alice.address, 11)
        .to.emit(wrapper, "Transfer")
        .withArgs(AddressZero, alice.address, 12)
        .to.emit(wrapper, "Transfer")
        .withArgs(AddressZero, alice.address, 13);
      expect(await aliceLegacy.ownerOf(11)).equal(wrapper.address);
      expect(await aliceWrapper.ownerOf(11)).equal(alice.address);
      expect(await aliceLegacy.ownerOf(12)).equal(wrapper.address);
      expect(await aliceWrapper.ownerOf(12)).equal(alice.address);
      expect(await aliceLegacy.ownerOf(13)).equal(wrapper.address);
      expect(await aliceWrapper.ownerOf(13)).equal(alice.address);
    });

    it("allows to transfer", async () => {
      // Note: the legacy contract already has tokens 1 to 10.
      await expect(aliceWrapper.transferFrom(alice.address, bob.address, 1))
        .to.emit(legacy, "Transfer")
        .withArgs(alice.address, bob.address, 1);
    });
  });
});
