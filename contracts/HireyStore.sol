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
    address[] sharedTo;
  }

  address payable private contractCreatorAddress;
  mapping(address => CVRecord[]) private cvRecordHashes;
  mapping(address => CVDocument[]) private cvDocumentHashes;

  constructor() public {
    contractCreatorAddress = msg.sender;
  }

  // Eine Bildungsinstitution oder ein Arbeitgeber kann einen _cvRecordHash für einen Bewerber hinzufügen. Dieser _cvRecordHash zeigt auf eine Datei (auf dem IPFS),
  // welche vom Sender signiert und mit dem Public-Key des Bewerbers verschlüsselt wurde. Der Hash wurde mit dem HIREY-System Public-Key verschlüsselt. 
  function storeCvRecordFor(address _applicantAccount, string memory _cvRecordHash) public {
    cvRecordHashes[_applicantAccount].push(CVRecord({author: msg.sender, documentHash: _cvRecordHash}));
  }

  // Ein Bewerber kann einen _cvDocumentHash für sich selbst speichern. Die Datei auf IPFS enthält mehere cvRecords. 
  // Die cvRecords wurden vom ursprünglichen Sender signiert. Gespeichert ist das cvDocument hier ebenfalls mit dem Public-Key des Bewerbers.
  // Der Hash wurde mit dem HIREY-System Public-Key verschlüsselt.   
  function storeCVDocument(string memory _cvDocumentHash) public {
    cvDocumentHashes[msg.sender].push(CVDocument({author: msg.sender, documentHash: _cvDocumentHash, isUnlocked: true, sharedTo: new address[](0)}));
  }

  // Bewerber kann seine CVDocumente für HR-Abteilungen freigeben. Die HR-Abteilung muss den Eintrag dann mit Eth freischalten (unlock=True).
  // Beim Teilen gibt er den _cvDocumentHash des freizugebenden CVDocumentes mit. Dieses Dokument enthält die von den Firmen und Schulen signierten
  // cvRecords. Die cvRecords und das gesamte Dokument wurde mit dem Public-Key der HR-Abteilung verschlüsselt. Der Hash wurde mit dem HIREY-System Public-Key verschlüsselt. 
  function shareCVDocument(address _targetAccount, uint cvDocumentIndex, string memory _cvDocumentHash) public {
    require(_targetAccount != msg.sender); // Um ein Dokument für dich selber zu speichern muss mann storeCVDocument verwenden
    // das Dokument dass man freigibt muss auch existieren     
    require(cvDocumentHashes[msg.sender].length > cvDocumentIndex); 
    require(bytes(cvDocumentHashes[msg.sender][cvDocumentIndex].documentHash).length  > 0);

    cvDocumentHashes[_targetAccount].push(CVDocument({author: msg.sender, documentHash: _cvDocumentHash, isUnlocked: false, sharedTo: new address[](0)}));
    cvDocumentHashes[msg.sender][cvDocumentIndex].sharedTo.push(_targetAccount);
  }

  // Die HR-Abteilungen bezahlen für das Anschauen der CVDokumente einmalig. Daher müssen sie das Dokument initial freischalten. 
  // Nur freigeschaltete CVDocument-Hashes werden durch den HIREY-SYSTEM Private-Key entschlüsselt. 
  function unlockCVDocument(uint cvDocumentIndex) public payable {
    require(!cvDocumentHashes[msg.sender][cvDocumentIndex].isUnlocked);
    require(msg.value >= 30000);
    contractCreatorAddress.transfer(msg.value);
    cvDocumentHashes[msg.sender][cvDocumentIndex].isUnlocked = true;
  }

  function getNbrOfCvRecordHashes() public view returns (uint) {
    return cvRecordHashes[msg.sender].length;
  }

  function getCvRecordHash(uint cvRecordIndex) public view returns (address, string memory) {
    return (cvRecordHashes[msg.sender][cvRecordIndex].author, cvRecordHashes[msg.sender][cvRecordIndex].documentHash);
  }
  
  function getNbrOfCvDocumentHashes() public view returns (uint count) {
    return cvDocumentHashes[msg.sender].length;
  }
  
  // Der CVDocumentHash kann immer Abgefragt werden. Dieser wird einfach nicht vom System entschlüsselt, wenn er nicht freigeschaltet ist. 
  function getCvDocumentHash(uint cvDocumentIndex) public view returns (address, string memory) {
    return (cvDocumentHashes[msg.sender][cvDocumentIndex].author, cvDocumentHashes[msg.sender][cvDocumentIndex].documentHash);
  }

  function isCvDocumentUnlocked(uint cvDocumentIndex) public view returns (bool) {
    return cvDocumentHashes[msg.sender][cvDocumentIndex].isUnlocked;
  }

  function getNbrOfSharedTo(uint cvDocumentIndex) public view returns (uint) {
    return cvDocumentHashes[msg.sender][cvDocumentIndex].sharedTo.length;
  }

  function getSharedTo(uint cvDocumentIndex, uint sharedToIndex) public view returns (address) {
    return cvDocumentHashes[msg.sender][cvDocumentIndex].sharedTo[sharedToIndex];
  }
}