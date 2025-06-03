Automated Pharos Network Testnet Interaction Script
Pharos Network Banner

This script automates daily interactions with the Pharos Network testnet, including claiming faucets, swapping tokens, adding liquidity, and more. Designed for efficiency and reliability.

Features
✅ Daily Automation: Runs every 12 hours

🔒 Secure: Private key stored in .env file

💸 Faucet Claims: Automatic PHRS and USDT faucet claims

🔁 Token Swaps: WPHRS → USDC and WPHRS → USDT

💧 Liquidity Provision: Adds liquidity to WPHRS/USDC pool

📊 Profile Tracking: Displays user profile and points

📤 Token Distribution: Sends PHRS to random addresses

🎨 Beautiful UI: Colorful console output with emojis

Prerequisites
Node.js v18+

npm v9+

Pharos Network Testnet Wallet (with testnet PHRS)

Install dependencies:

bash
npm install
Create .env file:

env
PRIVATE_KEY="your_testnet_private_key_here"
Configuration
Edit the following variables in PHAROSSS.txt if needed:

javascript
// Network configuration
const RPC_URL = "https://testnet.dplabs-internal.com";
const API_BASE_URL = "https://api.pharosnetwork.xyz";

// Token addresses (update if changed)
const WPHRS_ADDRESS = "0x76aaada469d23216be5f7c596fa25f282ff9b364";
const USDT_ADDRESS = "0xed59de2d7ad9c043442e381231ee3646fc3c2939";
const USDC_ADDRESS = "0xAD902CF99C2dE2f1Ba5ec4D642Fd7E49cae9EE37";

// Amount adjustments (customize as needed)
const swapAmount = "0.001";
const liquidityWPHRS = "0.00001";
const liquidityUSDC = "0.00001";
const transferAmount = "0.0001";
Usage
Run the script:

bash
node PHAROSSS.txt
The script will automatically:

Connect to Pharos testnet

Login and display your profile

Perform daily check-in

Claim PHRS and USDT faucets

Wrap PHRS to WPHRS

Execute token swaps (WPHRS → USDC and WPHRS → USDT)

Add liquidity to WPHRS/USDC pool

Distribute PHRS to random addresses

Wait 12 hours and repeat

Log Output Example
✅ Login berhasil!
✅ Berhasil claim PHRS faucet
✅ Berhasil claim USDT faucet
✅ Wrapped: 0x3a7d...f8c2
🔄 Mencoba swap 0.001 WPHRS → USDC...
✅ Swap berhasil: https://testnet.pharosscan.xyz/tx/0x... (Gas: 124532)
➕ Memulai penambahan liquidity...
✅ Liquidity sukses: https://testnet.pharosscan.xyz/tx/0x...
🏁 Semua tugas selesai!
⏳ Menunggu 12 jam untuk menjalankan ulang...
Important Notes
Testnet Only: This script is designed for Pharos TESTNET only

Fund Management: Ensure your wallet has enough testnet PHRS for gas fees

Security: Never share your .env file or private key

Monitoring: Check logs regularly for any errors

Customization: Adjust amounts in the script according to your needs

Troubleshooting
Common issues and solutions:

❌ PRIVATE_KEY tidak ditemukan:
Verify your .env file exists and contains the PRIVATE_KEY variable

❌ Jaringan salah:
Ensure you're connected to Pharos testnet (Chain ID 688688)

❌ Saldo tidak cukup:
Get testnet PHRS from the official faucet

Swap/Liquidity failures:
Check if contract addresses are still valid in the script

Contribution
Contributions are welcome! Please open an issue or PR for:

Bug fixes

New features

Documentation improvements

Disclaimer
This script is provided "as-is" for educational purposes only. Use at your own risk. The author is not responsible for any loss of funds or damages resulting from the use of this script. Always test with small amounts first.

Happy automating! 🚀 Powered by s4dmumu
Twitter: @s4dmumu
