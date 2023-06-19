import BigNumber from 'bignumber.js';

export const BIG_NUMBER_ROUNDING_MODE = BigNumber.ROUND_FLOOR;

export const parseBigNumber = (value: BigNumber.Value | null): BigNumber => {
    try {
        if (value != null) {
            return new BigNumber(value);
        }
    } catch (err) {
    }
    return new BigNumber(0);
};

export const isPositiveOrZeroBigNumber = (value: BigNumber.Value): boolean => {
    try {
        if (typeof value === typeof '' && !value) {
            return false;
        }
        return new BigNumber(value).comparedTo(0) >= 0;
    } catch (err) {
        return false;
    }
};

export const isPositiveBigNumber = (value: BigNumber.Value): boolean => {
    try {
        return new BigNumber(value).comparedTo(0) > 0;
    } catch (err) {
        return false;
    }
};

//
const localDecimalSeparator = 0.1.toLocaleString().replace(/\d/g, '');
const bgFormatter = {
    decimalSeparator: localDecimalSeparator,
    groupSeparator: localDecimalSeparator == '.' ? ',' : '.',
    groupSize: 3
};

export const convertBigNumberToLocalString = (
    value: BigNumber.Value,
    precision?: number,
): string => {
    let bv = parseBigNumber(value);
    bv = bv.isNaN() ? new BigNumber(0) : bv;
    let v = bv.toFormat(precision ? precision : 4, BIG_NUMBER_ROUNDING_MODE, bgFormatter);
    
    // remove trailing zeros
    if (v.search(localDecimalSeparator) >= 0) {
        v = v.replace(/\.?0+$/, '');
    }
    
    return v;
};

const convertBigNumberToInputStringFormatter = {
    decimalSeparator: '.',
    groupSeparator: '',
    groupSize: 3
};

export const convertBigNumberToInputString = (
    value: BigNumber.Value,
    decimals: number,
): string => {
    let bv = parseBigNumber(value);
    bv = bv.isNaN() ? new BigNumber(0) : bv;
    let v = bv.toFormat(decimals, BIG_NUMBER_ROUNDING_MODE, convertBigNumberToInputStringFormatter);
    
    // remove trailing zeros
    if (v.search('.') >= 0) {
        v = v.replace(/\.?0+$/, '');
    }
    
    return v;
};

export function parseNumberOrFail(value: string): number | null {
    try {
        return Number(value);
    } catch (err) {
        return null;
    }
}

export function applyPrecision(value: number, precision: number) {
    const k = Math.pow(10, precision);
    return Math.floor(value * k) / k;
}
