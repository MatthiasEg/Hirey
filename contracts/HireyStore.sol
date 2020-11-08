// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.8.0;

contract HireyStore {
    
  struct CVRecord {
    address author;
    string documentHash;
  }

  struct CVDocument {
    address author;
    string documentHash;
    bool isUnlocked;
  }

  address payable public contractCreatorAddress;
  mapping(address => CVRecord[]) cvRecordHashes;
  mapping(address => uint) nbrOfCvRecordHashes;
  mapping(address => CVDocument[]) cvDocumentHashes;
  mapping(address => uint) nbrOfCvDocumentHashes;

  constructor() public {
    contractCreatorAddress = msg.sender;
  }

  // Bildungsinstitution oder Arbeitgeber kann einen Document-Hash für einen Bewerber hinzufügen
  function storeCvRecordFor(address _applicantAccount, string memory _cvRecordHash) public {
    cvRecordHashes[_applicantAccount].push(CVRecord({author: msg.sender, documentHash: _cvRecordHash}));
    nbrOfCvRecordHashes[_applicantAccount] = nbrOfCvRecordHashes[_applicantAccount] + 1;
  }

  // Bewerber kann seinen CV-Hash für sich selber speicher (targetAccount == msg.sender)
  // Bewerber kann seinen CV-Hash für eine HR-Abteilung speichern. Die HR-Abteilung muss den Eintrag dann mit Eth freischalten (unlock=True).
  function storeCVDocumentFor(address _targetAccount, string memory _cvDocumentHash) public {
    if(_targetAccount == msg.sender) {
      cvDocumentHashes[_targetAccount].push(CVDocument({author: msg.sender, documentHash: _cvDocumentHash, isUnlocked: true}));
    } else {
      cvDocumentHashes[_targetAccount].push(CVDocument({author: msg.sender, documentHash: _cvDocumentHash, isUnlocked: false}));
    }
    nbrOfCvDocumentHashes[_targetAccount] = nbrOfCvDocumentHashes[_targetAccount] + 1;
  }

  // CV-Hashes welche für eine HR-Abteilung hinzugefügt wurden müssen zuerst freigeschaltet werden. Gemäss unserem Konzept kostet das die HR-Abteilung aber etwas. 
  function unlockCVDocument(uint cvDocumentIndex) public payable {
    require(!cvDocumentHashes[msg.sender][cvDocumentIndex].isUnlocked);
    require(msg.value >= 30000);
    contractCreatorAddress.transfer(msg.value);
    cvDocumentHashes[msg.sender][cvDocumentIndex].isUnlocked = true;
  }

  function getNbrOfCvRecordHashes() public view returns (uint) {
    return nbrOfCvRecordHashes[msg.sender];
  }

  function getCvRecordHash(uint cvRecordIndex) public view returns (address, string memory) {
    return (cvRecordHashes[msg.sender][cvRecordIndex].author, cvRecordHashes[msg.sender][cvRecordIndex].documentHash);
  }
  
  function getNbrOfCvDocumentHashes() public view returns (uint) {
    return nbrOfCvDocumentHashes[msg.sender];
  }
  
  function getCvDocumentHash(uint cvDocumentIndex) public view returns (address, string memory) {
    require(cvDocumentHashes[msg.sender][cvDocumentIndex].isUnlocked);
    return (cvDocumentHashes[msg.sender][cvDocumentIndex].author, cvDocumentHashes[msg.sender][cvDocumentIndex].documentHash);
  }
}