import {
    Address,
    AddressValue,
    ArgSerializer,
    BigUIntValue,
    ResultsParser,
    StringValue,
    TokenIdentifierValue,
    TokenTransfer,
    TypedValue,
} from "@multiversx/sdk-core/out";
import {
    elrondDappSendTransactions
} from "./common";
import {
    elrondProvider,
    vestaxBronzeMinterSmartContract,
} from "./provider";
import {
    NOSFERATU_SC_ADDRESS,
    PRESALE_BUY_GAS_LIMIT,
} from "../../config";

export async function vbmGetMintPrice(address: string): Promise<string> {
    try {
        const args: TypedValue[] = [
            new AddressValue(new Address(address)),
        ];
        const interaction = vestaxBronzeMinterSmartContract.methods.getMintPrice(args);
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
        return '0';
    }
}

export async function vbmGetSftReserve(): Promise<number> {
    try {
        const interaction = vestaxBronzeMinterSmartContract.methods.getSftReserve();
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

export async function vbmGetEliteAccountTier(address: string): Promise<number> {
    try {
        const args: TypedValue[] = [
            new AddressValue(new Address(address)),
        ];
        const interaction = vestaxBronzeMinterSmartContract.methods.getEliteAccountTier(args);
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

export async function vbmMint(
    payment: TokenTransfer,
) {
    const args: TypedValue[] = [
        new TokenIdentifierValue(payment.tokenIdentifier),
        new BigUIntValue(payment.amountAsBigInteger),
        new StringValue('mint'),
    ];
    
    const { argumentsString } = new ArgSerializer().valuesToString(args);
    const data = `ESDTTransfer@${argumentsString}`;
    
    const tx = {
        value: 0,
        data,
        receiver: NOSFERATU_SC_ADDRESS,
        gasLimit: PRESALE_BUY_GAS_LIMIT,
    };
    
    const txName = 'Mint';
    const { sessionId, error } = await elrondDappSendTransactions(tx, txName);
    
    return { sessionId, error };
}
