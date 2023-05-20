import React, {useEffect, useState} from "react";
import Layout from 'layout/layout';
import {Address, AddressValue, U32Value, U64Value} from "@multiversx/sdk-core/out";
import Button from 'react-bootstrap/Button';
import {contractQuery, getAccountTokens, getAccountNFTS} from "utils/api";
import {stakeSFT, unstakeSFT} from "utils/stakingV2API";
import stakeV2Abi from "abiFiles/xlauncher-staking-v2.abi.json";
import {ProxyNetworkProvider} from "@multiversx/sdk-network-providers/out";
import {allTokens, networkId, customConfig} from "config/customConfig";
import {networkConfig} from "config/networks";
import {multiplier} from "utils/utilities";
import StakingV2Card from "cards/StakingV2Card";
import StakingV2UserCard from "cards/StakingV2UserCard";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {element} from "prop-types";

function StakingV2(props) {
	let walletState = props.walletState;
	const {address} = walletState;
	const isLoggedIn = address.startsWith("erd1");

	//Set the config network
	const config = customConfig[networkId];
	const networkProvider = new ProxyNetworkProvider(config.provider);
	const stakeScAddress = config.stakeV2Address;
	const stakeToken = config.token;
	const scName = "HelloWorld";
	const chainID = networkConfig[networkId].shortId;
	const tokensAPI = config.apiLink + address + "/tokens?size=2000";
	const nftsAPI = config.apiLink + address + "/nfts?size=1000";
	const tokens = allTokens[networkId];
	const sft = config.stakeV2SFT;

	//Get Account Tokens Balance
	const [xlhBalance, setXlhBalance] = useState(0);
	const [sftBalance, setSftBalance] = useState(0);
	const getWalletData = async () => {
		const newTokenList = await getAccountTokens(tokensAPI, tokens);
		if (newTokenList.xlh > 0) {
			setXlhBalance(newTokenList.xlh);
		}

		const newNftsList = await getAccountNFTS(nftsAPI);
		if (newNftsList.v2StakeSFT > 0){
			setSftBalance(parseInt(newNftsList.v2StakeSFT));
		}
};

	//Get the total number of created farms
	const [sftNumber, setSftNumber] = useState(0);
	const getSFTNumber = async () => {
		const newSFTNumber = await contractQuery(
			networkProvider,
			stakeV2Abi,
			stakeScAddress,
			"HelloWorld",
			"getClientState",
			[new AddressValue(new Address(address))]
		);
		if(newSFTNumber && isLoggedIn) {
			setSftNumber(newSFTNumber.sft_amount);
		}
	};

	//Get the total number of created farms
	const getFarmsNumber = async () => {
		const newFarmsNumber = await contractQuery(
			networkProvider,
			stakeV2Abi,
			stakeScAddress,
			"HelloWorld",
			"getTotalStakedData",
			[]
		);
		return newFarmsNumber.last_pool_id;
	};

	//get the farms data
	const [farmsDetails, setFarmsDetails] = useState([]);
	const [totalStaked, setTotalStaked] = useState(0);
	const getFarmsDetails = async () => {
		const farmsNumber = await getFarmsNumber();
		const newFarmsDetails = [];

		let totalAux = 0;
		for (let i = 1; i <= farmsNumber; i++) {
			const newPoolData = await contractQuery(
				networkProvider,
				stakeV2Abi,
				stakeScAddress,
				"HelloWorld",
				"getPoolData",
				[new U64Value(i)]
			);

			if(newPoolData){
				// Convert pool title buffer to ASCII string
				const poolTitleString = Buffer.from(newPoolData.pool_title).toString("ascii");
				const formattedTotal = newPoolData.pool_total_xlh / multiplier;
				const formattedCreationFunds = newPoolData.pool_creation_funds / multiplier;
				totalAux += formattedTotal;

				// Format farms details object with formatted pool title
				const formattedFarmDetails = {
					pool_id: newPoolData.pool_id,
					pool_rank: newPoolData.pool_rank,
					pool_title: poolTitleString,
					pool_total_xlh: formattedTotal,
					pool_creation_funds: formattedCreationFunds,
					pool_owner: newPoolData.pool_owner,
				};

				newFarmsDetails.push(formattedFarmDetails);
			}
		}

		// Set farms details state with formatted farms details
		setFarmsDetails(newFarmsDetails);
		setTotalStaked(totalAux);
	};

	//get the user farms staked data
	const [userFarmsDetails, setUserFarmsDetails] = useState([]);
	const [totalRewards, setTotalRewards] = useState(0);
	const getUserFarmsDetails = async () => {
		const newUserPoolData = await contractQuery(
			networkProvider,
			stakeV2Abi,
			stakeScAddress,
			"HelloWorld",
			"getClientReport",
			[new AddressValue(new Address(address))]
		);
		if (newUserPoolData) {
			setUserFarmsDetails(newUserPoolData);
		}
		let rewardsAux = 0;
		if(Object.keys(newUserPoolData).length > 0){
			newUserPoolData.report_pool_vector.map((element) => {
				let myRewardsXlh = element.xlh_rewords ? (element.xlh_rewords / multiplier) : 0;
				rewardsAux += myRewardsXlh;
			});
		}
		if(rewardsAux){
			setTotalRewards(rewardsAux);
		}
	};

	useEffect(() => {
		const interval = window.setInterval(() => {
			getFarmsDetails();
			getSFTNumber();
			if (isLoggedIn) {
				getUserFarmsDetails();
			}
		}, 1000);

		const interval2 = window.setInterval(() => {
			if (isLoggedIn) {
				getWalletData();
			}
		}, 3000);

		return () => {
			window.clearInterval(interval);
			window.clearInterval(interval2);
		}
		// eslint-disable-next-line
	}, [isLoggedIn]);

	//Change the color for the earned xlh if can be claimed / reinvested
	let earnedColor = "white";

	let cols = [];
	if (farmsDetails.length > 0) {
		cols = farmsDetails.map((farm) => {
			const {pool_id, pool_title, pool_rank, pool_total_xlh} = farm;
			let myStackedXlh = 0;
			let myRewardsXlh = 0;
			let availableStakeXLH = pool_total_xlh ? (1000000 - pool_total_xlh) : 0;
			let percentage = pool_total_xlh ? ((pool_total_xlh / 1000000) * 100) : 0;
			if (Object.keys(userFarmsDetails).length > 0 && isLoggedIn) {
				userFarmsDetails.report_pool_vector.map((element) => {
					if (farm.pool_id.toString() === element.pool_id.toString()) {
						myStackedXlh = element.xlh_amount ? (element.xlh_amount / multiplier) : 0;
						myRewardsXlh = element.xlh_rewords ? (element.xlh_rewords / multiplier) : 0;
					}
				});
			}

			return (
				<Col key={`poolNumber${pool_id}`} xs={12} lg={4}>
					<StakingV2Card
						stakeV2Abi={stakeV2Abi}
						stakeScAddress={stakeScAddress}
						scName={scName}
						chainID={chainID}
						stakeToken={stakeToken}
						poolId={pool_id}

						title={pool_title}
						tier={pool_rank.toString()}
						sftNumber={sftNumber}
						myXLH={myStackedXlh}
						myRewards={myRewardsXlh}
						xlhBalance={xlhBalance}
						isLoggedIn={isLoggedIn}
						maxXLH={availableStakeXLH}
						capacityPercentage={percentage}

						stake={{
							size: "sm",
							color: "info",
							label: "Stake",
							disabled: false
						}}
						claim={{
							size: "sm",
							color: "primary",
							label: "Claim",
							hint: "Individual rewards can be claimed with a minimum of 0.1 XLH",
							disabled: true
						}}
						unstake={{
							size: "sm",
							color: "dark",
							label: "Unstake",
							hint:
								"Individual rewards can be claimed 10 days after unstake transaction",
							disabled: false,
						}}
					/>
				</Col>
			);
		});
	}

	return (
		<div>
			<p style={{fontSize: '50px', color: 'white'}}>Staking V2</p>
			<Button onClick={() => stakeSFT(stakeV2Abi, stakeScAddress, scName, chainID, sft, address, 2)}>StakeSFT </Button>
			<Button onClick={() => unstakeSFT(stakeV2Abi, stakeScAddress, scName, chainID)}>UnstakeSFT </Button>
			<Row>
				<Col xs={12} lg={4}>
					<StakingV2UserCard
						stakeV2Abi={stakeV2Abi}
						stakeScAddress={stakeScAddress}
						scName={scName}
						chainID={chainID}
            sft={sft}
						address={address}

						title="User Panel"
						sftBalance={sftBalance}
						isLoggedIn={isLoggedIn}
						sftNumber={sftNumber}
						totalStaked={totalStaked}
						totalRewards={totalRewards}
						createdFarms="0"

						stake={{
							size: "sm",
							color: "info",
							label: "Stake SFT",
							disabled: false
						}}
						unstake={{
							size: "sm",
							color: "dark",
							label: "Unstake SFT",
							hint:
								"Individual rewards can be claimed 10 days after unstake transaction",
							disabled: false
						}}
					/>
				</Col>
				{cols}
			</Row>
		</div>
	);
}

export default StakingV2;