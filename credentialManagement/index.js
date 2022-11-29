const Caver = require("caver-js");
const Auth = require("./auth");
const secp256k1 = require('secp256k1');
const {randomBytes} = require('crypto');
const {Keccak} = require('sha3');
const hash = new Keccak(256);
const keccak256 = require('keccak256')

const ACCOUNT = require('../config/account.js'); //did-service 계정으로 로그인 
const keyInfo = {'privateKey': ACCOUNT.PRIVATE_KEY, 'account': ACCOUNT.ADDRESS};

//financeDID
module.exports = class vcManagementClient {

  /**
   * @param cfg {
   *  network: blockchain endpoint
   *  vcABI: did reg abi path 
   *  vcAddr: did reg address
   * }  */
  constructor(cfg) {
    this.caver = new Caver(cfg.network);
    this.auth = new Auth(this.caver);
    this.vc = new this.caver.contract(cfg.vcABI.abi, cfg.vcAddr);
  }
/* finish line */
  async create_view(userInfo,publicKey,isReSearch){
    try{
      if(isReSearch==true && isReSearch!='None') return {'reSearch':isReSearch}; //true
      const hashUserInfo = this._createUserInfoHash(userInfo); //userInfo는 json
      const dom = await this.didReg.methods.create_view(hashUserInfo).call();
      const publicKeys = dom.publicKeys;
      for(let i=0; i< publicKeys.length; i++){
        if(publicKeys[i].pubKeyData == publicKey){
          const did = dom.id;
          const pubKeyID = publicKeys[i].id;
          const keyType = publicKeys[i].keyType;
          return {'did':did,'publicKeyID':pubKeyID,'publicKey':publicKey,'keyType':keyType,'reSearch':isReSearch}; //false
         }
      }
    }
    catch(e){
      return this._returnMsg(-2, e.message);
    }

  }

  /**
   * @param userInfo: the user's personal information (name, resident registration number, phone number, etc.)
   * @returns returnMsg{statusCode, msg}
   * @return statusCode
   *           -1: Login is required!    -2: error.msg
   *            1: success  */

  async register(uDid,iDid,cid,ciid){ 
  
    if(!this._isLogin()){ //login 확인
      return this._returnMsg(-1,'Login is required!');
    }

    try{
      const from = this.auth.getAccount();
      const gas = this.auth.getGas();
      await this.vc.methods.register(uDid,iDid,cid,ciid).send(
        {
          from: from, 
          gas: gas 
        });

      return {'msg' :this._returnMsg(1,'Success register vc')}; 
    }catch(e){
      return {'msg' : this._returnMsg(-2, e.message)}; 
    }
  }

  /**@dev get document for did
   * @param dom: did to find document of did in registry
   * @return document
   */
  async getVC(cid,uDid) { //fin
    try{
      const vcInfo = await this.vc.methods.getVC(cid,uDid).call();
      return vcInfo; 
    }catch(e){
      console.log(e);
      return {'msg' : this._returnMsg(-2, e.message)}; 
    }
  }  
/**
  * @param did: 'did:kt:deFF..2x'
  * @param type: EcdsaSecp256k1RecoveryMethod2020 or EcdsaSecp256k1VerificationKey2019
  * @param publicKey: klaytn account address or public key(hex string)
  * @param controller: 'did:kt:feFF..Xx' 
  * @returns returnMsg{statusCode, msg}
  * @return statusCode: 
  *           -1: Login is required!    -2: error.msg
  *           -3: Not vaild key type     1: success  */
 async revokeAll(uDid){ //
    
  if(!this._isLogin()){ //login 확인
    return this._returnMsg(-1,'Login is required!');
  }

  try{
    const from = this.auth.getAccount();
    const gas = this.auth.getGas();

    await this.vc.methods.revokeAll(uDid).send(
        {
          from: from, 
          gas: gas 
        });
    return this._returnMsg(1,'Success revoke vc:'+uDid);
  }catch(e){
    return this._returnMsg(-2, e.message);
  }
}

  /**
  * @param did: 'did:kt:deFF..2x'
  * @param type: EcdsaSecp256k1RecoveryMethod2020 or EcdsaSecp256k1VerificationKey2019
  * @param publicKey: klaytn account address or public key(hex string)
  * @param controller: 'did:kt:feFF..Xx' 
  * @returns returnMsg{statusCode, msg}
  * @return statusCode: 
  *           -1: Login is required!    -2: error.msg
  *           -3: Not vaild key type     1: success  */
   async revokeOpt(cid,iDid){ //
    
    if(!this._isLogin()){ //login 확인
      return this._returnMsg(-1,'Login is required!');
    }

    try{
      const from = this.auth.getAccount();
      const gas = this.auth.getGas();

      await this.vc.methods.revokeOpt(cid,iDid).send(
          {
            from: from, 
            gas: gas 
          });
      return this._returnMsg(1,'Success revoke vc cid :'+cid);
    }catch(e){
      return this._returnMsg(-2, e.message);
    }
  }

  _isLogin(){
    var result = true;
    if(!this.auth.isLogin()){ //login 확인
      this.auth.login(keyInfo);
      if(!this.auth.isLogin()) result=false;
    }
    return result;
  }

  /**
     * @param statusCode: -n: failed, 1: successful
     * @param msg: result msg 
     */
  _returnMsg(statusCode, msg){
    return {status: statusCode, msg: msg };
  }


};