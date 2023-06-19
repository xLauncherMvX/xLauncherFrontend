import { EsdtTokenPaymentType } from './common';

export * from './common';
export * from './elrond';

export interface PresaleBaseContext {
    snake_coil_address: string,
    snake_vesting_address: string,
    treasury_address: string,

    ouro_token: string,
    start_timestamp: number,
    round_lengths: number[],
    round_prices: string[],
    round_sale_percents: number[],

    quote_tokens: string[],
    pair_addresses: string[],
}

export interface PresaleStatsContext {
    total_sale_amount: string,
    sold_amounts: string[],
    earned_amounts: EsdtTokenPaymentType[][],

    current_round_id: number,
    sale_amount_for_current_round: string,
}

export interface PresaleUserContext {
    can_join_current_round: boolean,
    nft_holdings: number[],
}

export interface CoilBaseContext {
    tokens: string[],
    token_supplies: string[],
}

export interface VestingBaseContext {
    tokens: string[],
    token_supplies: string[],
}

export interface UnlockMilestoneType {
    unlock_epoch: number,
    unlock_percent: number,
}
