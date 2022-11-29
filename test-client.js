//함수 하나씩 실행해보는 서버 없는 테스트 클라이언트 

const finDIDClient = require("./FinDID/index.js");
const CredentialClient = require("./credentialManagement/index.js");
const ACCOUNT = require('./config/account.js');
const CONTRACT = require('./config/contract.js');
const ACCESS=require('./config/access.js');
const finDID = new finDIDClient({
  network: 'https://api.baobab.klaytn.net:8651',
  regABI: CONTRACT.DEPLOYED_JSON_DIDLedger,
  regAddr: CONTRACT.DEPLOYED_ADDRESS_DIDLedger
});


const credentialManager = new CredentialClient({
  network: 'https://api.baobab.klaytn.net:8651',
  vcABI: CONTRACT.DEPLOYED_JSON_VC_Management,
  vcAddr: CONTRACT.DEPLOYED_ADDRESS_VC_Management
});


async function view_did (userInfo,publicKey){
  const view = await finDID.create_view(userInfo,publicKey);
  console.log(view)
}

async function createTest(userInfo,publicKey){
    const create = await finDID.createDocument(userInfo,publicKey);
    console.log(create);
    const view = await finDID.create_view(userInfo,publicKey);
    console.log(view)

    // const publicKeyID = view.pubKeyID;
    // const keyType = view.keyType;
    // const did = view.did;
    // const publicKey = publicKey;


}

async function reCreateTest(userInfo,publicKey){
    const create = await finDID.reCreateDocument(userInfo,publicKey);
    console.log(create);
    const view = await finDID.create_view(userInfo,publicKey);
    console.log(view)
}

async function getPubKeyTest(){
  const did = 'did:kt:1111ec18df5395bf2ca7611f0648bfc1c935bdd1773c1bb411c42f23318ba9ab';
  const pubKeyID = 'did:kt:1111ec18df5395bf2ca7611f0648bfc1c935bdd1773c1bb411c42f23318ba9ab#key-1'
  const pubKey = await finDID.getPubKey(did,pubKeyID);
  console.log(pubKey);
}

async function getDocTest(){
  //const did = 'did:kt:2222ec18df5395bf2ca7611f0648bfc1c935bdd1773c1bb411c42f23318ba9ab' //verifier
  //const did ='did:kt:1111ec18df5395bf2ca7611f0648bfc1c935bdd1773c1bb411c42f23318ba9ab' //issuer
  const did = 'did:kt:98019ea111738d6baeb585972505e2ea24c4dbb281cfc2b224b51e5a9702c255'; //hyewon
  //const did = "did:kt:d614d283195a366d492f3dcecc10197eadb70b5a1a2275a7a931cd51bba76d97"; // young did
  const document = await finDID.getDocument(did);
  console.log(document);
}

async function addPubKey(did){
  const type = 'EcdsaSecp256k1RecoveryMethod2020';
  const publicKey='0x180150aa48b9ebae77e569eacc31c807f81d2031';
  const addPubKey = await finDID.addPubKey(did, type, publicKey);
  console.log(addPubKey);
  const view = await finDID.create_view(did,publicKey);
  console.log(view);
}

async function createService(){
  /* verifier */
  /* 
  const svcInfo = '2222ec18df5395bf2ca7611f0648bfc1c935bdd1773c1bb411c42f23318ba9ab';
  const endPoint = ACCESS.VERIFIER;
  const svcType = 'presentation verifier (online Shopping Mall)';
  const publicKey =ACCOUNT.SVC_ADDRESS;
  */
  /* issuer */
  const svcInfo = '1111ec18df5395bf2ca7611f0648bfc1c935bdd1773c1bb411c42f23318ba9ab';
  const endPoint = ACCESS.ISSUER;
  const svcType = 'credential issuer (a credit card company)';
  const publicKey =ACCOUNT.ISS_ADDRESS;

  const createSvc = await finDID.createSvc(svcInfo,endPoint,svcType,publicKey);
  
  console.log(createSvc);

}

async function registerVC(uDid,iDid,cid,ciid){
  const register = await credentialManager.register(uDid,iDid,cid,ciid);
  console.log(register); 

}

async function getVC(cid,uDid){
  const vc = await credentialManager.getVC(cid,uDid);
  console.log(vc);
}

async function revokeVC(cid,iDid){
  const revoke = await credentialManager.revokeOpt(cid,iDid);
  console.log(revoke);
}

async function revokeAll(uDid){
  const revoke = await credentialManager.revokeAll(uDid);
  console.log(revoke);
}


async function test() {
  const privateKey = ACCOUNT.PRIVATE_KEY; // Enter your private key;
  const address = ACCOUNT.ADDRESS; // Enter your private key;
  const keyInfo = {'privateKey': privateKey, 'account': address};

  const userInfo = {'name':'user1','regNum':'990114-2xxxxxx','phone':'01000000000'};//did:kt:98019ea111738d6baeb585972505e2ea24c4dbb281cfc2b224b51e5a9702c255
  // const userInfo = { //'0x180150aa48b9ebae77e569eacc31c807f81d2031'
  //   'name': '이영은',
  //   'regNum': '980828-2222222',
  //   'phone': '01900000000'
  // }
  const createPubKey = address;

  //or login({path: 'key store file(json)', password: '1234'});
  finDID.auth.login(keyInfo);
  
  //createTest(userInfo,createPubKey)
  //reCreateTest(userInfo,createPubKey)
  //const did = 'did:kt:98019ea111738d6baeb585972505e2ea24c4dbb281cfc2b224b51e5a9702c255'; //hyewon
  //const did = 'did:kt:d614d283195a366d492f3dcecc10197eadb70b5a1a2275a7a931cd51bba76d97'; //young
  //addPubKey(did)
  //getDocTest()
  //getPubKeyTest()
  //createService()
  //view_did(userInfo,address);
  

  /* credential Management */
  const uDid = 'did:kt:98019ea111738d6baeb585972505e2ea24c4dbb281cfc2b224b51e5a9702c255';
  const iDid = 'did:kt:1111ec18df5395bf2ca7611f0648bfc1c935bdd1773c1bb411c42f23318ba9ab'
  const cid = '1';
  const ciid = 'aa';

  getDocTest()

  //registerVC(uDid,iDid,cid,ciid);
  //getVC(cid,uDid);
  //revokeVC(cid,iDid);
  //revokeAll(uDid);

}

test();