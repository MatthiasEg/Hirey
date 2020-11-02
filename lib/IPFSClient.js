const ImpfsClient = require('ipfs-http-client')

const ipfs = ImpfsClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
})

export default ipfs
