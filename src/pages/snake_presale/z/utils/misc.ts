import { PrintDateTimeType } from '../types';

export const valueOrEmpty = (value: any): any => {
    if (typeof value === 'undefined' || value === null) {
        return '';
    } else {
        return value;
    }
};

export const shortenElrondAddress = (address: string): string => {
    return address.slice(0, 6) + '...' + address.slice(-3);
};

export const convertSecondsToLocalDateTime = (seconds: number): string => {
    return new Date(seconds * 1000).toLocaleString();
};

export const getCurrentUnixTimestamp = (): number => {
    return Math.floor(new Date().getTime() / 1000);
};

export const convertSecondsToPrintDateTime = (
    totalSeconds: number,
): PrintDateTimeType => {
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return {
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
    };
};
