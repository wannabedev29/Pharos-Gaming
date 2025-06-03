# 🧪 Pharos Network Testnet Automation Script

This script automates daily interactions with the Pharos Network testnet, including:

- ✅ Claiming faucets  
- 🔄 Swapping tokens  
- 💧 Adding liquidity  
- 📤 Sending native PHRS tokens to random addresses  
- 📊 Viewing profile and points  

Designed for efficiency and reliability.

---

## 🚀 Features

- ⏱ **Daily Automation:** Automatically runs every 12 hours  
- 🔒 **Secure:** Private key is securely stored in `.env`  
- 🔁 **Token Swaps:**  
  - `WPHRS → USDC`  
  - `WPHRS → USDT`  
- 💧 **Liquidity Provision:** Adds liquidity to `WPHRS/USDC` pool  
- 🧾 **Profile Tracking:** Displays user profile & points  
- 🎯 **Token Distribution:** Sends PHRS to 10 random addresses from `PHAROSSS.txt`  
- 🌈 **User-Friendly UI:** Colorful terminal with emojis and banner  

---

## ⚙️ Prerequisites

- Node.js v18+  
- npm v9+  
- `.env` file with your private key  
- Testnet wallet with test PHRS  

---

## 📦 Installation

```bash
git clone https://github.com/wannabedev29/Pharos-Gaming.git
cd Pharos-Gaming
npm install
```

---

## 🔐 Create `.env` File

Run this command in the root folder to create the .env file:

<pre><code>nano .env</code></pre>
Then paste this content:

<pre><code>PRIVATE_KEY=yourprivatekeyhere</code></pre>
Press Ctrl + O then Enter to save, and Ctrl + X to exit nano.

---

## ▶️ Run the Script

```bash
node index.js
```

Script will automatically:

- Login to Pharos  
- Claim faucet  
- Wrap PHRS  
- Swap tokens  
- Add liquidity  
- Send PHRS to 10 random addresses  
- Wait 12 hours and repeat  

---

## 📁 File Structure

```
Pharos-Gaming/
├── index.js         # Main script
├── .env             # Your private key
├── PHAROSSS.txt     # List of addresses to receive PHRS
└── README.md
```

---

## 📜 License

MIT
