const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

global.atob = require("atob");
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const fs = require('fs');
const { get } = require('http');
const CredentialClient = require("./credentialManagement/index.js");
const FinDIDClient = require("./FinDID/index.js")
const CONTRACT = require('./config/contract.js');
const finDID = new FinDIDClient({
    network: 'https://api.baobab.klaytn.net:8651',
    regABI: CONTRACT.DEPLOYED_JSON_DIDLedger,
    regAddr: CONTRACT.DEPLOYED_ADDRESS_DIDLedger,
  });
const credentialManager = new CredentialClient({
    network: 'https://api.baobab.klaytn.net:8651',
    vcABI: CONTRACT.DEPLOYED_JSON_VC_Management,
    vcAddr: CONTRACT.DEPLOYED_ADDRESS_VC_Management
});

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cors());


app.post('/create',async (req, res)=>
{
    console.log('/create');
    console.log(req.body);
    const userInfo = req.body;
    const userInfoJson = {
        'name':userInfo.name,
        'regNum':userInfo.regNum,
        'phone':userInfo.phone
    } 
    const publicKey = userInfo.address;
    const create = await finDID.createDocument(userInfoJson,publicKey);
    console.log(create);
    const view = await finDID.create_view(userInfoJson);
    console.log(view);
    res.send(view);



});

//did
app.get('/didDocument',async (req, res)=>
{
    console.log('/didDocument');
    console.log(req.body);
    const did = req.body.did;//or req.body
    const document = await finDID.getDocument(did);
    console.log(document);
    res.send(document);
});


app.post('/reCreateDID',async (req, res)=>
{
    console.log('/reCreateDID');
    console.log(req.body);
    const userInfo = req.body;
    const userInfoJson = {
        'name':userInfo.name,
        'regNum':userInfo.regNum,
        'phone':userInfo.phone
    } 
    const publicKey = userInfo.address;
    const create = await finDID.reCreateDocument(userInfoJson,publicKey);
    console.log(create);
    const view = await finDID.create_view(userInfoJson);
    console.log(view);


    const revokeVC = await credentialManager.revokeAll(did);
    console.log(revokeVC);

    res.send(view);

});



//add PublicKey
app.post('/reSearchDID',async (req, res)=>
{
    console.log('research');
    const isReSearch = 'None';
    console.log(req.body);
    const userInfo = req.body;
    const publicKey = req.body.address;
    const type = req.body.keyType;

    const userInfoJson = {
        'name':userInfo.name,
        'regNum':userInfo.regNum,
        'phone':userInfo.phone
    }
    
    const addPubKey = await finDID.addPubKey(userInfoJson, type, publicKey);
    console.log(addPubKey);
    const view = await finDID.create_view(userInfoJson,publicKey);
    console.log(view);
    res.send(view);

});

app.post('/searchDID',async (req, res)=>{
    const userInfo = req.body;
    const userInfoJson = {
        'name':userInfo.name,
        'regNum':userInfo.regNum,
        'phone':userInfo.phone
    }
    const publicKey = req.body.address;
    const view = await finDID.create_view(userInfoJson,publicKey);
    console.log(view);
    res.send(view);
})

// vc register 
app.post('/register-vc',async (req, res)=>{
    console.log('#####/vc#####')
    const vc = req.body.vc;
    const cid = vc.cid;
    const ciid = vc.ciid;
    const uDid = vc.ownerdid
    const iDid = vc.issuerdid
    const register = await credentialManager.register(uDid,iDid,cid,ciid);
    console.log(register);

    res.send(register);
    //크리덴셜 컨트랙트와 did document에 추가 
})

//search vc info
app.post('/info-vc',async (req, res)=>{
    console.log('#####/info-vc#####');
    const info = req.body;
    const cid = info.cid;
    const uDid = info.ownerdid
    const vc_info = await credentialManager.getVC(cid,uDid);
    console.log(vc_info);

    res.send(vc_info);
});

//search vc info
app.post('/get-vciid',async (req, res)=>{
    console.log('#####/get-vciid#####');
    const cid = req.body.cid;
    const ciid = await credentialManager.getVCIID(cid);
    res.send(ciid);
});

//revoke vc
app.post('/revoke-vc',async (req, res)=>{
    console.log('#####/revoke-vc#####')
    const info = req.body;
    const cid = info.cid;
    const iDid = info.issuerdid
    const revoke = await credentialManager.revoke(cid,iDid);
    console.log(revoke);

    res.send(revoke);
});


app.post('/auth-info',async (req, res)=>{
    console.log('#####/auth-info#####')
    const auth_meta = req.body;
    console.log(auth_meta); 
    const subject = {
        'user':auth_meta.state[0],
        'issuer':auth_meta.state[1],
        'verifier':auth_meta.state[2]
    }
    let auth_info = {}
    if(subject.user== true) {
        const userPubKey = await finDID.getPubKey(auth_meta.user.did, auth_meta.user.pubKeyID);
        auth_info.user =userPubKey
    }
    if(subject.issuer == true) {
        const issuerPubKey = await finDID.getPubKey(auth_meta.issuer.did, auth_meta.issuer.pubKeyID);
        auth_info.issuer = issuerPubKey
        
    }
    if(subject.verifier == true) {
        const verifierPubKey = await finDID.getPubKey(auth_meta.verifier.did, auth_meta.verifier.pubKeyID);
        auth_info.verifier =verifierPubKey
    }
    res.send(auth_info);
});

/* test finish */

app.listen(5000,function(){
    console.log("working on port 5000");
});








