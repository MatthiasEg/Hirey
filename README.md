# Hirey
Hirey is a Proof of Concept(PoC) DApp based on the Ethereum network. It's aim is to provide an easy and secure way of validating CV documents.

This PoC was implemented as part of the Blochain (BCHAIN) course at the [Lucerne School of Computer Science and Information Technology (HSLU)](https://www.hslu.ch/en/lucerne-school-of-information-technology/).

## Requirements
- [node.js 14.15](https://nodejs.org/en/) installed
- [Truffle Ganache](https://www.trufflesuite.com/ganache) installed 
- [Google Chrome Browser](https://www.google.com/chrome/)
- [Meta Mask Chrome Plugin](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en) installed

## Setup
1. Clone the repository to your computer
2. Create a new workspace inside ganache with the following mnemonic
  - You can set the mnemonic phrase inside the "Accounts & Keys" menu
  - **Important:** In order to use the already prepared account information in the application, you **must** use this mnemonic phrase. Otherwise the application won't be usable.

```
excite mind couple hard street rhythm body oxygen type rifle rule flash
```
4. Connect the blockchain and your desired accounts with MetaMask
  - See https://medium.com/@kacharlabhargav21/using-ganache-with-remix-and-metamask-446fe5748ccf
  - Test accounts are configured inside **lib/Users.js**
5. Navigate into the root directory of the repository
6. Install the npm packages with the following command
```
npm install
```
7. Deploy the Smart Contract with the following command
```
truffle deploy
```


## Run
To start the application in development mode, simply run the following command. The application will then be available through *http://localhost:8000*. Use Google Chrome to access the site.
```
npm run dev
```