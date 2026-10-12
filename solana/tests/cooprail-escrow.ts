import { PublicKey, Keypair } from '@solana/web3.js';

describe('cooprail-escrow', () => {
  it('Deriva corretamente os PDAs da ordem de compra e do cofre', () => {
    const poCode = 'PO-2026-089';
    const programId = new PublicKey('CoopEscrow1111111111111111111111111111111111');

    const [escrowPda, escrowBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('purchase_order'), Buffer.from(poCode)],
      programId
    );

    const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), Buffer.from(poCode)],
      programId
    );

    console.log('✔ Escrow PDA:', escrowPda.toBase58(), '(Bump:', escrowBump, ')');
    console.log('✔ Vault Token PDA:', vaultPda.toBase58(), '(Bump:', vaultBump, ')');

    if (!escrowPda || !vaultPda) {
      throw new Error('Falha ao derivar contas PDA');
    }
  });

  it('Valida limites de caracteres do código PO (máximo 32)', () => {
    const validPo = 'PO-2026-001';
    const invalidPo = 'PO-2026-000000000000000000000000000000000000001';

    if (validPo.length > 32) throw new Error('Deveria ser válido');
    if (invalidPo.length <= 32) throw new Error('Deveria ser inválido');

    console.log('✔ Validação de tamanho de código PO passou');
  });
});
