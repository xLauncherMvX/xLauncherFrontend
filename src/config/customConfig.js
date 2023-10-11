export const networkId = "devnet";

export const customConfig = {
    mainnet: {
        website: 'https://app.x-launcher.com/',
        apiAddress: 'https://api.multiversx.com',
        provider: 'https://gateway.multiversx.com',
        apiLink: 'https://api.multiversx.com/accounts/',
        token: 'XLH-8daa50',
        nft: 'XLHO-5135c9',
        stakeAddress: "erd1qqqqqqqqqqqqqpgql0yx4uetca8g4wmr96d9z7094vj3uhpt4d6qm5srfk",
        bloodshedAddress: "erd1qqqqqqqqqqqqqpgq47jpmgd7z3v036fqyzt5nhajzau8ygxryl5stecvv3",
        bloodshedXLHAddress: "erd1qqqqqqqqqqqqqpgq7u7e4lggx0vp09wyklu4cjh233nfchtayl5sq0xp43",
        bloodshedToken: "VEGLD-2b9319",
        stakeV2Address: "erd1qqqqqqqqqqqqqpgqakurn4jvyhuull080mul0whr7e56jkpl4d6qcpa5x0",
        stakeV2SFT: "XLHB-4989e2",
        xBidAddress: "erd1qqqqqqqqqqqqqpgqzsfa9hk3c53mjrqvd6dx9y8smj5l96q44d6q57yvce",
        xBidToken: "XBID-c7e360",
        xBidTokenLabel: "XBID"
    },

    devnet: {
        website: 'https://devnet-app.x-launcher.com/',
        apiAddress: 'https://devnet-api.multiversx.com',
        provider: 'https://devnet-gateway.multiversx.com',
        apiLink: 'https://devnet-api.multiversx.com/accounts/',
        token: 'XLH-4a7cc0',
        nft: 'XLHO-5135c9',
        stakeAddress: "erd1qqqqqqqqqqqqqpgqxmeg3k0ty84hm3f8n9wdfpukspc0asj3pa7qtt6j0t",
        bloodshedAddress: "erd1qqqqqqqqqqqqqpgq4m4udte9wj2exl3n08vu4wln87l4kpvp6ppspedm6t",
        bloodshedXLHAddress: "",
        bloodshedToken: "WEB-5d08be",
        stakeV2Address: "erd1qqqqqqqqqqqqqpgqwhqpykc0p9z08qgd85echw9jm4lv66nnpa7qrqyj9c",
        stakeV2SFT: "SFT-8ff335",
        xBidAddress: "erd1qqqqqqqqqqqqqpgqp37tg4u9ydmzyyxs8fdtwkpecjwxcvj7pa7q4plr2q",
        xBidToken: "XLH-4a7cc0",
        xBidTokenLabel: "XBID"
    },

    testnet: {
        website: 'https://testnet-app.x-launcher.com/',
        apiAddress: 'https://testnet-api.multiversx.com',
        provider: 'https://testnet-gateway.multiversx.com',
        apiLink: 'https://testnet-api.multiversx.com/accounts/',
        token: 'XLH-b7f529',
        nft: 'XLHO-5135c9',
        stakeAddress: "erd1qqqqqqqqqqqqqpgqdw9gatcwzlsdtvjwu3mveln57g0quyzzpa7q9jg84s",
        bloodshedAddress: "",
        bloodshedXLHAddress: "",
        bloodshedToken: "",
        stakeV2Address: "",
        stakeV2SFT: "",
        xBidAddress: "",
        xBidToken: "",
        xBidTokenLabel: "XBID"
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