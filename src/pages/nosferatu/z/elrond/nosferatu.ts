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
    TokenTransfer,
    TypedValue,
} from "@multiversx/sdk-core/out";
import { refreshAccount } from "@multiversx/sdk-dapp/utils";
import abiNosferatu from './abi/nosferatu-nft-minter.abi.json';
import {
    EGLD_WRAPPER_ADDRESS,
    NOSFERATU_SC_ADDRESS,
    PRESALE_BUY_GAS_LIMIT,
} from "../../config";
import {
    CoilBaseContext,
    PresaleStatsContext,
    PresaleUserContext,
    PriceType,
    UnlockMilestoneType,
    VestingBaseContext,
} from "../types";
import { convertTokenIdentifierToTicker, ZERO_STRING } from "../utils";
import { elrondDappSendTransactions, parseEsdtTokenPayment } from "./common";
import {
    elrondProvider,
    nosferatuSmartContract,
} from "./provider";

export async function getCollection(): Promise<string> {
    try {
        const interaction = nosferatuSmartContract.methods.getCollection();
        const query = interaction.check().buildQuery();
        const queryResponse = await elrondProvider.queryContract(query);
        const endpointDefinition = interaction.getEndpoint();
        const { firstValue, returnCode, returnMessage } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
        
        if (!firstValue || !returnCode.isSuccess()) {
            throw Error(returnMessage);
        }
        
        const value = firstValue.valueOf();
        const decoded = value.toString();
        
        return decoded;
    } catch (err) {
        return '';
    }
}

export async function getLeftCount(): Promise<number> {
    try {
        const interaction = nosferatuSmartContract.methods.getLeftCount();
        const query = interaction.check().buildQuery();
        const queryResponse = await elrondProvider.queryContract(query);
        const endpointDefinition = interaction.getEndpoint();
        const { firstValue, returnCode, returnMessage } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
        
        if (!firstValue || !returnCode.isSuccess()) {
            throw Error(returnMessage);
        }
        
        const value = firstValue.valueOf();
        const decoded = value.toNumber();
        
        return decoded;
    } catch (err) {
        return 0;
    }
}

export async function getPriceMap(): Promise<PriceType[]> {
    try {
        const interaction = nosferatuSmartContract.methodsExplicit.getPriceMap();
        const query = interaction.check().buildQuery();
        const queryResponse = await elrondProvider.queryContract(query);
        const endpointDefinition = interaction.getEndpoint();
        const { firstValue, returnCode, returnMessage } = new ResultsParser().parseQueryResponse(queryResponse, endpointDefinition);
        
        if (!firstValue || !returnCode.isSuccess()) {
            throw Error(returnMessage);
        }
        
        const values = firstValue.valueOf();
        const decoded = values.map((value: any) => ({
            identifier: value[0].toString(),
            ticker: convertTokenIdentifierToTicker(value[0].toString()),
            price: value[1].toFixed(0),
        }));
        
        return decoded;
    } catch (err) {
        return [];
    }
}

export async function nosferatuBuy(
    payment: TokenTransfer,
) {
    const args: TypedValue[] = [
        new TokenIdentifierValue(payment.tokenIdentifier),
        new BigUIntValue(payment.amountAsBigInteger),
        new StringValue('buy'),
    ];
    
    const { argumentsString } = new ArgSerializer().valuesToString(args);
    const data = `ESDTTransfer@${argumentsString}`;
    
    const tx = {
        value: 0,
        data,
        receiver: NOSFERATU_SC_ADDRESS,
        gasLimit: PRESALE_BUY_GAS_LIMIT,
    };
    
    const txName = 'Buy';
    const { sessionId, error } = await elrondDappSendTransactions(tx, txName);
    
    return { sessionId, error };
}
