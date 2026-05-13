const MNEMONICS: Record<string, string> = {
  ETHEREUM:
    process.env.MNEMONIC_ETHEREUM ??
    'object identify budget trim law giraffe total club ocean orbit behind uncover',
  SOLANA:
    process.env.MNEMONIC_SOLANA ??
    'object identify budget trim law giraffe total club ocean orbit behind uncover',
  BITCOIN:
    process.env.MNEMONIC_BITCOIN ??
    'object identify budget trim law giraffe total club ocean orbit behind uncover',
};

export const getMnemonic = (chainName: string): string | null => {
  const key = chainName.toUpperCase();
  return MNEMONICS[key] ?? null;
};
