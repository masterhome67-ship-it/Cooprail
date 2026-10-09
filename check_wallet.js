const fs = require('fs');
const path = require('path');
const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } = require('@solana/web3.js');
const { getAssociatedTokenAddress, getAccount } = require('@solana/spl-token');

// Mint oficial de USDC na Solana Devnet (Circle)
const USDC_DEVNET_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

const WALLET_PATH = path.join(__dirname, '.wallet.json');
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

async function main() {
    let keypair;
    if (fs.existsSync(WALLET_PATH)) {
        const secret = JSON.parse(fs.readFileSync(WALLET_PATH, 'utf-8'));
        keypair = Keypair.fromSecretKey(new Uint8Array(secret));
        console.log('🔑 Carteira carregada existente:');
    } else {
        keypair = Keypair.generate();
        fs.writeFileSync(WALLET_PATH, JSON.stringify(Array.from(keypair.secretKey)), { mode: 0o600 });
        console.log('🆕 Nova carteira Devnet gerada e salva em .wallet.json:');
    }

    const publicKey = keypair.publicKey;
    console.log(`📍 Endereço (Public Key): ${publicKey.toBase58()}`);
    console.log(`🌐 Cluster: Devnet (${RPC_URL})\n`);

    const connection = new Connection(RPC_URL, 'confirmed');

    // 1. Verificar saldo de SOL
    let solBalance = 0;
    try {
        const balanceLamports = await connection.getBalance(publicKey);
        solBalance = balanceLamports / LAMPORTS_PER_SOL;
        console.log(`💰 Saldo de SOL: ${solBalance} SOL`);
    } catch (err) {
        console.error('Erro ao consultar saldo SOL:', err.message);
    }

    // Se SOL for 0, tentar airdrop automático
    if (solBalance === 0) {
        console.log('\n⏳ Tentando solicitar 1 SOL via airdrop RPC...');
        try {
            const airdropSig = await connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL);
            const latestBlockhash = await connection.getLatestBlockhash();
            await connection.confirmTransaction({
                signature: airdropSig,
                ...latestBlockhash
            });
            const newBal = await connection.getBalance(publicKey);
            solBalance = newBal / LAMPORTS_PER_SOL;
            console.log(`✅ Airdrop confirmado! Novo saldo de SOL: ${solBalance} SOL`);
        } catch (err) {
            console.log(`⚠️ Airdrop automático via RPC limitado: ${err.message}`);
            console.log(`👉 Use o web faucet oficial: https://faucet.solana.com/ ou https://faucet.quicknode.com/solana/devnet`);
        }
    }

    // 2. Verificar saldo de USDC na Devnet
    console.log(`\n💵 Consultando saldo de Devnet USDC (Mint: ${USDC_DEVNET_MINT.toBase58()})...`);
    try {
        const ata = await getAssociatedTokenAddress(USDC_DEVNET_MINT, publicKey);
        console.log(`📍 Conta de Token Associada (ATA): ${ata.toBase58()}`);
        
        try {
            const tokenAccount = await getAccount(connection, ata);
            const usdcBalance = Number(tokenAccount.amount) / 1_000_000;
            console.log(`💵 Saldo de USDC Devnet: ${usdcBalance} USDC`);
        } catch (accountErr) {
            console.log(`ℹ️ Conta de Token ainda não inicializada ou saldo zero: 0.00 USDC`);
            console.log(`👉 Pegue USDC Devnet no Faucet da Circle: https://faucet.circle.com/ (Selecione Solana Devnet)`);
            console.log(`   Ou faça swap no Jupiter Devnet: https://jup.ag (ou via CLI)`);
        }
    } catch (err) {
        console.error('Erro ao verificar ATA de USDC:', err.message);
    }

    console.log('\n----------------------------------------');
    console.log('STATUS FINAL DOS SALDOS NA DEVNET:');
    console.log(`• SOL (Taxas):  ${solBalance > 0 ? '✅ ' + solBalance + ' SOL' : '❌ 0 SOL (Abastecer no faucet)'}`);
    console.log('----------------------------------------');
}

main().catch(console.error);
