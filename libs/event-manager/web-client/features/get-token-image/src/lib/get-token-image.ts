import { ENV, TokenListProvider } from '@solana/spl-token-registry';

export interface TokenData {
  logoURI: string;
  symbol: string;
}

export async function getTokenData(acceptedMint: string): Promise<TokenData> {
  const tokens = await new TokenListProvider().resolve();
  const tokenList = tokens.filterByChainId(ENV.MainnetBeta).getList();

  // also filter by ChainID ??
  const token = tokenList.filter((token) => token.address == acceptedMint);

  return { logoURI: token[0].logoURI as string, symbol: token[0].symbol };
}
