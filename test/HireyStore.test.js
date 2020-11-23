/* eslint-disable no-undef */
const { assert } = require('chai')
const { contracts_build_directory } = require('../truffle-config')

const HireyStore = artifacts.require('HireyStore')

require('chai').use(require('chai-as-promised')).should()

contract('HireyStore', (accounts) => {
  let hireyStore
  cvRecordHashOne = '3sdff45dsdf2354dddfdfa345345'
  cvRecordHashTwo = '7777reerefkjfwjhe32399393442'
  cvDocumentHashOne = 'fdfsd35fdfggdf4df34453rfdgr'
  cvDocumentHashTwo = '45esadfer234fsdfodfjn652342'
  contractCreatorAccount = accounts[0]
  applicantAccount = accounts[1]
  applicantAccountOther = accounts[2]
  humanResourcesAccount = accounts[3]
  employerAccount = accounts[4]
  schoolAccount = accounts[5]

  before(async () => {
    hireyStore = await HireyStore.deployed()
  })

  describe('test deployment', async () => {
    it('deploys successfully', async () => {
      const { address } = hireyStore
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })
  })

  describe('test storage cv record', async () => {

    it('store cv record hash for applicantAccount', async () => {
      assert.equal(0,  await hireyStore.getNbrOfCvRecordHashes({from: applicantAccount}))
      assert.equal(0,  await hireyStore.getNbrOfCvRecordHashes({from: applicantAccountOther}))

      await hireyStore.storeCvRecordFor(applicantAccount, cvRecordHashOne, {from: employerAccount})
      await hireyStore.storeCvRecordFor(applicantAccount, cvRecordHashTwo, {from: schoolAccount})
      
      assert.equal(2, await hireyStore.getNbrOfCvRecordHashes({from: applicantAccount}))
      assert.equal(0, await hireyStore.getNbrOfCvRecordHashes({from: applicantAccountOther}))
    })

    it('read cv record hash for applicantAccount', async () => {      
      assert.equal(2, await hireyStore.getNbrOfCvRecordHashes({from: applicantAccount}))
      assert.equal(0, await hireyStore.getNbrOfCvRecordHashes({from: applicantAccountOther}))

      const storedCvRecordHashOne = await hireyStore.getCvRecordHash(0, {from: applicantAccount})
      const storedCvRecordHashTwo = await hireyStore.getCvRecordHash(1, {from: applicantAccount})

      // attribute 0 is author, attribute 1 is documentHash
      assert.equal(employerAccount, storedCvRecordHashOne[0])
      assert.equal(cvRecordHashOne, storedCvRecordHashOne[1])
      assert.equal(schoolAccount, storedCvRecordHashTwo[0])
      assert.equal(cvRecordHashTwo, storedCvRecordHashTwo[1])
    })
  })
  
  describe('storage cv document for applicantAccount', async () => {

    it('store cv document hash for applicantAccount', async () => {
      assert.equal(0,  await hireyStore.getNbrOfCvDocumentHashes({from: applicantAccount}))
      assert.equal(0,  await hireyStore.getNbrOfCvDocumentHashes({from: applicantAccountOther}))

      await hireyStore.storeCVDocument(cvDocumentHashOne, {from: applicantAccountOther})
      await hireyStore.storeCVDocument(cvDocumentHashTwo, {from: applicantAccountOther})
      
      assert.equal(0, await hireyStore.getNbrOfCvDocumentHashes({from: applicantAccount}))
      assert.equal(2, await hireyStore.getNbrOfCvDocumentHashes({from: applicantAccountOther}))
    })
    
    it('read cv document hash for applicantAccount', async () => {
      assert.equal(0, await hireyStore.getNbrOfCvDocumentHashes({from: applicantAccount}))
      assert.equal(2, await hireyStore.getNbrOfCvDocumentHashes({from: applicantAccountOther}))

      const storedCvDocumentHashOne = await hireyStore.getCvDocumentHash(0, {from: applicantAccountOther})
      const storedCvDocumentHashTwo = await hireyStore.getCvDocumentHash(1, {from: applicantAccountOther})

      // attribute 0 is author, attribute 1 is documentHash
      assert.equal(applicantAccountOther, storedCvDocumentHashOne[0])
      assert.equal(cvDocumentHashOne, storedCvDocumentHashOne[1])
      assert.equal(applicantAccountOther, storedCvDocumentHashTwo[0])
      assert.equal(cvDocumentHashTwo, storedCvDocumentHashTwo[1])
    })
  })
  
  describe('storage cv document for humanResourcesAccount', async () => {

    it('store cv document hash for humanResourcesAccount', async () => {
      assert.equal(0,  await hireyStore.getNbrOfCvDocumentHashes({from: humanResourcesAccount}))

      await hireyStore.shareCVDocument(humanResourcesAccount, 0, cvDocumentHashOne, {from: applicantAccount})
      
      assert.equal(1, await hireyStore.getNbrOfCvDocumentHashes({from: humanResourcesAccount}))
    })

    it('read locked cv document hash for humanResourcesAccount', async () => {
      assert.equal(1, await hireyStore.getNbrOfCvDocumentHashes({from: humanResourcesAccount}))
      
      try {
        let isUnlocked = await hireyStore.isCvDocumentUnlocked(0, {from: humanResourcesAccount})
        assert(!isUnlocked, "Expected unlocked cv document!");
        await hireyStore.getCvDocumentHash(0, {from: humanResourcesAccount})
        assert(false, "Expected an error but did not get one");
      }
      catch (error) {
        const expectedMessage = "Returned error: VM Exception while processing transaction: revert"
        assert(error.message.startsWith(expectedMessage), "Expected an error starting with '" + expectedMessage + "' but got '" + error.message + "' instead");
      }
    })
 
    it('try unlocked cv document hash for humanResourcesAccount with value less 30000 => revert transaction', async () => {
      assert.equal(1, await hireyStore.getNbrOfCvDocumentHashes({from: humanResourcesAccount}))
      
      try {
        let isUnlocked = await hireyStore.isCvDocumentUnlocked(0, {from: humanResourcesAccount})
        assert(!isUnlocked, "Expected unlocked cv document!");
        await hireyStore.unlockCVDocument(0, {from: humanResourcesAccount, value: 29999})
        assert(false, "Expected an error but did not get one");
      }
      catch (error) {
        const expectedMessage = "Returned error: VM Exception while processing transaction: revert"
        assert(error.message.startsWith(expectedMessage), "Expected an error starting with '" + expectedMessage + "' but got '" + error.message + "' instead");
      }
    })

    it('try unlocked cv document hash for humanResourcesAccount with value more or equals 30000', async () => {
      assert.equal(1, await hireyStore.getNbrOfCvDocumentHashes({from: humanResourcesAccount}))
      let isUnlocked = await hireyStore.isCvDocumentUnlocked(0, {from: humanResourcesAccount})
      assert(!isUnlocked, "Expected unlocked cv document!");

      let balanceContractCreatorAccount = await web3.eth.getBalance(contractCreatorAccount)
      let balanceHumanResourcesAccount =  await web3.eth.getBalance(humanResourcesAccount)
      
      await hireyStore.unlockCVDocument(0, {from: humanResourcesAccount, value: 30000})

      isUnlocked = await hireyStore.isCvDocumentUnlocked(0, {from: humanResourcesAccount})
      assert(isUnlocked, "Expected unlocked cv document!");
      assert(await web3.eth.getBalance(contractCreatorAccount) > balanceContractCreatorAccount)
      assert(await web3.eth.getBalance(humanResourcesAccount) < balanceHumanResourcesAccount)
    })

    it('read unlocked cv document hash for humanResourcesAccount', async () => {
      assert.equal(1, await hireyStore.getNbrOfCvDocumentHashes({from: humanResourcesAccount}))

      const storedCvDocumentHash =  await hireyStore.getCvDocumentHash(0, {from: humanResourcesAccount})

       // attribute 0 is author, attribute 1 is documentHash
       assert.equal(applicantAccount, storedCvDocumentHash[0])
       assert.equal(cvDocumentHashOne, storedCvDocumentHash[1])
      })

      it('try to unlock already unlocked cv document hash for humanResourcesAccount with  more or equals 30000 => revert transaction', async () => {
        assert.equal(1, await hireyStore.getNbrOfCvDocumentHashes({from: humanResourcesAccount}))
        
        try {
          await hireyStore.unlockCVDocument(0, {from: humanResourcesAccount, value: 30000})
          assert(false, "Expected an error but did not get one");
        }
        catch (error) {
          const expectedMessage = "Returned error: VM Exception while processing transaction: revert"
          assert(error.message.startsWith(expectedMessage), "Expected an error starting with '" + expectedMessage + "' but got '" + error.message + "' instead");
        }
      })  

      it('check file is shared to applicant and humanResourcesAccount', async () => {
        assert.equal(1, await hireyStore.getNbrOfSharedTo(0, {from: applicantAccount}))
        assert.equal(humanResourcesAccount, await hireyStore.getSharedTo(0, 0, {from: applicantAccount}))
      })
  })
})
