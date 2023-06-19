import { Address } from "@multiversx/sdk-core/out";

export const ZERO_ADDRESS = 'erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu';
export const parseElrondAddress = (value: string): string => {
    return value == ZERO_ADDRESS ? '' : value;
};

export function isValidElrondAddress(value: string): boolean {
    try {
        new Address(value);
        return true;
    } catch (err) {
        return false;
    }
}
