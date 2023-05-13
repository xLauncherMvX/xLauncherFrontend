export const networkId = "devnet";

export const customConfig = {
    mainnet: {
        apiAddress: 'https://api.multiversx.com',
        provider: 'https://gateway.multiversx.com',
        apiLink: 'https://api.multiversx.com/accounts/',
        token: 'XLH-8daa50',
        stakeAddress: "erd1qqqqqqqqqqqqqpgql0yx4uetca8g4wmr96d9z7094vj3uhpt4d6qm5srfk",
        bloodshedAddress: "erd1qqqqqqqqqqqqqpgq47jpmgd7z3v036fqyzt5nhajzau8ygxryl5stecvv3",
        bloodshedXLHAddress: "erd1qqqqqqqqqqqqqpgq7u7e4lggx0vp09wyklu4cjh233nfchtayl5sq0xp43",
        bloodshedToken: "VEGLD-2b9319",
        stakeV2Address: "",
        stakeV2SFT: ""
    },

    devnet: {
        apiAddress: 'https://devnet-api.multiversx.com',
        provider: 'https://devnet-gateway.multiversx.com',
        apiLink: 'https://devnet-api.multiversx.com/accounts/',
        token: 'XLH-4a7cc0',
        stakeAddress: "erd1qqqqqqqqqqqqqpgqxmeg3k0ty84hm3f8n9wdfpukspc0asj3pa7qtt6j0t",
        bloodshedAddress: "erd1qqqqqqqqqqqqqpgq4m4udte9wj2exl3n08vu4wln87l4kpvp6ppspedm6t",
        bloodshedXLHAddress: "",
        bloodshedToken: "WEB-5d08be",
        stakeV2Address: "erd1qqqqqqqqqqqqqpgqwhqpykc0p9z08qgd85echw9jm4lv66nnpa7qrqyj9c",
        stakeV2SFT: "SFT-8ff335"
    },

    testnet: {
        apiAddress: 'https://testnet-api.multiversx.com',
        provider: 'https://testnet-gateway.multiversx.com',
        apiLink: 'https://testnet-api.multiversx.com/accounts/',
        token: 'XLH-b7f529',
        stakeAddress: "erd1qqqqqqqqqqqqqpgqdw9gatcwzlsdtvjwu3mveln57g0quyzzpa7q9jg84s",
        bloodshedAddress: "",
        bloodshedXLHAddress: "",
        bloodshedToken: "",
        stakeV2Address: "",
        stakeV2SFT: ""
    }
};

export const allTokens = {
    mainnet: {
        xlh: 'XLH-8daa50',
        vegld: 'VEGLD-2b9319'
    },

    devnet: {
        //xlh: 'XLH-4f55ab'
        xlh: 'XLH-4a7cc0',
        vegld: 'WEB-5d08be'
    },

    testnet: {
        //xlh: 'XLH-cb26c7'
        xlh: 'XLH-b7f529',
        vegld: ''
    }
};

export const defaultWalletData = {
    tokens: {
        xlh: 0
    },
    nfts: {
        xlhOrigins: {
            rust: 0,
            bronze: 0,
            silver: 0,
            gold: 0,
            platinum: 0,
            legendary: 0
        }
    }
};