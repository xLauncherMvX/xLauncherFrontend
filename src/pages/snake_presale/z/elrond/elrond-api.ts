import { NftType, TokenType } from '@multiversx/sdk-dapp/types/tokens.types';
import axios from 'axios';
import { ELROND_API_URL } from '../../config';
import {
    ElrondStatsType,
    TokenBalanceType,
    TokenInfoType,
} from '../types';
import {
    convertSecondsToPrintDateTime,
    convertTokenIdentifierToTicker,
} from '../utils';

export const axoisConfig = {
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json;charset=UTF-8',
    },
};

export async function getTokenBalanceFromApi(
    address: string,
    tokenId: string,
): Promise<TokenBalanceType | undefined> {
    const configUrl = `${ELROND_API_URL}/accounts/${address}/tokens/${tokenId}`;
    
    try {
        const { data } = await axios.get<TokenBalanceType>(configUrl, axoisConfig);

        return data;
    } catch (err) {
        console.error('getTokenBalanceFromApi failed:', err);
    }

    return undefined;
}

export async function getAccountNftsByCollection(
    address: string,
    collection: string,
): Promise<NftType[]> {
    try {
        const url = `${ELROND_API_URL}/accounts/${address}/nfts?collections=${collection}`;
        const { data } = await axios.get<NftType[]>(url, axoisConfig);

        return data;
    } catch (err) {
        console.error('getAccountNftsByCollection falied:', err);
    }

    return [];
}

export async function getElrondStatsFromApi(): Promise<ElrondStatsType | undefined> {
    const configUrl = `${ELROND_API_URL}/stats`;
    
    try {
        const { data } = await axios.get<ElrondStatsType>(configUrl, axoisConfig);
        
        if (data) {
            data.leftTime = convertSecondsToPrintDateTime((data.roundsPerEpoch - data.roundsPassed) * 6);
            data.passedTimePercentage = (data.roundsPassed / data.roundsPerEpoch) * 100;
        }
        
        return data;
    } catch (err) {
        console.error('getElrondStatsFromApi failed:', err);
    }

    return undefined;
}
