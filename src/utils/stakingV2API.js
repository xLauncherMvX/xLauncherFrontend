import {
    AbiRegistry,
    Address, BigUIntValue,
    SmartContract,
    TokenTransfer,
    U64Value
} from "@multiversx/sdk-core/out";
import {refreshAccount} from "@multiversx/sdk-dapp/__commonjs/utils";
import {sendTransactions} from "@multiversx/sdk-dapp/services";
import {BigNumber} from "bignumber.js";
import {multiplier} from "utils/utilities";
import {BytesValue} from "@multiversx/sdk-core/out/smartcontracts/typesystem/bytes";

export const stake = async (abiFile, scAddress, scName, chainID, token, amount, pool) => {
    try {
        let abiRegistry = AbiRegistry.create(abiFile);
        let contract = new SmartContract({
            address: new Address(scAddress),
            abi: abiRegistry
        });

        const transaction = contract.methodsExplicit
            .stakeXlh([new U64Value(pool)])
            .withChainID(chainID)
            .withSingleESDTTransfer(
                TokenTransfer.fungibleFromAmount(token, amount, 18)
            )
            .buildTransaction();
        const stakeTransaction = {
            value: 0,
            data: Buffer.from(transaction.getData().valueOf()),
            receiver: scAddress,
            gasLimit: '15000000'
        };
        await refreshAccount();

        const { sessionId } = await sendTransactions({
            transactions: stakeTransaction,
            transactionsDisplayInfo: {
                processingMessage: 'Processing Stake transaction',
                errorMessage: 'An error has occurred during Stake transaction',
                successMessage: 'Stake transaction successful'
            },
            redirectAfterSign: false
        });

    } catch (error) {
        console.error(error);
    }
};

export const unstake = async (abiFile, scAddress, scName, chainID, token, amount, pool) => {
    try {
        let abiRegistry = AbiRegistry.create(abiFile);
        let contract = new SmartContract({
            address: new Address(scAddress),
            abi: abiRegistry
        });

        const transaction = contract.methodsExplicit
            .unstakeXlh([new U64Value(pool), new BigUIntValue(new BigNumber(amount * multiplier))])
            .withChainID(chainID)
            .buildTransaction();
        const stakeTransaction = {
            value: 0,
            data: Buffer.from(transaction.getData().valueOf()),
            receiver: scAddress,
            gasLimit: '15000000'
        };
        await refreshAccount();

        const { sessionId } = await sendTransactions({
            transactions: stakeTransaction,
            transactionsDisplayInfo: {
                processingMessage: 'Processing Unstake transaction',
                errorMessage: 'An error has occurred during Unstake transaction',
                successMessage: 'Unstake transaction successful'
            },
            redirectAfterSign: false
        });

    } catch (error) {
        console.error(error);
    }
};


export const claim = async (abiFile, scAddress, scName, chainID, pool) => {
    try {
        let abiRegistry = AbiRegistry.create(abiFile);
        let contract = new SmartContract({
            address: new Address(scAddress),
            abi: abiRegistry
        });

        const transaction = contract.methodsExplicit
            .claimRewards([new U64Value(pool)])
            .withChainID(chainID)
            .buildTransaction();
        const stakeTransaction = {
            value: 0,
            data: Buffer.from(transaction.getData().valueOf()),
            receiver: scAddress,
            gasLimit: '15000000'
        };
        await refreshAccount();

        const { sessionId } = await sendTransactions({
            transactions: stakeTransaction,
            transactionsDisplayInfo: {
                processingMessage: 'Processing Claim transaction',
                errorMessage: 'An error has occurred during claim transaction',
                successMessage: 'Claim transaction successful'
            },
            redirectAfterSign: false
        });

    } catch (error) {
        console.error(error);
    }
};

export const stakeSFT = async (abiFile, scAddress, scName, chainID, token, address, amount) => {
    try {
        let abiRegistry = AbiRegistry.create(abiFile);
        let contract = new SmartContract({
            address: new Address(scAddress),
            abi: abiRegistry
        });

        const transaction = contract.methodsExplicit
            .stakeSft()
            .withChainID(chainID)
            .withSingleESDTNFTTransfer(
                TokenTransfer.semiFungible(token, 1, amount)
            )
            .withSender(new Address(address))

            .buildTransaction();
        const stakeSFTTransaction = {
            value: 0,
            data: Buffer.from(transaction.getData().valueOf()),
            receiver: address,
            gasLimit: '15000000'
        };
        await refreshAccount();

        const { sessionId } = await sendTransactions({
            transactions: stakeSFTTransaction,
            transactionsDisplayInfo: {
                processingMessage: 'Processing SFT Stake transaction',
                errorMessage: 'An error has occurred during SFT Stake transaction',
                successMessage: 'SFT Stake transaction successful'
            },
            redirectAfterSign: false
        });

    } catch (error) {
        console.error(error);
    }
};


export const unstakeSFT = async (abiFile, scAddress, scName, chainID, amount) => {
    try {
        let abiRegistry = AbiRegistry.create(abiFile);
        let contract = new SmartContract({
            address: new Address(scAddress),
            abi: abiRegistry
        });

        const transaction = contract.methodsExplicit
            .unstakeSft([new U64Value(amount)])
            .withChainID(chainID)
            .buildTransaction();
        const stakeTransaction = {
            value: 0,
            data: Buffer.from(transaction.getData().valueOf()),
            receiver: scAddress,
            gasLimit: '15000000'
        };
        await refreshAccount();

        const { sessionId } = await sendTransactions({
            transactions: stakeTransaction,
            transactionsDisplayInfo: {
                processingMessage: 'Processing Unstake transaction',
                errorMessage: 'An error has occurred during Unstake transaction',
                successMessage: 'Unstake transaction successful'
            },
            redirectAfterSign: false
        });

    } catch (error) {
        console.error(error);
    }
};

export const claimUnstakeXLH = async (abiFile, scAddress, scName, chainID) => {
    try {
        let abiRegistry = AbiRegistry.create(abiFile);
        let contract = new SmartContract({
            address: new Address(scAddress),
            abi: abiRegistry
        });

        const transaction = contract.methodsExplicit
            .claimUnstakedXlhValue()
            .withChainID(chainID)
            .buildTransaction();

        const claimUnstakeTransaction = {
            value: 0,
            data: Buffer.from(transaction.getData().valueOf()),
            receiver: scAddress,
            gasLimit: '15000000'
        };
        await refreshAccount();

        const { sessionId } = await sendTransactions({
            transactions: claimUnstakeTransaction,
            transactionsDisplayInfo: {
                processingMessage: 'Processing claim unstake transaction',
                errorMessage: 'An error has occurred during claim unstake transaction',
                successMessage: 'Claim Unstake transaction successful'
            },
            redirectAfterSign: false
        });

    } catch (error) {
        console.error(error);
    }
};

export const claimUnstakeSFT = async (abiFile, scAddress, scName, chainID) => {
    try {
        let abiRegistry = AbiRegistry.create(abiFile);
        let contract = new SmartContract({
            address: new Address(scAddress),
            abi: abiRegistry
        });

        const transaction = contract.methodsExplicit
            .claimUnstakedSftValue()
            .withChainID(chainID)
            .buildTransaction();

        const claimUnstakeTransaction = {
            value: 0,
            data: Buffer.from(transaction.getData().valueOf()),
            receiver: scAddress,
            gasLimit: '15000000'
        };
        await refreshAccount();

        const { sessionId } = await sendTransactions({
            transactions: claimUnstakeTransaction,
            transactionsDisplayInfo: {
                processingMessage: 'Processing claim unstake transaction',
                errorMessage: 'An error has occurred during claim unstake transaction',
                successMessage: 'Claim Unstake transaction successful'
            },
            redirectAfterSign: false
        });

    } catch (error) {
        console.error(error);
    }
};

export const createFarm = async (abiFile, scAddress, scName, chainID, tier, title, token, amount) => {
    try {
        let abiRegistry = AbiRegistry.create(abiFile);
        let contract = new SmartContract({
            address: new Address(scAddress),
            abi: abiRegistry
        });

        const transaction = contract.methodsExplicit
            .createNewPool([new U64Value(tier),  BytesValue.fromUTF8(title)])
            .withChainID(chainID)
            .withSingleESDTTransfer(
                TokenTransfer.fungibleFromAmount(token, amount, 18)
            )
            .buildTransaction();
        const stakeTransaction = {
            value: 0,
            data: Buffer.from(transaction.getData().valueOf()),
            receiver: scAddress,
            gasLimit: '15000000'
        };
        await refreshAccount();

        const { sessionId } = await sendTransactions({
            transactions: stakeTransaction,
            transactionsDisplayInfo: {
                processingMessage: 'Processing create farm transaction',
                errorMessage: 'An error has occurred during create farm transaction',
                successMessage: 'Create farm transaction successful'
            },
            redirectAfterSign: false
        });

    } catch (error) {
        console.error(error);
    }
};