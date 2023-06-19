import BigNumber from 'bignumber.js';
import { BIG_NUMBER_ROUNDING_MODE } from './bignum';

export const DEFAULT_DECIMALS = 18;

export const convertWeiToEsdt = (amount: BigNumber.Value | null | undefined, decimals?: number, precision?: number): BigNumber => {
    if (amount == null) {
        return new BigNumber(0);
    } else {
        return new BigNumber(amount)
            .decimalPlaces(0, BIG_NUMBER_ROUNDING_MODE)
            .shiftedBy(typeof decimals !== 'undefined' ? -decimals : -DEFAULT_DECIMALS)
            .decimalPlaces(typeof precision !== 'undefined' ? precision : 4, BIG_NUMBER_ROUNDING_MODE);
    }
};

export const convertEsdtToWei = (amount: BigNumber.Value | null | undefined, decimals?: number): BigNumber => {
  if (amount == null) {
    return new BigNumber(0);
  } else {
    return new BigNumber(amount).shiftedBy(typeof decimals !== 'undefined' ? decimals : DEFAULT_DECIMALS).decimalPlaces(0, BIG_NUMBER_ROUNDING_MODE);
  } 
};

export const convertTokenIdentifierToTicker = (id: string): string => {
    return id.split('-')[0];
};

/*
    Token Name
    - length between 3 and 20 characters
    - alphanumeric characters only
*/
export function isValidElrondTokenName(value: string): boolean {
    return value.length >= 3 && value.length <= 20 && !!value.match(/^[0-9a-zA-Z]+$/);
}

/*
    Token Ticker
    - length between 3 and 10 characters
    - alphanumeric UPPERCASE only
*/
export function isValidElrondTokenTicker(value: string): boolean {
    return value.length >= 3 && value.length <= 10 && !!value.match(/^[0-9a-zA-Z]+$/) && value.toUpperCase() === value;
}

export function getLPTokenRatio(lpBalance: string, totalLpBalance: string, tokenReserve: string): BigNumber {
    const cLpBalance = convertWeiToEsdt(lpBalance);
    const cTotalLpBalance = totalLpBalance;
    const cTokenReserve = convertWeiToEsdt(tokenReserve);
    return cLpBalance.div(cTotalLpBalance).multipliedBy(cTokenReserve);
}
