/* eslint-disable no-undef */
const { assert } = require('chai')
const { contracts_build_directory } = require('../truffle-config')

const Document = artifacts.require('Document')

require('chai').use(require('chai-as-promised')).should()

contract('Document', (accounts) => {
  let document

  before(async () => {
    document = await Document.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const { address } = document
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })
  })

  describe('storage', async () => {
    it('updates document hash', async () => {
      documentHash = 'testHash 123'
      await document.set(documentHash)
      const result = await document.get()
      assert.equal(result, documentHash)
    })
  })
})
