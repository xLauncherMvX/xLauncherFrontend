import { networkId } from "config/customConfig";
import { convertTokenIdentifierToTicker } from "./z/utils";

const ELROND_GATEWAY_URLS = {
    mainnet: "https://gateway.multiversx.com",
    devnet: "https://devnet-gateway.multiversx.com",
    testnet: "https://testnet-gateway.multiversx.com",
};
export const ELROND_GATEWAY_URL = ELROND_GATEWAY_URLS[networkId];
const ELROND_API_URLS = {
    mainnet: "https://api.multiversx.com",
    devnet: "https://devnet-api.multiversx.com",
    testnet: "https://testnet-api.multiversx.com",
};
export const ELROND_API_URL = ELROND_API_URLS[networkId];
const ELROND_EXPLORER_URLS = {
    mainnet: "https://explorer.multiversx.com",
    devnet: "https://devnet-explorer.multiversx.com",
    testnet: "https://testnet-explorer.multiversx.com",
};
export const ELROND_EXPLORER_URL = ELROND_EXPLORER_URLS[networkId];

export const ELROND_ACCESS_TIMEOUT = 10_000; // 10s

export const EGLD_WRAPPER_ADDRESS = [
    'erd1qqqqqqqqqqqqqpgqd77fnev2sthnczp2lnfx0y5jdycynjfhzzgq6p3rax', // shard 0
    'erd1qqqqqqqqqqqqqpgq7ykazrzd905zvnlr88dpfw06677lxe9w0n4suz00uh', // shard 1
    'erd1qqqqqqqqqqqqqpgqfj3z3k4vlq7dc2928rxez0uhhlq46s6p4mtqerlxhc', // shard 2
];

const IS_DEV = true;
export const COIL_SC_ADDRESS = IS_DEV ? 'erd1qqqqqqqqqqqqqpgqzv3qtnh5lt6unu2czkwf6sknf2w7yqm403ast5x9d6' : '';
export const PRESALE_SC_ADDRESS = IS_DEV ? 'erd1qqqqqqqqqqqqqpgqe7eutpggvtd6wgyfhwulxn9u2h255nj203asaqwm7v' : '';
export const VESTING_SC_ADDRESS = IS_DEV ? 'erd1qqqqqqqqqqqqqpgqc9x05kteftyw7vftcm34vaw6krgvq4ad03assjngt2' : '';

export const FEE_DENOMINATOR = 10000;

export const USDC_DECIMALS = 6;

export const PRESALE_BUY_GAS_LIMIT = 50_000_000;

//
const DECIMALS_MAP: Record<string, number> = {
    'EGLD': 18,
    'WEGLD': 18,
    'USDC': 6,
    'VEGLD': 18,
    'MEX': 18,
    'ASH': 18,
};
export function getTokenDecimals(tokenId: string): number {
    const ticker = convertTokenIdentifierToTicker(tokenId);
    return DECIMALS_MAP[ticker] ? DECIMALS_MAP[ticker] : 18;
}
