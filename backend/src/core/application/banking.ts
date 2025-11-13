/** Bank entries are stored per ship/year as tonnes CO2e surplus available */
export type BankEntry = { shipId: string; year: number; amountT: number };


export function bankSurplus(available: number, amount: number) {
if (amount <= 0) throw new Error('Amount must be positive');
if (amount > available) throw new Error('Insufficient surplus to bank');
return available - amount;
}


export function applyBank(available: number, toApply: number) {
if (toApply <= 0) throw new Error('Apply amount must be positive');
if (toApply > available) throw new Error('Cannot apply more than available');
return available - toApply;
}
