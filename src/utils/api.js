import {multiplier, calc2} from "utils/utilities";
import {
	AbiRegistry,
	Address, ContractFunction,
	Interaction,
	ResultsParser,
	SmartContract
} from "@multiversx/sdk-core/out";
import {networkId, customConfig} from "config/customConfig";

//API to get the logged in account tokens
export const getAccountTokens = async (tokensAPI, tokens) => {
	let tokenList = Object.fromEntries(
		Object.entries(tokens).map(([key, value]) => [key, 0])
	);
	try {
		const response = await fetch(tokensAPI, {
			headers: {
				'Accept': 'application/json',
			}
		});
		const json = await response.json();

		let keys = Object.keys(tokens);
		let provTokenList = [];
		if (json) {
			json.forEach(item => {
				for (let index = 0; index < keys.length; index++) {
					if (item.identifier === tokens[keys[index]]) {
						let currKey = keys[index];
						let currVal = 0;
						if (item.balance / multiplier) {
							currVal = calc2(item.balance / multiplier);
						}
						let currItem = {[currKey]: currVal};
						provTokenList.push(currItem);
					}
				}
			})
		}
		for (let i = 0; i < provTokenList.length; i++) {
			Object.assign(tokenList, provTokenList[i]);
		}
		return tokenList;
	} catch (error) {
		console.error("error " + error);
	}
};

//API to get the xlh origins nfts of the logged in account
export const getAccountNFTS = async (nftAPI) => {
	const config = customConfig[networkId];
	const nft = config.nft;
	const sft = config.stakeV2SFT;
	try {
		const response = await fetch(
			nftAPI,
			{
				headers: {
					'Accept': 'application/json'
				}
			});
		const json = await response.json();

		//Find all the necessary collections
		let collection = {
			xlhOrigins: [],
			v2StakeSFT: []
		};
		if (json) {
			json.forEach(item => {
				let collectionSwitcher = item.collection;
				switch (collectionSwitcher) {
					case nft:
						collection.xlhOrigins.push(item);
						break;
					case sft:
						collection.v2StakeSFT.push(item);
						break;
					default:
						break;
				}
			})
		}

		//Iterate through the collections and get the number of nfts
		let countRust = 0;
		let countBronze = 0;
		let countSilver = 0;
		let countGold = 0;
		let countPlatinum = 0;
		let countLegendary = 0;
		let countV2SFT = 0;
		Object.entries(collection).forEach(item => {
			let key = item[0];
			let value = item[1];
			switch (key) {
				case "xlhOrigins":
					value.forEach(nft => {
						let nftSwitcher = nft.metadata.attributes[3].value;
						switch (nftSwitcher) {
							case "rust":
								countRust += 1;
								break;
							case "bronze":
								countBronze += 1;
								break;
							case "silver":
								countSilver += 1;
								break;
							case "gold":
								countGold += 1;
								break;
							case "platinum":
								countPlatinum += 1;
								break;
							case "Orange":
								countLegendary += 1;
								break;
							default:
								break;
						}
					});
					break;
				case "v2StakeSFT":
					value.forEach(nft => {
						countV2SFT += nft.balance;
					});
					break;
				default:
					break;
			}
		});
		let xlhOrigins = {
			rust: countRust,
			bronze: countBronze,
			silver: countSilver,
			gold: countGold,
			platinum: countPlatinum,
			legendary: countLegendary
		};

		return ({
			xlhOrigins: xlhOrigins,
			v2StakeSFT: countV2SFT
		})
	} catch (error) {
		console.error("error " + error);
	}
};

// Function template to query a smart contract
export const contractQuery = async (networkProvider, abiFile, scAddress, scName, methodName, methodArgs) => {
	try {
		let abiRegistry = AbiRegistry.create(abiFile);
		let contract = new SmartContract({
			address: new Address(scAddress),
			abi: abiRegistry
		});

		let contractEndpoint = new ContractFunction(methodName);
		let interaction = new Interaction(contract, contractEndpoint, methodArgs);

		let query = interaction.check().buildQuery();
		let queryResponse = await networkProvider.queryContract(query);

		let endpointDefinition = interaction.getEndpoint();
		let resultsParser = new ResultsParser();
		let {firstValue} = resultsParser.parseQueryResponse(queryResponse, endpointDefinition);

		//console.log("firstValue " + JSON.stringify(firstValue.valueOf(), null, 2));
		if (firstValue) return firstValue.valueOf();

	} catch (error) {
		console.error(error);
	}
};

export const contractQueryMultipleValues = async (networkProvider, abiFile, scAddress, scName, methodName, methodArgs) => {
	try {
		let abiRegistry = AbiRegistry.create(abiFile);
		let contract = new SmartContract({
			address: new Address(scAddress),
			abi: abiRegistry
		});

		let contractEndpoint = new ContractFunction(methodName);
		let interaction = new Interaction(contract, contractEndpoint, methodArgs);

		let query = interaction.check().buildQuery();
		let queryResponse = await networkProvider.queryContract(query);

		let endpointDefinition = interaction.getEndpoint();
		let resultsParser = new ResultsParser();
		let values = resultsParser.parseQueryResponse(queryResponse, endpointDefinition);

		//console.log("values " + JSON.stringify(values.values, null, 2));
		if (values) return values.values;

	} catch (error) {
		console.error(error);
	}
};