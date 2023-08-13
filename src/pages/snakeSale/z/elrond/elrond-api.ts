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

export async function getTokenBalanceFromApi(
    address: string,
    tokenId: string,
): Promise<TokenBalanceType | undefined> {
    const configUrl = `${ELROND_API_URL}/accounts/${address}/tokens/${tokenId}`;
    
    try {
        const { data } = await axios.get<TokenBalanceType>(configUrl);

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
        const { data } = await axios.get<NftType[]>(url);

        return data;
    } catch (err) {
        console.error('getAccountNftsByCollection falied:', err);
    }

    return [];
}

export async function getAccountNftCountByCollection(
    address: string,
    collection: string,
): Promise<number> {
    try {
        const url = `${ELROND_API_URL}/accounts/${address}/nfts/count?collections=${collection}`;
        const { data } = await axios.get<number>(url);

        return data;
    } catch (err) {
        console.error('getAccountNftCountByCollection falied:', err);
    }

    return 0;
}

export async function getElrondStatsFromApi(): Promise<ElrondStatsType | undefined> {
    const configUrl = `${ELROND_API_URL}/stats`;
    
    try {
        const { data } = await axios.get<ElrondStatsType>(configUrl);
        
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

export async function getAccountNftBalanceFromApi(
    address: string,
    nftId: string,
): Promise<number> {
    const configUrl = `${ELROND_API_URL}/accounts/${address}/nfts/${nftId}`;
    
    try {
        const { data } = await axios.get<NftType>(configUrl);
        const _balance = data.balance ? Number(data.balance) : 0;
        
        return _balance;
    } catch (err) {
        console.error('getAccountNftBalanceFromApi:', err);
    }

    return 0;
}