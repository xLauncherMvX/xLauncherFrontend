import {
    AbiRegistry,
    Address,
    AddressValue,
    ArgSerializer,
    BigUIntValue,
    BinaryCodec,
    ResultsParser,
    StringValue,
    TokenIdentifierValue,
    TypedValue,
} from "@multiversx/sdk-core/out";
import { refreshAccount } from "@multiversx/sdk-dapp/utils";
import abiVesting from '../../assets/abi/snake-vesting.abi.json';
import {
    EGLD_WRAPPER_ADDRESS,
    PRESALE_BUY_GAS_LIMIT,
    PRESALE_SC_ADDRESS,
} from "../../config";
import {
    CoilBaseContext,
    PresaleBaseContext,
    PresaleStatsContext,
    PresaleUserContext,
    UnlockMilestoneType,
    VestingBaseContext,
} from "../types";
import { ZERO_STRING } from "../utils";
import { elrondDappSendTransactions, parseEsdtTokenPayment } from "./common";
import {
    coilSmartContract,
    elrondProvider,
    presaleSmartContract,
    vestingSmartContract,
} from "./provider";
import { TokenTransfer } from "./token-transfer";

export async function viewPresaleBaseContext(): Promise<PresaleBaseContext | undefined> {
    try {
        const interaction = presaleSmartContract.methods.viewBaseContext();
        const query = interaction.check().buildQuery();
        const queryResponse = await elrondProvider.queryContract(query);
        const endpointDefinition = interaction.getEndpoint();
        const { firstValue, returnCode, returnMessage } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
        
        if (!firstValue || !returnCode.isSuccess()) {
            throw Error(returnMessage);
        }
        
        const value = firstValue.valueOf();
        const decoded = {
            snake_coil_address: value.snake_coil_address.toString(),
            snake_vesting_address: value.snake_vesting_address.toString(),
            treasury_address: value.treasury_address.toString(),

            ouro_token: value.ouro_token.toString(),
            start_timestamp: value.start_timestamp.toNumber(),
            round_lengths: value.round_lengths.map((v: any) => v.toNumber()),
            round_prices: value.round_prices.map((v: any) => v.toFixed(0)),
            round_sale_percents: value.round_sale_percents.map((v: any) => v.toNumber()),

            quote_tokens: value.quote_tokens.map((v: any) => v.toString()),
            pair_addresses: value.pair_addresses.map((v: any) => v.toString()),
        };
        
        return decoded;
    } catch (err) {
        console.error('viewPresaleBaseContext: failed', err);
        return undefined;
    }
}

export async function viewPresaleStatsContext(): Promise<PresaleStatsContext | undefined> {
    try {
        const interaction = presaleSmartContract.methods.viewStatsContext();
        const query = interaction.check().buildQuery();
        const queryResponse = await elrondProvider.queryContract(query);
        const endpointDefinition = interaction.getEndpoint();
        const { firstValue, returnCode, returnMessage } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
        
        if (!firstValue || !returnCode.isSuccess()) {
            throw Error(returnMessage);
        }
        
        const value = firstValue.valueOf();
        const decoded = {
            total_sale_amount: value.total_sale_amount.toFixed(0),
            sold_amounts: value.sold_amounts.map((v: any) => v.toFixed(0)),
            earned_amounts: value.earned_amounts.map((v1: any) => v1.map((v2: any) => parseEsdtTokenPayment(v2))),

            current_round_id: value.current_round_id.toNumber(),
            sale_amount_for_current_round: value.sale_amount_for_current_round.toFixed(0),
        };
        
        return decoded;
    } catch (err) {
        console.error('viewPresaleStatsContext: failed', err);
        return undefined;
    }
}

export async function viewPresaleUserContext(userAddress: string): Promise<PresaleUserContext | undefined> {
    try {
        const args: TypedValue[] = [
            new AddressValue(new Address(userAddress)),
        ];
        const interaction = presaleSmartContract.methodsExplicit.viewUserContext(args);
        const query = interaction.check().buildQuery();
        const queryResponse = await elrondProvider.queryContract(query);
        const endpointDefinition = interaction.getEndpoint();
        const { firstValue, returnCode, returnMessage } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
        
        if (!firstValue || !returnCode.isSuccess()) {
            throw Error(returnMessage);
        }
        
        const value = firstValue.valueOf();
        const decoded = {
            can_join_current_round: value.can_join_current_round,
            nft_holdings: value.nft_holdings.map((v: any) => v.toNumber()),
        };
        
        return decoded;
    } catch (err) {
        console.error('viewPresaleUserContext: failed', err);
        return undefined;
    }
}

export async function presaleBuy(
    payment: TokenTransfer,
) {
    const account = await refreshAccount();
    if (!account) return;
    let currentNonce = account.nonce;
    const txs = [];

    if (payment.tokenIdentifier.startsWith('WEGLD')) {
        const tx1 = {
            value: payment.amountAsBigInteger,
            data: 'wrapEgld',
            receiver: EGLD_WRAPPER_ADDRESS[account.shard ?? 1],
            gasLimit: PRESALE_BUY_GAS_LIMIT,
            nonce: currentNonce++,
        };
        txs.push(tx1);
    }

    const args: TypedValue[] = [
        new TokenIdentifierValue(payment.tokenIdentifier),
        new BigUIntValue(payment.amountAsBigInteger),
        new StringValue('buy'),
    ];
    
    const { argumentsString } = new ArgSerializer().valuesToString(args);
    const data = `ESDTTransfer@${argumentsString}`;
    
    const tx2 = {
        value: 0,
        data,
        receiver: PRESALE_SC_ADDRESS,
        gasLimit: PRESALE_BUY_GAS_LIMIT,
        nonce: currentNonce++,
    };
    txs.push(tx2);
    
    const txName = 'Buy';
    const { sessionId, error } = await elrondDappSendTransactions(txs, txName);
    
    return { sessionId, error };
}

export async function viewCoilBaseContext(): Promise<CoilBaseContext | undefined> {
    try {
        const interaction = coilSmartContract.methods.viewBaseContext();
        const query = interaction.check().buildQuery();
        const queryResponse = await elrondProvider.queryContract(query);
        const endpointDefinition = interaction.getEndpoint();
        const { firstValue, returnCode, returnMessage } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
        
        if (!firstValue || !returnCode.isSuccess()) {
            throw Error(returnMessage);
        }
        
        const value = firstValue.valueOf();
        const decoded = {
            tokens: value.tokens.map((v: any) => v.toString()),
            token_supplies: value.token_supplies.map((v: any) => v.toFixed(0)),
        };
        
        return decoded;
    } catch (err) {
        console.error('viewCoilBaseContext: failed', err);
        return undefined;
    }
}

export async function viewVestingBaseContext(): Promise<VestingBaseContext | undefined> {
    try {
        const interaction = vestingSmartContract.methods.viewBaseContext();
        const query = interaction.check().buildQuery();
        const queryResponse = await elrondProvider.queryContract(query);
        const endpointDefinition = interaction.getEndpoint();
        const { firstValue, returnCode, returnMessage } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
        
        if (!firstValue || !returnCode.isSuccess()) {
            throw Error(returnMessage);
        }
        
        const value = firstValue.valueOf();
        const decoded = {
            tokens: value.tokens.map((v: any) => v.toString()),
            token_supplies: value.token_supplies.map((v: any) => v.toFixed(0)),
        };
        
        return decoded;
    } catch (err) {
        console.error('viewVestingBaseContext: failed', err);
        return undefined;
    }
}

export function decodeVestedAttributes(encoded: string): UnlockMilestoneType[] {
    const abiRegistry = AbiRegistry.create(abiVesting);
    const structType = abiRegistry.getStruct("UnlockSchedule");
    const decoded = new BinaryCodec().decodeTopLevel(Buffer.from(encoded, "base64"), structType).valueOf();
    const ums = decoded.unlock_milestones.map((um: any) => ({
        unlock_epoch: um.unlock_epoch.toNumber(),
        unlock_percent: um.unlock_percent.toNumber(),
    }));

    return ums;
}

export async function getCurrentQuotePrice(tokenId: string): Promise<string> {
    try {
        const args: TypedValue[] = [
            new TokenIdentifierValue(tokenId),
        ];
        const interaction = presaleSmartContract.methodsExplicit.getCurrentQuotePrice(args);
        const query = interaction.check().buildQuery();
        const queryResponse = await elrondProvider.queryContract(query);
        const endpointDefinition = interaction.getEndpoint();
        const { firstValue, returnCode, returnMessage } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
        
        if (!firstValue || !returnCode.isSuccess()) {
            throw Error(returnMessage);
        }
        
        const value = firstValue.valueOf();
        const decoded = value.toFixed(0);
        
        return decoded;
    } catch (err) {
        console.error('getCurrentQuotePrice: failed', err);
        return ZERO_STRING;
    }
}
