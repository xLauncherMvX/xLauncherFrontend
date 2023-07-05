import {
    AbiRegistry,
    Address,
    SmartContract,
} from "@multiversx/sdk-core/out";
import { ProxyNetworkProvider } from "@multiversx/sdk-network-providers/out";
import abiNosferatu from './abi/nosferatu-nft-minter.abi.json';
import abiSnake from './abi/launchpad.abi.json';
import {
    ELROND_ACCESS_TIMEOUT,
    ELROND_API_URL,
    NOSFERATU_SC_ADDRESS,
    SNAKE_SC_ADDRESS,
} from '../../config';

// export const elrondProvider = new ProxyNetworkProvider(ELROND_GATEWAY_URL, { timeout: ELROND_ACCESS_TIMEOUT });
export const elrondProvider = new ProxyNetworkProvider(ELROND_API_URL, { timeout: ELROND_ACCESS_TIMEOUT });

function createSmartContract(abiJson: any, scAddress: string): SmartContract {
    const abiRegistry = AbiRegistry.create(abiJson);
    // const abi = new SmartContractAbi(abiRegistry, [scName]);
    return new SmartContract({
        address: new Address(scAddress),
        abi: abiRegistry,
    });
}

export const nosferatuSmartContract = createSmartContract(abiNosferatu, NOSFERATU_SC_ADDRESS);
export const snakeSmartContract = createSmartContract(abiSnake, SNAKE_SC_ADDRESS);
