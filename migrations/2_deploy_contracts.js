// eslint-disable-next-line no-undef
const Document = artifacts.require('Document')

module.exports = (deployer) => {
  deployer.deploy(Document)
}
