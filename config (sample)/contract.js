const fs = require('fs');
const BASE_ADDRESS_URL = '/your/path/contract/address/';
const BASE_ABI_URL = '/your/path/contract/abi/';
const DIDLedger_JSON =require('/your/path/contract/json/DIDLedger.json');
const VC_Management_JSON = require('/your/path/contract/json/CredentialManagement.json');

module.exports = {
    DEPLOYED_JSON_DIDLedger: DIDLedger_JSON,
    DEPLOYED_ADDRESS_DIDLedger: fs.readFileSync(`${BASE_ADDRESS_URL}deployedAddressDIDLedger`, 'utf8').replace(/\n|\r/g, ""),
    DEPLOYED_ABI_DIDLedger: JSON.parse(fs.existsSync(`${BASE_ABI_URL}deployedABIDIDLedger`) && fs.readFileSync(`${BASE_ABI_URL}deployedABIDIDLedger`, 'utf8')),
    DEPLOYED_JSON_VC_Management: VC_Management_JSON,
    DEPLOYED_ADDRESS_VC_Management: fs.readFileSync(`${BASE_ADDRESS_URL}deployedAddressCredentialManagement`, 'utf8').replace(/\n|\r/g, ""),
    DEPLOYED_ABI_VC_Management: JSON.parse(fs.existsSync(`${BASE_ABI_URL}deployedABICredentialManagement`) && fs.readFileSync(`${BASE_ABI_URL}deployedABICredentialManagement`, 'utf8')),

}