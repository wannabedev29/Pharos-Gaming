import axios from "axios";
import { ethers } from "ethers";
import dotenv from "dotenv";
import chalk from "chalk";
import fs from "fs";
import figlet from "figlet";
import gradient from "gradient-string";

dotenv.config();


 // BANGER GAMMING !!!
function showBanner() {
    console.clear();
    figlet.text("Wanna Be DEV29", {
        font: 'Slant',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    }, function (err, data) {
        if (err) {
            console.log('❌ Error rendering banner.');
            return;
        }
        console.log(gradient.pastel.multiline(data));
        console.log(chalk.green.bold("=== Powered by s4dmumu ==="));
        console.log(gradient.rainbow(`Twitter: @s4dmumu\n`));
    });
}
// Konfigurasi
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error(chalk.red("❌ PRIVATE_KEY tidak ditemukan di .env"));
  process.exit(1);
}

const RPC_URL = "https://testnet.dplabs-internal.com";
const API_BASE_URL = "https://api.pharosnetwork.xyz";

// Kontrak Address
const WPHRS_ADDRESS = "0x76aaada469d23216be5f7c596fa25f282ff9b364";
const USDT_ADDRESS = "0xed59de2d7ad9c043442e381231ee3646fc3c2939";
const USDC_ADDRESS = "0xAD902CF99C2dE2f1Ba5ec4D642Fd7E49cae9EE37";

// Pisahkan kontrak untuk swap dan liquidity
const SWAP_ROUTER_ADDRESS = "0x1a4de519154ae51200b0ad7c90f7fac75547888a"; // Untuk swap
const POSITION_MANAGER_ADDRESS = "0xf8a1d4ff0f9b9af7ce58e1fc1833688f3bfd6115"; // Untuk add liquidity

// Simbol Token
const TOKEN_SYMBOLS = {
  [WPHRS_ADDRESS.toLowerCase()]: "WPHRS",
  [USDT_ADDRESS.toLowerCase()]: "USDT",
  [USDC_ADDRESS.toLowerCase()]: "USDC"
};

function tokenSymbol(address) {
  return TOKEN_SYMBOLS[address.toLowerCase()] || short(address);
}

// ABI
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

// ABI untuk Swap Router
const SWAP_ROUTER_ABI = [
  "function multicall(uint256 deadline, bytes[] calldata data) external payable returns (bytes[] memory results)",
  "function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)"
];

// ABI untuk Position Manager (add liquidity)
const POSITION_MANAGER_ABI = [
  "function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline)) external payable returns (uint128 liquidity, uint256 amount0, uint256 amount1)",
  "function refundETH() external payable"
];

// Header HTTP
const COMMON_HEADERS = {
  Origin: "https://testnet.pharosnetwork.xyz",
  Referer: "https://testnet.pharosnetwork.xyz/",
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
};

// Fungsi Utilitas
function short(hash) {
  return hash.slice(0, 6) + "..." + hash.slice(-4);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getTurnstileToken() {
  // Implementasikan solusi Cloudflare Turnstile di sini
  return "dummy-token";
}

async function approveIfNeeded(wallet, tokenAddress, spender, amount) {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
  const allowance = await token.allowance(wallet.address, spender);

  if (allowance < amount) {
    console.log(chalk.yellow(`🔄 Approving ${tokenSymbol(tokenAddress)}...`));
    const tx = await token.approve(spender, ethers.MaxUint256);
    await tx.wait();
    console.log(chalk.green(`✅ Approval success for ${tokenSymbol(tokenAddress)}`));
    await sleep(2000);
  }
}
// --- Helper: waitForReceiptWithRetry ---
async function waitForReceiptWithRetry(provider, txHash, retries = 5, delay = 7000) {
  for (let i = 0; i < retries; i++) {
    try {
      const receipt = await provider.getTransactionReceipt(txHash);
      if (receipt) return receipt;
    } catch (err) {
      console.log(chalk.yellow(`⏳ Retry (${i + 1}/${retries}) waiting for receipt of ${txHash}`));
    }
    await sleep(delay);
  }
  throw new Error(`Gagal mendapatkan receipt untuk tx: ${txHash}`);
}

// Fungsi Send to Address
async function sendPHRSToAddresses(wallet, amountPHRS) {
  try {
    const raw = fs.readFileSync('./PHAROSSS.txt', 'utf8');
    const allAddresses = raw
      .split('\n')
      .map(line => line.trim())
      .filter(addr => ethers.isAddress(addr));

    if (allAddresses.length === 0) {
      console.log(chalk.red("❌ Tidak ada alamat valid di PHAROSSS.txt"));
      return 0;
    }

    const selected = allAddresses
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);

    const amountInWei = ethers.parseEther(amountPHRS);
    const balance = await wallet.provider.getBalance(wallet.address);
    const totalNeeded = amountInWei * BigInt(selected.length);

    if (balance < totalNeeded) {
      console.log(chalk.red(`❌ Saldo tidak cukup untuk mengirim ke ${selected.length} address`));
      return 0;
    }

    let nonce = await wallet.getNonce();
    let successCount = 0;
    for (const to of selected) {
      console.log(chalk.yellow(`🚀 Mengirim ${amountPHRS} PHRS ke ${to}...`));
      try {
        const tx = await wallet.sendTransaction({
          to,
          value: amountInWei,
          gasLimit: 30000,
          nonce: nonce++
        });
        const receipt = await waitForReceiptWithRetry(wallet.provider, tx.hash);
        console.log(chalk.green(`✅ Sukses kirim ke ${to}: https://testnet.pharosscan.xyz/tx/${tx.hash}`));
        successCount++;
      } catch (err) {
        console.log(chalk.red(`❌ Gagal kirim ke ${to}: ${err.message}`));
      }
      await sleep(10000);
    }
    return successCount;
  } catch (err) {
    console.error(chalk.red("❌ Gagal kirim PHRS:"), err.message);
    return 0;
  }
}

// Update untuk swap
async function swap(wallet, fromToken, toToken, amountIn) {
  try {
    const decimals = 18;
    const amount = ethers.parseUnits(amountIn, decimals);
    const token = new ethers.Contract(fromToken, ERC20_ABI, wallet);
    const balance = await token.balanceOf(wallet.address);

    if (balance < amount) {
      throw new Error(`Saldo tidak cukup. Memiliki: ${ethers.formatUnits(balance, decimals)}, Butuh: ${amountIn}`);
    }

    await approveIfNeeded(wallet, fromToken, SWAP_ROUTER_ADDRESS, amount);

    const router = new ethers.Contract(SWAP_ROUTER_ADDRESS, SWAP_ROUTER_ABI, wallet);
    const deadline = Math.floor(Date.now() / 1000) + 600;

    function getSwapData() {
      const iface = new ethers.Interface(SWAP_ROUTER_ABI);
      const minOut = amount * 98n / 100n;
      const params = {
        tokenIn: fromToken,
        tokenOut: toToken,
        fee: 500,
        recipient: wallet.address,
        amountIn: amount,
        amountOutMinimum: minOut,
        sqrtPriceLimitX96: 0
      };
      return iface.encodeFunctionData("exactInputSingle", [params]);
    }

    const swapData = getSwapData();
    const calldata = [swapData];
    let gasEstimate;
    try {
      gasEstimate = await router.multicall.estimateGas(deadline, calldata);
    } catch (err) {
      gasEstimate = 200000;
    }

    const tx = await router.multicall(deadline, calldata, {
      gasLimit: Math.floor(Number(gasEstimate) * 1.5)
    });

    const receipt = await waitForReceiptWithRetry(wallet.provider, tx.hash);
    console.log(chalk.green(`✅ Swap berhasil: https://testnet.pharosscan.xyz/tx/${tx.hash} (Gas: ${receipt.gasUsed})`));
    await sleep(3000);
    return true;
  } catch (err) {
    console.error(chalk.red(`❌ Swap gagal (${tokenSymbol(fromToken)} → ${tokenSymbol(toToken)}):`), err.message);
    return false;
  }
}

// Update untuk addLiquidity
async function addLiquidity(wallet, amountWPHRS, amountUSDC) {
  try {
    const amount0 = ethers.parseUnits(amountWPHRS, 18);
    const amount1 = ethers.parseUnits(amountUSDC, 18);

    const wphrsBalance = await new ethers.Contract(WPHRS_ADDRESS, ERC20_ABI, wallet).balanceOf(wallet.address);
    const usdcBalance = await new ethers.Contract(USDC_ADDRESS, ERC20_ABI, wallet).balanceOf(wallet.address);

    if (wphrsBalance < amount0 || usdcBalance < amount1) {
      throw new Error("Saldo tidak cukup untuk add liquidity");
    }

    await approveIfNeeded(wallet, WPHRS_ADDRESS, POSITION_MANAGER_ADDRESS, amount0);
    await approveIfNeeded(wallet, USDC_ADDRESS, POSITION_MANAGER_ADDRESS, amount1);
    await sleep(5000);

    const positionManager = new ethers.Contract(POSITION_MANAGER_ADDRESS, POSITION_MANAGER_ABI, wallet);
    const deadline = Math.floor(Date.now() / 1000) + 1200;
    const mintParams = {
      token0: WPHRS_ADDRESS,
      token1: USDC_ADDRESS,
      fee: 500,
      tickLower: -887220,
      tickUpper: 887220,
      amount0Desired: amount0,
      amount1Desired: amount1,
      amount0Min: 0,
      amount1Min: 0,
      recipient: wallet.address,
      deadline
    };

    const tx = await positionManager.mint(mintParams, {
      gasLimit: 2_000_000,
      maxPriorityFeePerGas: ethers.parseUnits("3", "gwei"),
      maxFeePerGas: ethers.parseUnits("30", "gwei")
    });

    const receipt = await waitForReceiptWithRetry(wallet.provider, tx.hash);
    if (receipt.status === 1) {
      console.log(chalk.green(`✅ Liquidity sukses: https://testnet.pharosscan.xyz/tx/${tx.hash}`));
      return true;
    } else {
      throw new Error("Transaksi direvert oleh blockchain");
    }
  } catch (err) {
    console.error(chalk.red("❌ Gagal add liquidity:"), err.message);
    return false;
  }
}
// Fungsi untuk Wrap PHRS
async function wrapPHRS(wallet, amount) {
  try {
    const amountWei = ethers.parseEther(amount);
    const tx = await wallet.sendTransaction({
      to: WPHRS_ADDRESS,
      value: amountWei,
      data: "0xd0e30db0", // Deposit function selector
      gasLimit: 100000
    });
    const receipt = await tx.wait();
    console.log(chalk.green(`✅ Wrapped: ${short(tx.hash)} (Gas: ${receipt.gasUsed})`));
    await sleep(2000);
    return true;
  } catch (err) {
    console.error(chalk.red("❌ Gagal wrap PHRS:"), err.message);
    return false;
  }
}

// Fungsi untuk Check-in
async function checkIn(address, jwt) {
  const url = `${API_BASE_URL}/sign/in?address=${address}`;
  try {
    const resp = await axios.post(url, null, {
      headers: { ...COMMON_HEADERS, Authorization: `Bearer ${jwt}` }
    });
    if (resp.data?.code === 0) {
      console.log(chalk.green("✅ Check-in berhasil!"));
      return true;
    }
    console.log(chalk.yellow("⚠️ Response check-in:", resp.data?.msg || "Unknown"));
    return false;
  } catch (err) {
    console.error(chalk.red("❌ Error check-in:"), err.response?.data || err.message);
    return false;
  }
}

// Fungsi untuk Claim Faucet
async function canClaimPHRSFaucet(jwt) {
  try {
    const res = await axios.get(`${API_BASE_URL}/faucet/status`, {
      headers: { ...COMMON_HEADERS, Authorization: `Bearer ${jwt}` }
    });
    return res.data?.data?.can_claim || false;
  } catch (e) {
    console.error(chalk.red("❌ Error cek status faucet:"), e.response?.data || e.message);
    return false;
  }
}

async function claimFaucetPHRS(address, jwt) {
  try {
    const canClaim = await canClaimPHRSFaucet(jwt);
    if (!canClaim) {
      console.log(chalk.yellow("⚠️ Faucet PHRS dalam cooldown"));
      return false;
    }

    const res = await axios.post(`${API_BASE_URL}/faucet/daily?address=${address}`, {}, {
      headers: { ...COMMON_HEADERS, Authorization: `Bearer ${jwt}` }
    });
    
    if (res.data?.code === 0) {
      console.log(chalk.green("✅ Berhasil claim PHRS faucet"));
      return true;
    } else {
      console.log(chalk.yellow("⚠️ Faucet PHRS:", res.data?.msg || "Unknown"));
      return false;
    }
  } catch (e) {
    console.error(chalk.red("❌ Error claim PHRS faucet:"), e.response?.data || e.message);
    return false;
  }
}

async function claimFaucetUSDT(address) {
  try {
    const turnstileResponse = await getTurnstileToken();
    const res = await axios.post(
      "https://testnet-router.zenithswap.xyz/api/v1/faucet",
      {
        tokenAddress: USDT_ADDRESS,
        userAddress: address
      },
      {
        headers: {
          ...COMMON_HEADERS,
          'CFTurnstileResponse': turnstileResponse
        }
      }
    );
    
    if (res.data?.status === 200) {
      console.log(chalk.green(`✅ Berhasil claim USDT faucet. Tx: ${res.data?.data?.txHash}`));
      return true;
    } else {
      console.log(chalk.yellow("⚠️ Faucet USDT:", res.data?.message || "Unknown"));
      return false;
    }
  } catch (e) {
    console.error(chalk.red("❌ Error claim USDT faucet:"), e.response?.data || e.message);
    return false;
  }
}

// Fungsi untuk Tampilkan Profil
async function tampilkanProfil(jwt, address, provider) {
  try {
    const url = `${API_BASE_URL}/user/profile?address=${address}`;
    const res = await axios.get(url, {
      headers: { ...COMMON_HEADERS, Authorization: `Bearer ${jwt}` }
    });
    
    const p = res.data?.data?.user_info || {};
    const onchain = await provider.getBalance(address);
    
    console.log("\n📋 PROFIL ANDA\n" + "─".repeat(40));
    console.log("🆔 User ID      :", p.ID || "N/A");
    console.log("👛 Address      :", p.Address || address);
    console.log("💰 Wallet PHRS  :", ethers.formatEther(onchain));
    console.log("💰 Balance      :", res.data?.data?.balance ?? 0);
    console.log("⭐ Total Points :", p.TotalPoints || 0);
    console.log("📋 Task Points  :", p.TaskPoints || 0);
    console.log("🎉 Invite Pts   :", p.InvitePoints || 0);
    console.log("📅 Dibuat pada  :", p.CreateTime ? new Date(p.CreateTime).toLocaleString() : "N/A");
    console.log("🔄 Diupdate pada:", p.UpdateTime ? new Date(p.UpdateTime).toLocaleString() : "N/A");
    console.log("🎫 Kode Undangan:", p.InviteCode || "N/A");
    console.log("👤 KOL?         :", p.IsKol ? "Ya" : "Tidak");
    console.log("─".repeat(40));
    return true;
  } catch (err) {
    console.error(chalk.red("❌ Gagal memuat profil:"), err.message);
    return false;
  }
}
// Fungsi Utama
async function main() {
  try {
    showBanner();
    console.log(chalk.blue.bold("\n🔐 Memulai proses login..."));
    
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const address = await wallet.getAddress();

// Verifikasi jaringan
const network = await provider.getNetwork();
if (network.chainId !== 688688n) {
  throw new Error(`Jaringan salah! Harusnya 688688, dapat ${network.chainId}`);
}

// Mapping nama jaringan manual
const networkNames = {
  688688: 'Pharos Network',
};

const chainId = Number(network.chainId);
const networkName = networkNames[chainId] || network.name || 'unknown';

console.log(chalk.blue(`🌐 Terhubung ke: ${networkName} (Chain ID: ${chainId})`));

    // Cek saldo
    const balance = await provider.getBalance(address);
    console.log(chalk.blue(`💰 Saldo: ${ethers.formatEther(balance)} PHRS`));

    // Login
    console.log(chalk.blue("\n🔑 Login ke Pharos Network..."));
    const signature = await wallet.signMessage("pharos");
    const loginResp = await axios.post(
      `${API_BASE_URL}/user/login?address=${address}&signature=${signature}`,
      null,
      { headers: COMMON_HEADERS }
    );
    const jwt = loginResp.data?.data?.jwt;
    if (!jwt) throw new Error("Login gagal - tidak mendapat JWT");
    console.log(chalk.green("✅ Login berhasil!"));

    // Jalankan tugas
    console.log(chalk.blue("\n🏃 Menjalankan tugas harian..."));
    
    await checkIn(address, jwt);
    await claimFaucetPHRS(address, jwt);
    await claimFaucetUSDT(address);
    await tampilkanProfil(jwt, address, provider);
    
    // Wrap PHRS jika saldo cukup
    const wrapAmount = "0.05";
    if (balance >= ethers.parseEther(wrapAmount)) {
      await wrapPHRS(wallet, wrapAmount);
    } else {
      console.log(chalk.yellow(`⚠️ Saldo PHRS tidak cukup untuk wrap (diperlukan: ${wrapAmount})`));
    }

    // Lakukan swap menggunakan Swap Router
    console.log(chalk.yellow("\n🔁 Memulai swap..."));
    
    const swapAmount = "0.001";
    const targetSuccess = 10;
    const maxAttempts = 15;
    
  // Swap ke USDC
  let usdcSuccess = 0;
    for (let i = 0; i < maxAttempts && usdcSuccess < targetSuccess; i++) {
    console.log(chalk.gray(`🔄 Attempt ${i + 1} swap USDC...`)); // <--- pindahkan ke sini
    const success = await swap(wallet, WPHRS_ADDRESS, USDC_ADDRESS, swapAmount);
    if (success) usdcSuccess++;
}
// Swap ke USDT
let usdtSuccess = 0;
    for (let i = 0; i < maxAttempts && usdtSuccess < targetSuccess; i++) {
    console.log(chalk.gray(`🔄 Attempt ${i + 1} swap USDT...`)); // tambahkan juga untuk USDT agar konsisten
    const success = await swap(wallet, WPHRS_ADDRESS, USDT_ADDRESS, swapAmount);
    if (success) usdtSuccess++;
}
    console.log(chalk.green.bold("\n🎉 Semua swap selesai!"));
    console.log(chalk.blue(`🔹 Swap USDC berhasil: ${usdcSuccess}`));
    console.log(chalk.blue(`🔹 Swap USDT berhasil: ${usdtSuccess}`));
    
    // Tambahkan liquidity menggunakan Position Manager
      console.log(chalk.yellow("\n➕ Memulai penambahan liquidity..."));

      const liquidityWPHRS = "0.001";
      const liquidityUSDC = "0.001";
      const liquidityTargetSuccess = 5;
      const maxLiquidityAttempts = 10;
      let liquiditySuccess = 0;

  for (let i = 0; i < maxLiquidityAttempts && liquiditySuccess < liquidityTargetSuccess; i++) {
    console.log(chalk.gray(`🔄 Attempt ${i + 1} add liquidity...`));
    const success = await addLiquidity(wallet, liquidityWPHRS, liquidityUSDC);
  if (success) {
    liquiditySuccess++;
    await sleep(14000);
  }
}

console.log(chalk.green(`\n✅ Add liquidity selesai. Total sukses: ${liquiditySuccess}/${liquidityTargetSuccess}`));
if (liquiditySuccess < liquidityTargetSuccess) {
  console.log(chalk.red(`⚠️ Hanya berhasil ${liquiditySuccess} dari ${liquidityTargetSuccess} percobaan`));
}
 const sendSuccessCount = await sendPHRSToAddresses(wallet, "0.001");
    console.log(chalk.green.bold(`\n🏁 Semua tugas selesai!`));
    console.log(chalk.blue(`🔹 Swap berhasil      : ${usdcSuccess} USDC, ${usdtSuccess} USDT`));
    console.log(chalk.blue(`🔹 Liquidity berhasil : ${liquiditySuccess} kali`));
    console.log(chalk.blue(`🔹 PHRS terkirim      : ${sendSuccessCount} address`));

  } catch (err) {
    console.error(chalk.red.bold("\n❌ Error utama:"), err.message);
    if (err.stack) {
      console.error(chalk.red("Stack trace:"), err.stack);
    }
    console.log(chalk.red("⚠️ Gagal di main(). Script tetap berjalan..."));
  }
}
async function startLoop() {
  while (true) {
    try {
      await main();
      console.log(chalk.magenta.bold(`\n⏳ Menunggu 12 jam untuk menjalankan ulang...\n`));
      await sleep(12 * 60 * 60 * 1000);
    } catch (err) {
      console.error(chalk.red("\n⚠️ Loop error:"), err.message);
      console.log(chalk.yellow("🔁 Mencoba ulang dalam 5 menit...\n"));
      await sleep(5 * 60 * 1000); // 5 menit
    }
  }
}
await startLoop();