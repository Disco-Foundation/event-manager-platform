pub fn get_tokens_amounts(token_a: u64, swap_ratio: u16) -> (u64, u64) {
  let token_b: u64 = token_a * (swap_ratio as u64);
  (token_a, token_b)
}
