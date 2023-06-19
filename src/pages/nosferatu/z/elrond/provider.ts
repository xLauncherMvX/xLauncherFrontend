import {
    AbiRegistry,
    Address,
    SmartContract,
    // SmartContractAbi,
} from "@multiversx/sdk-core/out";
import { ProxyNetworkProvider } from "@multiversx/sdk-network-providers/out";
import abiCoil from './abi/snake-coil.abi.json';
import abiPresale from './abi/snake-presale.abi.json';
import abiVesting from './abi/snake-vesting.abi.json';
import {
    COIL_SC_ADDRESS,
    ELROND_ACCESS_TIMEOUT,
    // ELROND_GATEWAY_URL,
    ELROND_API_URL,
    PRESALE_SC_ADDRESS,
    VESTING_SC_ADDRESS,
} from '../../config';

// export const elrondProvider = new ProxyNetworkProvider(ELROND_GATEWAY_URL, { timeout: ELROND_ACCESS_TIMEOUT });
export const elrondProvider = new ProxyNetworkProvider(ELROND_API_URL, { timeout: ELROND_ACCESS_TIMEOUT });

function createSmartContract(abiJson: any, scAddress: string, scName: string): SmartContract {
    const abiRegistry = AbiRegistry.create(abiJson);
    // const abi = new SmartContractAbi(abiRegistry, [scName]);
    return new SmartContract({
        address: new Address(scAddress),
        abi: abiRegistry,
    });
}

export const presaleSmartContract = createSmartContract(abiPresale, PRESALE_SC_ADDRESS, 'SnakeCoil');
export const coilSmartContract = createSmartContract(abiCoil, COIL_SC_ADDRESS, 'SnakePresale');
export const vestingSmartContract = createSmartContract(abiVesting, VESTING_SC_ADDRESS, 'SnakeVesting');
