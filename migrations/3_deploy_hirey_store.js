// eslint-disable-next-line no-undef
const HireyStore = artifacts.require('HireyStore')

module.exports = (deployer) => {
  deployer.deploy(HireyStore)
}
