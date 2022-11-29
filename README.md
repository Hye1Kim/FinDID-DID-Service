# DID-Service


## 디렉토리 및 파일 구성 

/config : 환경 파일 디렉토리
- access.js : 접근할 서비스의 엔드포인트 환경파일 
- account.js : did-service의 클레이튼 계정정보 환경파일
- contract.js : 배포된 컨트랙트 정보(abi, address) 환경파일
- did.js : did-service의 did 정보 환경파일

/contract : 클레이튼에 배포된 컨트랙트들의 abi, address, json 파일 디렉토리

/credentialManagement : 배포된 VCIDManagement 컨트랙트를 위한 클라이언트 모듈

/FinDID : 배포된 DIDLedger 컨트랙트를 위한 클라이언트 모듈

did-server.js : did-service의 메인 서버 


## 실행

1. npm 모듈 설치

'''
npm install  
'''

2. did-service 서버 실행 
'''    
node did-server.js 
'''
