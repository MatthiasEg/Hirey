// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.8.0;

contract Document {
  // state variable
  string documentHash;

  // public makes function available outside the smart contract
  function set(string memory _documentHash) public {
      documentHash = _documentHash;
  }

  function get() public view returns (string memory) {
    return documentHash;
  }
}