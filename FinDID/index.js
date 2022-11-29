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
module.exports = class FinDIDClient {

  /**
   * @param cfg {
   *  network: blockchain endpoint
   *  regABI: did reg abi path 
   *  regAddr: did reg address
   * }  */
  constructor(cfg) {
    this.caver = new Caver(cfg.network);
    this.auth = new Auth(this.caver);
    this.didReg = new this.caver.contract(cfg.regABI.abi, cfg.regAddr);
    // cfg.regABI.abi erro때문에 임시로 해놈 abi -> https://ko.docs.klaytn.com/getting-started/quick-start/check-the-deployment
  }

  async create_view(userInfo,publicKey){
    try{
      const hashUserInfo = this._createUserInfoHash(userInfo); //userInfo는 json
      const dom = await this.didReg.methods.create_view(hashUserInfo).call();
      const publicKeys = dom.publicKeys;
      for(let i=0; i< publicKeys.length; i++){
        if(publicKeys[i].pubKeyData == publicKey){
          const did = dom.id;
          const pubKeyID = publicKeys[i].id;
          const keyType = publicKeys[i].keyType;
          return {'did':did,'publicKeys':publicKeys[i],'keyType':keyType}; //false
         }
      }
    }
    catch(e){
      return this._returnMsg(-2, e.message);
    }

  }


  async getPubKey(did,pubKeyID){
    try{
      const dom = await this.didReg.methods.getDocument(did).call();
      const publicKeys = dom.publicKeys;
      for(let i=0; i< publicKeys.length; i++){
        if(publicKeys[i].id == pubKeyID){
          const publicKey = publicKeys[i].pubKeyData;
          const keyType = publicKeys[i].keyType;
          return {'publicKey':publicKey,'keyType':keyType};
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
  async createDocument(userInfo,publicKey){ 
  
    if(!this._isLogin()){ //login 확인
      return this._returnMsg(-1,'Login is required!');
    }
    

    try{
      const from = this.auth.getAccount();
      const gas = this.auth.getGas();
      const hashUserInfo = this._createUserInfoHash(userInfo); //userInfo는 json
      //const hashUserInfo = userInfo; //only test '6f4303aa6cea2b0fae462fa9cc792443c03a0609'
      await this.didReg.methods.create(hashUserInfo,publicKey).send({from: from, gas: gas});
      console.log(hashUserInfo);
      return {'msg' :this._returnMsg(1,'Success create document')}; 
    }catch(e){
      return {'msg' : this._returnMsg(-2, e.message)}; //userInfo에 해당하는 did가 이미 있는 경우
    }
  }


   /**
   * @param userInfo: the user's personal information (name, resident registration number, phone number, etc.)
   * @returns returnMsg{statusCode, msg}
   * @return statusCode
   *           -1: Login is required!    -2: error.msg
   *            1: success  */
    async reCreateDocument(userInfo,publicKey){ 
  
      if(!this._isLogin()){ //login 확인
        return this._returnMsg(-1,'Login is required!');
      }
      
  
      try{
        const from = this.auth.getAccount();
        const gas = this.auth.getGas();
        const hashUserInfo = this._createUserInfoHash(userInfo); //userInfo는 json
        //const hashUserInfo = userInfo; //only test '6f4303aa6cea2b0fae462fa9cc792443c03a0609'
        await this.didReg.methods.reCreate(hashUserInfo,publicKey).send({from: from, gas: gas});
        console.log(hashUserInfo);
        return {'msg' :this._returnMsg(1,'Success reCreate document')}; 
      }catch(e){
        return {'msg' : this._returnMsg(-2, e.message)}; //userInfo에 해당하는 did가 이미 있는 경우
      }
    }

  /**@dev get document for did
   * @param dom: did to find document of did in registry
   * @return document
   */
  async getDocument(did) { //fin
    try{
      const dom = await this.didReg.methods.getDocument(did).call();
      return dom; 
    }catch(e){
      console.log(e);
      return {contexts:[]}
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
   async addPubKey(did, type, publicKey){ //
    // if(!this.auth.isLogin()){
    //   return this._returnMsg(-1,'Login is required!');
    // }
    if(!this._isLogin()){ //login 확인
      return this._returnMsg(-1,'Login is required!');
    }

    try{
      const from = this.auth.getAccount();
      //console.log(from,typeof(from));//string
      const gas = this.auth.getGas();

      if(type == 'EcdsaSecp256k1RecoveryMethod2020'){
        await this.didReg.methods.addAddrKey(did, publicKey).send(
          {
            from: from, 
            gas: gas 
          });
      }else if(type == 'EcdsaSecp256k1VerificationKey2019'){
        await this.didReg.methods.addPubKey(did, publicKey).send(
          {
            from: from, 
            gas: gas
          });
      }else{
        return this._returnMsg(-3, 'Not valid type!');
      }

      return this._returnMsg(1,'Success add pubKey');
    }catch(e){
      return this._returnMsg(-2, e.message);
    }
  }

  /**
  * @param svcInfo: service information => svcType, endPoint, publicKey 
  * @param publicKey: klaytn account address or public key(hex string)
  * @param svcType: '(string). [ex. company type]'
  * @param endPoint: '(string) [ex. example.com]' 
  * @returns returnMsg{statusCode, msg}
  * @return statusCode: 
  *           -1: Login is required!  -2: error.msg  1: success  */    
  async createSvc(svcInfo,endPoint,svcType,publicKey){
    // if(!this.auth.isLogin()){
    //   return this._returnMsg(-1,'Login is required!');
    // }

    try{
      const from = this.auth.getAccount();
      const gas = this.auth.getGas();
      await this.didReg.methods.createSvc(svcInfo,endPoint,svcType,publicKey).send({from: from, gas: gas});

      return this._returnMsg(1,'Success add service');
    }catch(e){
      return this._returnMsg(-2, e.message);
    }
  }

  /**@dev Extract the key to be used in the did document
   * @param dom: Did document
   * @param pubKeyID: ID of the key you are looking for in the document
   * @returns pubKey info
   */
   extractPubKey(dom, pubKeyID){
    const publicKeys = dom.publicKeys;
    for(let i=0; i< publicKeys.length; i++){
      if(publicKeys[i].id ==pubKeyID){
        return publicKeys[i];
      }
    }
  }


  /**
   * @param did: 'did:kt:dFdd..0F'
   * @param pubKeyId: id excluding "did#"" of public key obj in document
   * @returns returnMsg{statusCode, msg}
   * @return statusCode: 
   *           -1: Login is required!  -2: error.msg  1: success  */    
  async revokePubKey(did, pubKeyId){
    // if(!this.auth.isLogin()){
    //   return this._returnMsg(-1,'Login is required!');
    // }

    try{
      const from = this.auth.getAccount();
      const gas = this.auth.getGas();
      await this.didReg.methods.disableKey(did, pubKeyId).send({from: from, gas: gas});

      return this._returnMsg(1,'Revoked public key');
    }catch(e){
      return this._returnMsg(-2, e.message);
    }    
  }



  /**
   * @param did: 'did:kt:dFdd..0F'
   * @param scvId: id excluding "did#"" of service obj in document
   * @returns returnMsg{statusCode, msg}
   * @return statusCode: 
   *           -1: Login is required!  -2: error.msg  1: success  */  
  async revokeService(did, scvId){
    if(!this.auth.isLogin()){
      return this._returnMsg(-1,'Login is required!');
    }

    try{
      const from = this.auth.getAccount();
      const gas = this.auth.getGas();
      await this.didReg.methods.disableService(did, scvId).send({from: from, gas: gas});

      return this._returnMsg(1,'Revoke service');
    }catch(e){
      return this._returnMsg(-2, e.message);
    }  
  }




  /**
   * @param statusCode: -n: failed, 1: successful
   * @param msg: result msg 
   */
  _returnMsg(statusCode, msg){
    return {status: statusCode, msg: msg };
  }


  /**
  * @dev internal function
  * @param signature: value signed file metadata with private key (0x{hex}:65byte:module->caver.klay.accounts.sign)
  * @param data: data contained in signature
  * @param pubKey: public key(address) in document (0x{Hex.toLowCase})
  */
  _isValid_Secpk1_Recovery2020(signature, data, pubKeyAddr){
    const signerAddress = this.caver.klay.accounts.recover(data, signature);
    return (pubKeyAddr == signerAddress.toLowerCase());
  }


  /**
  * @dev internal function 
  * @param signature: value signed file metadata with private key (0x{hex}:64byte:module->secp256k1)
  * @param data: data contained in signature
  * @param pubKey: public key in document (0x{Hex})
  */
  _isValid_Secpk1_2019(signature, data, pubKey){
    const pureHexKey = pubKey.replace("0x", "");
    const uint8ArrPubKey = Uint8Array.from(Buffer.from(pureHexKey,'hex'));

    const msg32 = hash.update(Buffer.from(data)).digest();
  
    const pureHexSig = signature.replace("0x","");
    const bytesSig = Buffer.from(pureHexSig,'hex'); 

    return secp256k1.ecdsaVerify(bytesSig, msg32, uint8ArrPubKey);
  }

  /**
   * @param userInfo: the user's personal information (name, resident registration number, phone number, etc.)
   * @returns hashUserInfo: value created by hashing the userInfo  */
   _createUserInfoHash(userInfo){
    const hashUserInfo = keccak256(Buffer.from(JSON.stringify(userInfo))).toString('hex')
    return hashUserInfo

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