import { multiplier } from "utils/utilities";
import {
    BigUIntValue,
    ContractFunction,
} from "@multiversx/sdk-core/out";
import {BytesValue} from "@multiversx/sdk-core/out/smartcontracts/typesystem/bytes";
import {BigNumber} from "bignumber.js";
import { refreshAccount } from "@multiversx/sdk-dapp/utils/account";
import { sendTransactions} from "@multiversx/sdk-dapp/services";
import {ArgSerializer} from "@multiversx/sdk-core/out/smartcontracts/argSerializer";

//Stake function
export const stakeXLH = async (farmId, xlhAmount, token, scAddress, setOpen1, setOpen2, setOpen3, setTransactionSessionId) => {
    console.log("Formatting stake transaction");
    setOpen1(false);
    setOpen2(false);
    setOpen3(false);

    let finalXLHAmount = xlhAmount * multiplier;
    const args = [
        BytesValue.fromUTF8(token),
        new BigUIntValue(new BigNumber(finalXLHAmount)),
        BytesValue.fromUTF8("stake"),
        new BigUIntValue(new BigNumber(farmId)),
    ];
    
    const { argumentsString } = new ArgSerializer().valuesToString(args);
    const data = `ESDTTransfer@${argumentsString}`;

    const createStakeTransaction = {
        value: "0",
        data: data,
        receiver: scAddress,
        gasLimit: 30000000,
    };

    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
        transactions: [createStakeTransaction],
        transactionsDisplayInfo: {
            processingMessage: "Stake Transaction",
            errorMessage: "An error has occured during Stake Transaction",
            successMessage: "Stake Transaction successful",
        },
        redirectAfterSign: false,
    });
    if (sessionId != null) {
        console.log("sessionId", sessionId);
        setTransactionSessionId(sessionId);
    }
};

//Unstake function
export const unstakeXLH = async (farmId, xlhAmount, gasLimit, scAddress, setOpen1, setOpen2, setOpen3, setTransactionSessionId) => {
    console.log("Formatting unstake transaction");
    setOpen1(false);
    setOpen2(false);
    setOpen3(false);

    let finalXLHAmount = xlhAmount * multiplier;
    const args = [
        new BigUIntValue(new BigNumber(farmId)),
        new BigUIntValue(new BigNumber(finalXLHAmount)),
    ];
    
    const { argumentsString } = new ArgSerializer().valuesToString(args);
    const data = `unstake@${argumentsString}`;

    const createUnstakeTransaction = {
        value: "0",
        data: data,
        receiver: scAddress,
        gasLimit: gasLimit,
    };

    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
        transactions: [createUnstakeTransaction],
        transactionsDisplayInfo: {
            processingMessage: "Unstake Transaction",
            errorMessage: "An error has occured during Unstake Transaction",
            successMessage: "Unstake Transaction successful",
        },
        redirectAfterSign: false,
    });
    if (sessionId != null) {
        console.log("sessionIdU ", sessionId);
        setTransactionSessionId(sessionId);
    }
};

//Claim Function
export const claimXLH = async (farmId, gasLimit, scAddress, setTransactionSessionId) => {
    console.log("Formatting claim transaction");

    const args = [
        new BigUIntValue(new BigNumber(farmId))
    ];
    
    const { argumentsString } = new ArgSerializer().valuesToString(args);
    const data = `claim@${argumentsString}`;

    const createClaimTransaction = {
        value: "0",
        data: data,
        receiver: scAddress,
        gasLimit: gasLimit,
    };

    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
        transactions: [createClaimTransaction],
        transactionsDisplayInfo: {
            processingMessage: "Claim Transaction",
            errorMessage: "An error has occured during Claim Transaction",
            successMessage: "Claim Transaction successful",
        },
        redirectAfterSign: false,
    });
    if (sessionId != null) {
        console.log("sessionIdC ", sessionId);
        setTransactionSessionId(sessionId);
    }
};

//Reinvest Function
export const reinvestXLH = async (farmId, gasLimit, scAddress, setTransactionSessionId) => {
    console.log("Formatting reinvest transaction");

    const args = [
        new BigUIntValue(new BigNumber(farmId))
    ];
    
    const { argumentsString } = new ArgSerializer().valuesToString(args);
    const data = `reinvest@${argumentsString}`;

    const createReinvestTransaction = {
        value: "0",
        data: data,
        receiver: scAddress,
        gasLimit: gasLimit,
    };

    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
        transactions: [createReinvestTransaction],
        transactionsDisplayInfo: {
            processingMessage: "Reinvest Transaction",
            errorMessage: "An error has occured during Reinvest Transaction",
            successMessage: "Reinvest Transaction successful",
        },
        redirectAfterSign: false,
    });
    if (sessionId != null) {
        console.log("sessionId ", sessionId);
        setTransactionSessionId(sessionId);
    }
};

//Claim Unstake Function
export const claimUXLH = async (scAddress, setTransactionSessionId) => {
    console.log("Formatting claim unstake transaction");

    const data = `claimUnstakedValue`;

    const createClaimUTransaction = {
        value: "0",
        data: data,
        receiver: scAddress,
        gasLimit: 30000000,
    };

    await refreshAccount();

    const { sessionId /*, error*/ } = await sendTransactions({
        transactions: [createClaimUTransaction],
        transactionsDisplayInfo: {
            processingMessage: "Claim Unstake Transaction",
            errorMessage: "An error has occured during Claim Unstake Transaction",
            successMessage: "Claim Unstake Transaction successful",
        },
        redirectAfterSign: false,
    });
    if (sessionId != null) {
        console.log("sessionId ", sessionId);
        setTransactionSessionId(sessionId);
    }
};