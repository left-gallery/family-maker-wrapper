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
  });

  it("test all", async () => {
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

    // Alice mints 2 new tokens
    await aliceWrapper.mintAll(alice.address, 2);

    // Legacy tokens are owned by the wrapper. Wrapped tokens are owned by Alice.
    expect(await legacy.ownerOf(11)).equal(wrapper.address);
    expect(await wrapper.ownerOf(11)).equal(alice.address);
    expect(await wrapper.tokenURI(11)).equal(
      "https://left.gallery/tokens/metadata/family-maker/11"
    );
    expect(await legacy.ownerOf(12)).equal(wrapper.address);
    expect(await wrapper.ownerOf(12)).equal(alice.address);
    expect(await wrapper.tokenURI(12)).equal(
      "https://left.gallery/tokens/metadata/family-maker/12"
    );

    // Bob transfers a legacy token to Dan
    await bobLegacy.transferFrom(bob.address, dan.address, 5);
    expect(await legacy.ownerOf(5)).equal(dan.address);

    // Dan wraps the token
    await danLegacy["safeTransferFrom(address,address,uint256)"](
      dan.address,
      wrapper.address,
      5
    );
    expect(await legacy.ownerOf(5)).equal(wrapper.address);
    expect(await wrapper.ownerOf(5)).equal(dan.address);

    // Dan approves Erin to transfer the token
    await danWrapper.approve(erin.address, 5);

    // Erin transfers it to Bob
    await erinWrapper["safeTransferFrom(address,address,uint256)"](
      dan.address,
      bob.address,
      5
    );
    expect(await wrapper.ownerOf(5)).equal(bob.address);

    // Bob unwraps the token
    await bobWrapper.transferFrom(bob.address, legacy.address, 5);
    await expect(wrapper.ownerOf(5)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );
    expect(await legacy.ownerOf(5)).equal(bob.address);

    // Carol wraps all her tokens
    await carolLegacy["safeTransferFrom(address,address,uint256)"](
      carol.address,
      wrapper.address,
      7
    );
    await carolLegacy["safeTransferFrom(address,address,uint256)"](
      carol.address,
      wrapper.address,
      8
    );
    await carolLegacy["safeTransferFrom(address,address,uint256)"](
      carol.address,
      wrapper.address,
      9
    );
    await carolLegacy["safeTransferFrom(address,address,uint256)"](
      carol.address,
      wrapper.address,
      10
    );
    expect(await wrapper.ownerOf(7)).equal(carol.address);
    expect(await wrapper.ownerOf(8)).equal(carol.address);
    expect(await wrapper.ownerOf(9)).equal(carol.address);
    expect(await wrapper.ownerOf(10)).equal(carol.address);
  });
});
