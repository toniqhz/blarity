const Web3 = require('web3');
const constants = require('./constants');
const ethUtil = require('ethereumjs-util')
const abiDecoder = require("abi-decoder")
const env = require("../env")
module.exports = class EthereumService {
  constructor(campainAddr){
    this.campainAddr = campainAddr
    this.rpc = new Web3(new Web3.providers.HttpProvider(env.endpoints.ethScan, 3000));
    this.erc20Contract = new this.rpc.eth.Contract(constants.ERC20)
    console.log("___________________", campainAddr, this.rpc)
    this.contract = new this.rpc.eth.Contract(constants.CONTRACT_ABI, this.campainAddr);
  }

  version() {
    return this.rpc.version.api;
  }

  getCampaignDetail() {
    return this.contract.methods.getCampagnDetail().call();
  }

  sendRawTransaction(tx) {
    return new Promise((resolve, reject) => {
      try {
        this.rpc.eth.sendSignedTransaction(
          ethUtil.bufferToHex(tx.serialize()), (error, hash) => {
            if (error != null) {
              reject(error)
            } else {
              resolve(hash)
            }
          })
      } catch (e) {
        console.log(e)
        reject(e)
      }
      
    })
  }


  donateData(tokenAddr, amountTwei, delegatorAddr){
    return new Promise((resolve, reject) => {
      try {
        const networkAddr = env.network
        var data = this.contract.methods.contribute(
          networkAddr, tokenAddr, amountTwei, delegatorAddr
        ).encodeABI()
        resolve(data)
      } catch (e) {
        console.log(e)
        reject(e)
      }
    })
  }

  approveTokenData(sourceToken, sourceAmount) {
    var tokenContract = this.erc20Contract
    tokenContract.options.address = sourceToken

    const data =  tokenContract.methods.approve(this.campainAddr, sourceAmount).encodeABI()
    return Promise.resolve(data)
 }

  getAllowance(sourceToken, owner) {
    var tokenContract = this.erc20Contract
    tokenContract.options.address = sourceToken
    return tokenContract.methods.allowance(owner, this.campainAddr).call()
  }
}


