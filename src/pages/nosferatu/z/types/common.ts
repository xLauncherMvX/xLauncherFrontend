import BigNumber from 'bignumber.js';

export interface LiquidStakingSettingsType {
    vegld_identifier: string,
    treasury_wallet: string,
    fee: number,
    unbonding_period: number,
    admins: string[],
    user_action_allowed: boolean,
    admin_action_allowed: boolean,
    
    pool_vegld_amount: string,
    pool_egld_amount: string,
    prestaked_egld_amount: string,
    preunstaked_egld_amount: string,
    unstaking_egld_amount: string,
    unbonded_egld_amount: string,
    
    vegld_price: string,
}

export interface PrintDateTimeType {
    hours: string,
    minutes: string,
    seconds: string,
}

export interface ElrondStatsType {
    shards: number,
    blocks: number,
    accounts: number,
    transactions: number,
    refreshRate: number,
    epoch: number,
    roundsPassed: number,
    roundsPerEpoch: number,
    
    leftTime: PrintDateTimeType,
    passedTimePercentage: number,
}

export interface TokenBalanceType {
    identifier: string,
    ticker: string,
    decimals: number,
    balance: string,
}

export interface UndelegateStatsItem {
    amount: string,
    seconds: number,
}

export interface DelegationStatsItem {
    contract: string,
    userUnBondable: string,
    userActiveStake: string,
    claimableRewards: string,
    userUndelegatedList: UndelegateStatsItem[],
    undelegated: string,
}

export interface DelegationStats {
    numberOfAddresses: number,
    stakedAmount: BigNumber,
    rewardsAmount: BigNumber,
    unbondableAmount: BigNumber,
    undelegatedAmount: BigNumber,
}

export interface DelegateProviderIdentityType {
    key: string,
    name: string,
    avatar: string,
    description: string,
    location: string,
}

export interface DelegateProviderType {
    identity?: DelegateProviderIdentityType,
    contract: string,
    serviceFee: number,
    maxDelegationCap: string,
    withDelegationCap: boolean,
    aprValue: number,
    totalActiveStake: string,
    totalUnStaked: string,
    totalCumulatedRewards: string,
}

export interface UnstakingPackType {
    amount: string,
    timestamp: number,
    withdrawable: boolean,
    leftTimeString: string,
}

export enum FocusedInputTokenType {
    FirstToken,
    SecondToken,
}

export interface EsdtTokenPaymentType {
    token_identifier: string,
    token_nonce: number,
    amount: string,
}
