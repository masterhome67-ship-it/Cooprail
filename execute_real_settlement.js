const fs = require('fs');
const path = require('path');
const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');

// Configurações da Rede
const RPC_URL = process.env.SOLANA_RPC_URL || 'http://127.0.0.1:8899';
const WALLET_PATH = path.join(__dirname, '.wallet.json');

// SPL Memo Program v2 (Programa Oficial da Solana para registrar metadados on-chain)
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

async function main() {
  console.log('================================================================');
  console.log('⚡ COOPRAIL B2B - PROTOCOLO DE LIQUIDAÇÃO REAL NA SOLANA DEVNET');
  console.log('================================================================\n');

  if (!fs.existsSync(WALLET_PATH)) {
    console.error('❌ Arquivo .wallet.json não encontrado!');
    process.exit(1);
  }

  const secret = JSON.parse(fs.readFileSync(WALLET_PATH, 'utf-8'));
  const payer = Keypair.fromSecretKey(new Uint8Array(secret));
  const connection = new Connection(RPC_URL, 'confirmed');

  console.log(`📍 Carteira Pagadora: ${payer.publicKey.toBase58()}`);
  console.log(`🌐 Cluster: Solana Devnet (${RPC_URL})`);

  // 1. Verifica saldo de SOL
  const balanceLamports = await connection.getBalance(payer.publicKey);
  const solBalance = balanceLamports / LAMPORTS_PER_SOL;
  console.log(`💰 Saldo Atual: ${solBalance} SOL\n`);

  if (solBalance < 0.001) {
    console.error('❌ Saldo insuficiente para pagar a taxa de rede da transação on-chain!');
    console.log('👉 Por favor, envie 0.5 a 1 SOL Devnet para o endereço:');
    console.log(`   ${payer.publicKey.toBase58()}`);
    console.log('   Faucet oficial: https://faucet.solana.com/');
    process.exit(1);
  }

  // 2. Parâmetros da Ordem de Compra Industrial Real
  const poCode = 'PO-2026-COOPRAIL-01';
  const supplierName = 'Metalúrgica Ferro & Aço Nacional S.A.';
  const totalBrl = 45000.0;
  const usdRate = 5.60;
  const usdcEquivalent = Math.round((totalBrl / usdRate) * 100) / 100;

  // Derivação determinística de PDA para custódia do pedido
  const [escrowPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('purchase_order'), Buffer.from(poCode.slice(0, 32))],
    SystemProgram.programId
  );

  console.log('📦 Dados da Ordem de Compra:');
  console.log(`   • Código PO: ${poCode}`);
  console.log(`   • Fornecedor: ${supplierName}`);
  console.log(`   • Total Faturado: R$ ${totalBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (≈ ${usdcEquivalent} USDC)`);
  console.log(`   • Conta de Custódia (PDA Derivada): ${escrowPda.toBase58()}\n`);

  // 3. Montagem da Transação Real On-Chain
  console.log('🔨 Construindo transação criptográfica...');
  const tx = new Transaction();

  // A) Transfere a caução de garantia com rent-exemption para a conta de garantia PDA
  const rentExemptMin = await connection.getMinimumBalanceForRentExemption(0);
  tx.add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: escrowPda,
      lamports: rentExemptMin + 100000, // Rent-exemption + caução da ordem
    })
  );

  // B) Grava o Memo imutável da Ordem no histórico da blockchain
  const memoPayload = JSON.stringify({
    app: 'Cooprail Enterprise Procurement',
    po: poCode,
    supplier: supplierName,
    val_brl: totalBrl,
    val_usdc: usdcEquivalent,
    settlement_type: 'smart_escrow_deposit',
    timestamp: new Date().toISOString(),
  });

  tx.add(
    new TransactionInstruction({
      keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: true }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoPayload, 'utf-8'),
    })
  );

  // 4. Envio e Confirmação da Transação na Blockchain
  console.log('🚀 Enviando e aguardando confirmação no cluster Solana Devnet...');
  const signature = await sendAndConfirmTransaction(connection, tx, [payer], {
    commitment: 'confirmed',
    preflightCommitment: 'confirmed',
  });

  const txDetails = await connection.getTransaction(signature, {
    commitment: 'confirmed',
    maxSupportedTransactionVersion: 0,
  });

  console.log('\n================================================================');
  console.log('✅ TRANSAÇÃO REAL CONFIRMADA ON-CHAIN COM SUCESSO!');
  console.log('================================================================');
  console.log(`🔗 Assinatura (Tx Hash): ${signature}`);
  console.log(`📦 Bloco / Slot: #${txDetails?.slot || 'N/A'}`);
  console.log(`⛽ Taxa Paga: ${(txDetails?.meta?.fee || 5000) / LAMPORTS_PER_SOL} SOL`);
  console.log(`🔎 Link Solana Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  console.log('================================================================\n');
}

main().catch((err) => {
  console.error('❌ Falha ao executar transação:', err);
  process.exit(1);
});
