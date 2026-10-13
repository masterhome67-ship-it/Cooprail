const fs = require('fs');
const path = require('path');
const {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} = require('@solana/web3.js');
const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} = require('@solana/spl-token');

const RPC_URL = process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899';
const WALLET_PATH = path.join(__dirname, '.wallet.json');

// Carteira Phantom do usuário
const USER_PHANTOM_PUBKEY = new PublicKey('oWRe9YsoE3HZ3RXt2W9QLEdk6eWzRtfXSaTtyrLSwJi');

async function main() {
  console.log('================================================================');
  console.log('🪙 COOPRAIL - PROTOCOLO DE CRIAÇÃO DO TOKEN REAL (SPL TOKEN)');
  console.log('================================================================\n');

  if (!fs.existsSync(WALLET_PATH)) {
    console.error('❌ Arquivo .wallet.json não encontrado!');
    process.exit(1);
  }

  const secret = JSON.parse(fs.readFileSync(WALLET_PATH, 'utf-8'));
  const payer = Keypair.fromSecretKey(new Uint8Array(secret));
  const connection = new Connection(RPC_URL, 'confirmed');

  console.log(`📍 Carteira Emissora (Payer/Authority): ${payer.publicKey.toBase58()}`);
  console.log(`👤 Carteira Phantom do Usuário: ${USER_PHANTOM_PUBKEY.toBase58()}`);
  console.log(`🌐 Cluster RPC Ativo: ${RPC_URL}\n`);

  // 1. Verifica saldos
  const balancePayer = (await connection.getBalance(payer.publicKey)) / LAMPORTS_PER_SOL;
  const balanceUser = (await connection.getBalance(USER_PHANTOM_PUBKEY)) / LAMPORTS_PER_SOL;
  console.log(`💰 Saldo Carteira Emissora: ${balancePayer} SOL`);
  console.log(`💰 Saldo Carteira Phantom: ${balanceUser} SOL\n`);

  // 2. Cria o Mint do Token SPL on-chain
  console.log('🔨 1. Registrando novo Mint do Token COOP na blockchain Solana...');
  const decimals = 6;
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey, // mintAuthority
    payer.publicKey, // freezeAuthority
    decimals,
    undefined,
    undefined,
    TOKEN_PROGRAM_ID
  );

  console.log(`✅ Mint criado com sucesso on-chain!`);
  console.log(`📍 Endereço do Mint do Token: ${mint.toBase58()}\n`);

  // 3. Cria a ATA da carteira emissora
  console.log('💼 2. Criando Conta de Token Associada (ATA) para a tesouraria...');
  const treasuryAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );
  console.log(`✅ ATA Tesouraria: ${treasuryAta.address.toBase58()}`);

  // 4. Cria a ATA para a carteira Phantom do usuário
  console.log('💼 3. Criando Conta de Token Associada (ATA) para a sua Phantom...');
  const userAta = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    USER_PHANTOM_PUBKEY
  );
  console.log(`✅ ATA da sua Phantom: ${userAta.address.toBase58()}\n`);

  // 5. Emissão dos Tokens (Minting)
  console.log('🚀 4. Emitindo 1.000.000 COOP (500.000 para a sua Phantom + 500.000 para tesouraria)...');
  const amountPerWallet = BigInt(500_000) * BigInt(10 ** decimals);

  const txUser = await mintTo(
    connection,
    payer,
    mint,
    userAta.address,
    payer.publicKey,
    amountPerWallet
  );
  console.log(`✅ 500.000 COOP depositados na sua Phantom! Tx: ${txUser}`);

  const txTreasury = await mintTo(
    connection,
    payer,
    mint,
    treasuryAta.address,
    payer.publicKey,
    amountPerWallet
  );
  console.log(`✅ 500.000 COOP depositados na Tesouraria! Tx: ${txTreasury}\n`);

  const tokenData = {
    name: 'Cooprail Procurement Token',
    symbol: 'COOP',
    decimals,
    totalSupply: 1_000_000,
    mintAddress: mint.toBase58(),
    userPhantomAddress: USER_PHANTOM_PUBKEY.toBase58(),
    userTokenAccountAddress: userAta.address.toBase58(),
    treasuryTokenAccountAddress: treasuryAta.address.toBase58(),
    authorityAddress: payer.publicKey.toBase58(),
    rpcUrl: RPC_URL,
    explorerMintUrl: `https://explorer.solana.com/address/${mint.toBase58()}?customUrl=${encodeURIComponent(RPC_URL)}`,
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(path.join(__dirname, 'token_info.json'), JSON.stringify(tokenData, null, 2));

  console.log('================================================================');
  console.log('🎉 SUCESSO ABSOLUTO! TOKEN REAL EMITIDO NA BLOCKCHAIN SOLANA!');
  console.log('================================================================');
  console.log(`🪙 Símbolo: ${tokenData.symbol}`);
  console.log(`🏷️ Nome: ${tokenData.name}`);
  console.log(`📍 Endereço do Mint: ${tokenData.mintAddress}`);
  console.log(`👤 Sua Carteira Phantom: ${tokenData.userPhantomAddress}`);
  console.log(`💼 Sua Conta de Tokens (ATA): ${tokenData.userTokenAccountAddress}`);
  console.log(`📦 Saldo Creditado na sua Phantom: 500.000 COOP`);
  console.log(`🏛️ Saldo na Tesouraria Cooprail: 500.000 COOP`);
  console.log(`🌐 Total Supply On-Chain: 1.000.000 COOP`);
  console.log(`🔎 Link no Solana Explorer: ${tokenData.explorerMintUrl}`);
  console.log('================================================================\n');
}

main().catch((err) => {
  console.error('❌ Falha ao emitir token:', err);
  process.exit(1);
});
