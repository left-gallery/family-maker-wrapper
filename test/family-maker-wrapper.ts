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

describe("Family Maker Wrapper", () => {
  // Contracts
  let legacy: Contract;
  let wrapper: FamilyMakerWrapper;
  let notLegacy: Contract;

  // Alice is the owner of everything
  let alice: SignerWithAddress;
  let aliceLegacy: Contract;
  let aliceNotLegacy: Contract;
  let aliceWrapper: FamilyMakerWrapper;

  // Bob is a collector
  let bob: SignerWithAddress;
  let bobLegacy: Contract;
  let bobWrapper: FamilyMakerWrapper;

  // Carol is a collector
  let carol: SignerWithAddress;
  let carolLegacy: Contract;
  let carolWrapper: FamilyMakerWrapper;

  // Dan is a collector
  let dan: SignerWithAddress;
  let danLegacy: Contract;
  let danWrapper: FamilyMakerWrapper;

  // Erin is a collector
  let erin: SignerWithAddress;
  let erinLegacy: Contract;
  let erinWrapper: FamilyMakerWrapper;

  beforeEach(async () => {
    [alice, bob, carol, dan, erin] = await ethers.getSigners();

    // Deploy the reference family maker contract from Alice's account
    legacy = await deployLegacy(alice);

    // Deploy another family maker contract from Alice's account. This is used
    // to simulate another contract that will try to impersonate the original
    // family maker contract
    notLegacy = await deployLegacy(alice);

    // Deploy the wrapper contract from Alice's account
    const FamilyMakerWrapperFactory = (await ethers.getContractFactory(
      "FamilyMakerWrapper",
      alice
    )) as FamilyMakerWrapper__factory;
    // Pass the address of the legacy family maker contract to the wrapper
    wrapper = await FamilyMakerWrapperFactory.deploy(legacy.address);
    await wrapper.deployed();

    // Connect all accounts so it's easier to use them later.
    aliceLegacy = legacy.connect(alice);
    bobLegacy = legacy.connect(bob);
    carolLegacy = legacy.connect(carol);
    danLegacy = legacy.connect(dan);
    erinLegacy = legacy.connect(erin);

    aliceNotLegacy = notLegacy.connect(alice);

    aliceWrapper = wrapper.connect(alice);
    bobWrapper = wrapper.connect(bob);
    carolWrapper = wrapper.connect(carol);
    danWrapper = wrapper.connect(dan);
    erinWrapper = wrapper.connect(erin);

    // Mint some tokens in the legacy contract for Alice.
    await legacy.createWork(alice.address, "https://left.gallery/1");
    await legacy.createWork(alice.address, "https://left.gallery/2");
    await legacy.createWork(alice.address, "https://left.gallery/3");
    await legacy.createWork(alice.address, "https://left.gallery/4");

    // Mint some tokens in the legacy contract for Bob.
    await legacy.createWork(bob.address, "https://left.gallery/5");
    await legacy.createWork(bob.address, "https://left.gallery/6");

    // Mint some tokens in the legacy contract for Carol.
    await legacy.createWork(carol.address, "https://left.gallery/7");
    await legacy.createWork(carol.address, "https://left.gallery/8");
    await legacy.createWork(carol.address, "https://left.gallery/9");
    await legacy.createWork(carol.address, "https://left.gallery/10");

    // At this point Alice gives full control to the wrapper over the legacy
    // contract. This allows the wrapper to mint legacy tokens.
    await aliceLegacy.transferOwnership(wrapper.address);
  });

  /**
   * Mint tokens in the wrapper contract. The wrapper mints them in the legacy
   * contract and keeps custody of them.
   */
  it("mints and wraps", async () => {
    // Note: the legacy contract already has tokens 1 to 10.
    await expect(aliceWrapper.mintAll(dan.address, 3))
      //.to.emit(legacy, "Transfer")
      //.withArgs(AddressZero, wrapper.address, 11)
      //.to.emit(legacy, "Transfer")
      //.withArgs(AddressZero, wrapper.address, 12)
      //.to.emit(legacy, "Transfer")
      //.withArgs(AddressZero, wrapper.address, 13)
      .to.emit(wrapper, "Transfer")
      .withArgs(AddressZero, dan.address, 11)
      .to.emit(wrapper, "Transfer")
      .withArgs(AddressZero, dan.address, 12)
      .to.emit(wrapper, "Transfer")
      .withArgs(AddressZero, dan.address, 13);

    // Legacy tokens are owned by the wrapper. Wrapped tokens are owned by collectors.
    expect(await legacy.ownerOf(11)).equal(wrapper.address);
    expect(await wrapper.ownerOf(11)).equal(dan.address);
    expect(await legacy.ownerOf(12)).equal(wrapper.address);
    expect(await wrapper.ownerOf(12)).equal(dan.address);
    expect(await legacy.ownerOf(13)).equal(wrapper.address);
    expect(await wrapper.ownerOf(13)).equal(dan.address);
  });

  it("respects the max supply", async () => {
    // Note: the legacy contract already has tokens 1 to 10.
    expect(await legacy.totalSupply()).equal(10);
    await expect(aliceWrapper.mintAll(alice.address, 88)).to.revertedWith(
      "FMW: amount exceedes supply"
    );
    expect(await legacy.totalSupply()).equal(10);
    await expect(aliceWrapper.mintAll(alice.address, 78));
    expect(await legacy.totalSupply()).equal(88);
    await expect(aliceWrapper.mintAll(alice.address, 1)).to.revertedWith(
      "FMW: amount exceedes supply"
    );
    expect(await legacy.totalSupply()).equal(88);
  });

  it("returns the right URI", async () => {
    // Note: the legacy contract already has tokens 1 to 10.
    await aliceWrapper.mintAll(alice.address, 3);
    expect(await wrapper.tokenURI(10)).equal("https://left.gallery/10");
    expect(await wrapper.tokenURI(11)).equal(
      "https://left.gallery/tokens/metadata/family-maker/11"
    );
    expect(await wrapper.tokenURI(12)).equal(
      "https://left.gallery/tokens/metadata/family-maker/12"
    );
    expect(await wrapper.tokenURI(13)).equal(
      "https://left.gallery/tokens/metadata/family-maker/13"
    );
  });

  it("wraps a token on transfer", async () => {
    // Alice safeTransferFrom her token from the legacy contract to the wrapper
    // contract. The wrapper contract wraps the token.
    expect(await legacy.ownerOf(1)).equal(alice.address);
    await expect(
      aliceLegacy["safeTransferFrom(address,address,uint256)"](
        alice.address,
        wrapper.address,
        1
      )
    )
      .to.emit(legacy, "Transfer")
      .withArgs(alice.address, wrapper.address, 1);
    expect(await legacy.ownerOf(1)).equal(wrapper.address);
    expect(await wrapper.ownerOf(1)).equal(alice.address);

    // Bob calls `safeTransferFrom` on his token to transfer it form the legacy
    // contract to the wrapper contract. The wrapper contract wraps the token.
    expect(await legacy.ownerOf(5)).equal(bob.address);
    await expect(
      bobLegacy["safeTransferFrom(address,address,uint256)"](
        bob.address,
        wrapper.address,
        5
      )
    )
      .to.emit(legacy, "Transfer")
      .withArgs(bob.address, wrapper.address, 5);
    expect(await legacy.ownerOf(5)).equal(wrapper.address);
    expect(await wrapper.ownerOf(5)).equal(bob.address);

    // Carol calls `approve` on her token to allow Erin to transfer it. Erin
    // transfers the token to the wrapper contract.
    expect(await legacy.ownerOf(7)).equal(carol.address);
    await carolLegacy.approve(erin.address, 7);
    await expect(
      erinLegacy["safeTransferFrom(address,address,uint256)"](
        carol.address,
        wrapper.address,
        7
      )
    )
      .to.emit(legacy, "Transfer")
      .withArgs(carol.address, wrapper.address, 7);
    expect(await legacy.ownerOf(7)).equal(wrapper.address);
    expect(await wrapper.ownerOf(7)).equal(carol.address);
  });

  /**
   * A wrapped token can be unwrapped sending it back to the legacy contract.
   */
  it("unwraps a token on safeTransferFrom to legacy contract", async () => {
    // Carol has a token in the legacy contract
    expect(await legacy.ownerOf(10)).equal(carol.address);

    // She wraps the token
    await carolLegacy["safeTransferFrom(address,address,uint256)"](
      carol.address,
      wrapper.address,
      10
    );

    // The legacy token is owned by the wrapper
    expect(await legacy.ownerOf(10)).equal(wrapper.address);
    // The wrapped token is owned by Carol
    expect(await wrapper.ownerOf(10)).equal(carol.address);

    // Carol sends the wrapped token back to the legacy contract to unwrap it.
    await carolWrapper["safeTransferFrom(address,address,uint256)"](
      carol.address,
      legacy.address,
      10
    );

    // The legacy token is owned by Carol
    expect(await legacy.ownerOf(10)).equal(carol.address);
    // The wrapped token doesn't exist anymore.
    await expect(wrapper.ownerOf(10)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );
  });

  /**
   * A wrapped token can be unwrapped sending it back to the legacy contract.
   */
  it("unwraps a token on transferFrom to legacy contract", async () => {
    // Carol has a token in the legacy contract
    expect(await legacy.ownerOf(10)).equal(carol.address);

    // She wraps the token
    await carolLegacy["safeTransferFrom(address,address,uint256)"](
      carol.address,
      wrapper.address,
      10
    );

    // The legacy token is owned by the wrapper
    expect(await legacy.ownerOf(10)).equal(wrapper.address);
    // The wrapped token is owned by Carol
    expect(await wrapper.ownerOf(10)).equal(carol.address);

    // Carol sends the wrapped token back to the legacy contract to unwrap it.
    await carolWrapper.transferFrom(carol.address, legacy.address, 10);

    // The legacy token is owned by Carol
    expect(await legacy.ownerOf(10)).equal(carol.address);
    // The wrapped token doesn't exist anymore.
    await expect(wrapper.ownerOf(10)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );
  });

  it("reverts on transfer from any other contract", async () => {
    await aliceNotLegacy.createWork(alice.address, `https://left.gallery/1`);
    await expect(
      aliceNotLegacy["safeTransferFrom(address,address,uint256)"](
        alice.address,
        wrapper.address,
        1
      )
    ).to.be.revertedWith("FMW: Invalid contract");
  });

  it("allows to transfer", async () => {
    // Note: the legacy contract already has tokens 1 to 10.
    /*
    await expect(aliceWrapper.transferFrom(alice.address, bob.address, 1))
      .to.emit(legacy, "Transfer")
      .withArgs(alice.address, bob.address, 1);
      */
  });
});
