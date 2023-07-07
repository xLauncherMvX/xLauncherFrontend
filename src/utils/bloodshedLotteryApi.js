import {
    AbiRegistry,
    Address,
    SmartContract,
    TokenTransfer,
    U8Value
} from "@multiversx/sdk-core/out";
import {refreshAccount} from "@multiversx/sdk-dapp/__commonjs/utils";
import {sendTransactions} from "@multiversx/sdk-dapp/services";

export const buyTickets = async (networkProvider, abiFile, scAddress, scName, chainID, token, amount, tokenMultiplier) => {
    if(!tokenMultiplier) tokenMultiplier = 1;
    try {
        let abiRegistry = AbiRegistry.create(abiFile);
        let contract = new SmartContract({
            address: new Address(scAddress),
            abi: abiRegistry
        });

        const transaction = contract.methodsExplicit
            .confirmTickets([new U8Value(amount)])
            .withChainID(chainID)
            .withSingleESDTTransfer(
                TokenTransfer.fungibleFromAmount(token, amount * tokenMultiplier, 18)
            )
            .buildTransaction();
        const buyTicketsTransaction = {
            value: 0,
            data: Buffer.from(transaction.getData().valueOf()),
            receiver: scAddress,
            gasLimit: '15000000'
        };
        await refreshAccount();

        const { sessionId } = await sendTransactions({
            transactions: buyTicketsTransaction,
            transactionsDisplayInfo: {
                processingMessage: 'Processing Buy Tickets transaction',
                errorMessage: 'An error has occurred during Buy Tickets transaction',
                successMessage: 'Buy Tickets transaction successful'
            },
            redirectAfterSign: false
        });

    } catch (error) {
        console.error(error);
    }
};


export const claimResults = async (networkProvider, abiFile, scAddress, scName, chainID) => {
    try {
        let abiRegistry = AbiRegistry.create(abiFile);
        let contract = new SmartContract({
            address: new Address(scAddress),
            abi: abiRegistry
        });

        const transaction = contract.methodsExplicit
            .claimLotteryResults()
            .withChainID(chainID)
            .buildTransaction();
        const claimResultsTransaction = {
            value: 0,
            data: Buffer.from(transaction.getData().valueOf()),
            receiver: scAddress,
            gasLimit: '85000000'
        };
        await refreshAccount();

        const { sessionId } = await sendTransactions({
            transactions: claimResultsTransaction,
            transactionsDisplayInfo: {
                processingMessage: 'Processing Claim Lottery Results transaction',
                errorMessage: 'An error has occurred during Claim Lottery Results transaction',
                successMessage: 'Claim Lottery Results transaction successful'
            },
            redirectAfterSign: false
        });

    } catch (error) {
        console.error(error);
    }
};

export const claimLegendaryNft = async (networkProvider, abiFile, scAddress, scName, chainID, amount, address) => {
    try {
        let abiRegistry = AbiRegistry.create(abiFile);
        let contract = new SmartContract({
            address: new Address(scAddress),
            abi: abiRegistry
        });

        const transaction = contract.methodsExplicit
            .buy()
            .withMultiESDTNFTTransfer([TokenTransfer.semiFungible("DEMIOULTR-15a313", 1, amount)])
            .withChainID(chainID)
            .withSender(new Address(address))
            .buildTransaction();
        const claimResultsTransaction = {
            value: 0,
            data: Buffer.from(transaction.getData().valueOf()),
            receiver: address,
            gasLimit: 15_000_000 + (2_000_000 * amount)
        };
        await refreshAccount();

        const { sessionId } = await sendTransactions({
            transactions: claimResultsTransaction,
            transactionsDisplayInfo: {
                processingMessage: 'Processing Claim Lottery Results transaction',
                errorMessage: 'An error has occurred during Claim Lottery Results transaction',
                successMessage: 'Claim Lottery Results transaction successful'
            },
            redirectAfterSign: false
        });

    } catch (error) {
        console.error(error);
    }
};