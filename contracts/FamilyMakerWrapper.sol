// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./IFamilyMaker.sol";

contract FamilyMakerWrapper is ERC721, Ownable {
    using Address for address;
    using Strings for uint256;

    IFamilyMaker public familyMaker;

    uint8 constant SUPPLY = 88;

    /**
     * @dev Initialize the contract by setting the address of the original
     * *family maker* contract.
     *
     */
    constructor(address _familyMakerAddr)
        ERC721("left gallery familymaker", "lgfm")
    {
        familyMaker = IFamilyMaker(_familyMakerAddr);
    }

    /**
     * @dev Custom {IERC721Metadata-tokenURI} method that takes the URI from the
     * original *family maker* contract.
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return familyMaker.tokenURI(tokenId);
    }

    /**
     * @dev Custom {IERC721Receiver-onERC721Received} method to **wrap** tokens
     * from the original *family maker* contract. The method:
     *
     * 1. Checks if the sender is the original contract.
     * 2. If so, it mints a new token in the current contract with the same
     *    `tokenId`.
     *
     * Now the token is wrapped. The old token is hold by this contract and can
     * be released by transferring it to the original contract (see
     * {FamilyMakerWrapper-_transfer}).
     */
    function onERC721Received(
        address from,
        uint256 tokenId,
        bytes calldata
    ) external returns (bytes4) {
        require(msg.sender == address(familyMaker), "FMW: Invalid contract");
        _safeMint(from, tokenId);
        return this.onERC721Received.selector;
    }

    /**
     * @dev Custom {ERC721-_safeTransfer} method. If the token receiver is the
     * original *family token* contract it ignores the `ERC721Receiver` check.
     */
    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) internal override {
        _transfer(from, to, tokenId);
        if (to != address(familyMaker)) {
            require(
                _checkOnERC721Received(from, to, tokenId, _data),
                "ERC721: transfer to non ERC721Receiver implementer"
            );
        }
    }

    /**
     * @dev Custom {ERC721-_transfer} method that can **unwrap** tokens. If the
     * token is transferred back to the original *family token* contract, the
     * method:
     *
     * 1. Burns the token in the current contract.
     * 2. Transfers the token in the original contract to the receiver address.
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        if (to == address(familyMaker)) {
            _burn(tokenId);
            familyMaker.transferFrom(address(this), from, tokenId);
        } else {
            super._transfer(from, to, tokenId);
        }
    }

    /**
     * @dev Mint and wrap multiple tokens while keeping provenance and enforcing
     * the total supply.
     *
     * To keep provenance from the original *family token* contract, the method:
     *
     * 1. Mints the token in the original contract by calling `createWork` and
     *    assigns it to itself.
     * 2. Mints a new token in the current contract with the same `tokenId` and
     *    assigns it to the destination address.
     */
    function mintAll(address to, uint8 amount) external onlyOwner {
        uint256 totalSupply = familyMaker.totalSupply();
        require(totalSupply + amount <= SUPPLY, "FMW: amount exceeds supply");
        for (uint8 i = 0; i < amount; i++) {
            uint256 tokenId = totalSupply + i + 1;
            familyMaker.createWork(
                address(this),
                string(
                    abi.encodePacked(
                        "https://left.gallery/tokens/metadata/family-maker/",
                        tokenId.toString()
                    )
                )
            );
            _safeMint(to, tokenId);
        }
    }
}
