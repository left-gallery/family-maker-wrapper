// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IFamilyMaker.sol";

contract FamilyMakerWrapper is ERC721, Ownable{
    IFamilyMaker public familyMaker;

    uint8 constant SUPPLY = 88;

    constructor(address _familyMakerAddr) ERC721("left gallery familymaker", "lgft") {
        familyMaker = IFamilyMaker(_familyMakerAddr);
    }

    function mintAll(uint8 amount) external onlyOwner {
        require(familyMaker.totalSupply() + amount <= SUPPLY, "FMW: amount exceedes supply");
    }

}