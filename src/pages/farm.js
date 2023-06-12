import React, {useEffect, useState} from "react";
import {Address, AddressValue, U64Value} from "@multiversx/sdk-core/out";
import Button from 'react-bootstrap/Button';
import {contractQuery, getAccountTokens, getAccountNFTS} from "utils/api";
import {createFarm} from "utils/stakingV2API";
import stakeV2Abi from "abiFiles/xlauncher-staking-v2.abi.json";
import {ProxyNetworkProvider} from "@multiversx/sdk-network-providers/out";
import {allTokens, networkId, customConfig} from "config/customConfig";
import {networkConfig} from "config/networks";
import {multiplier} from "utils/utilities";
import StakingV2Card from "cards/StakingV2Card";
import StakingV2UserCard from "cards/StakingV2UserCard";
import CompleteUnstakeCardV2 from "cards/CompleteUnstakeCardV2";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import Backdrop from "@mui/material/Backdrop";
import Fade from "@mui/material/Fade/Fade";
import Box from "@mui/material/Box";
import Image from "react-bootstrap/Image";
import XLHLogo from "assets/images/logo.svg";
import Input from "@mui/material/Input";
import Modal from "@mui/material/Modal";
import {intlNumberFormat} from "../utils/utilities";
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowUp, faArrowDown} from '@fortawesome/free-solid-svg-icons';
import {useGetPendingTransactions} from "@multiversx/sdk-dapp/hooks/transactions";
import {element} from "prop-types";

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	boxShadow: 5,
	backgroundColor: '#060b28f0',
	borderRadius: "25px",
	p: 4
};

export default function Farm(props) {
	const urlParts = window.location.pathname.split('/');
	const farmId = urlParts[urlParts.length - 1];

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
		if (newNftsList.v2StakeSFT > 0) {
			setSftBalance(parseInt(newNftsList.v2StakeSFT));
		}
	};

	//Get the total number of staked SFTS
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
		if (newSFTNumber && isLoggedIn) {
			setSftNumber(newSFTNumber.sft_amount);
		}
	};

	//get the farms data
	const [farmDetails, setFarmDetails] = useState([]);
	const [isOwner, setIsOwner] = useState(false);
	const getFarmDetails = async () => {
		const newPoolData = await contractQuery(
			networkProvider,
			stakeV2Abi,
			stakeScAddress,
			"HelloWorld",
			"getPoolData",
			[new U64Value(farmId)]
		);

		if (newPoolData) {
			// Convert pool title buffer to ASCII string
			const poolTitleString = Buffer.from(newPoolData.pool_title).toString("ascii");
			const formattedTotal = newPoolData.pool_total_xlh / multiplier;
			const formattedCreationFunds = newPoolData.pool_creation_funds / multiplier;

			const poolOwner = newPoolData.pool_owner.bech32();
			if (poolOwner === address) {
				setIsOwner(true);
			}

			const formattedFarmDetails = {
				pool_id: newPoolData.pool_id,
				pool_rank: newPoolData.pool_rank,
				pool_title: poolTitleString,
				pool_total_xlh: formattedTotal,
				pool_creation_funds: formattedCreationFunds,
				pool_owner: newPoolData.pool_owner,
			};
			setFarmDetails(formattedFarmDetails);
		}
	};

	//get the user farms staked data
	const [userFarmDetails, setUserFarmDetails] = useState([]);
	const getUserFarmDetails = async () => {
		const newUserPoolData = await contractQuery(
			networkProvider,
			stakeV2Abi,
			stakeScAddress,
			"HelloWorld",
			"getClientReport",
			[new AddressValue(new Address(address))]
		);
		if (newUserPoolData) {
			if (Object.keys(newUserPoolData).length > 0 && Object.keys(newUserPoolData).length > 0) {
				newUserPoolData.report_pool_vector.forEach((element) => {
					if(element.pool_id.toString() === farmId.toString()){
						const formattedPoolAmount = element.xlh_amount ? (element.xlh_amount / multiplier) : 0;
						const formattedPoolRewards = element.xlh_rewords ? (element.xlh_rewords / multiplier) : 0;

						const formattedUserFarmDetails = {
							pool_id: newUserPoolData.pool_id,
							pool_amount: formattedPoolAmount,
							pool_rewards: formattedPoolRewards
						};

						setUserFarmDetails(formattedUserFarmDetails);
					}
				});
			}
		}
	};

	//get loading transactions for sending to elements
	const loadingTransactions = useGetPendingTransactions().hasPendingTransactions;

	let availableStakeXLH = farmDetails.pool_total_xlh ? (1000000 - farmDetails.pool_total_xlh) : 1000000;
	let percentage = farmDetails.pool_total_xlh ? ((farmDetails.pool_total_xlh / 1000000) * 100) : 0;

	useEffect(() => {
		getFarmDetails();
		if (isLoggedIn) {
			getUserFarmDetails();
			getWalletData();
			getSFTNumber();
		}
		const interval = window.setInterval(() => {
			getFarmDetails();
			if (isLoggedIn) {
				getUserFarmDetails();
				getWalletData();
				getSFTNumber();
			}
		}, 5000);

		return () => window.clearInterval(interval);
		// eslint-disable-next-line
	}, [isLoggedIn]);

	return (
		<div>
			<p className="text-white font-bold mt-4 ms-2" style={{ fontSize: "40px" }}>
				{farmDetails.pool_title ? farmDetails.pool_title : 'Farm Name'}
			</p>

			<Row>
				<Col xs={12} lg={4}>
					<StakingV2Card
						stakeV2Abi={stakeV2Abi}
						stakeScAddress={stakeScAddress}
						scName={scName}
						chainID={chainID}
						stakeToken={stakeToken}
						poolId={farmId.toString()}

						title={farmDetails.pool_title ? farmDetails.pool_title : 'Farm name'}
						tier={farmDetails.pool_rank ? farmDetails.pool_rank.toString() : '-'}
						sftNumber={sftNumber}
						myXLH={userFarmDetails.pool_amount ? userFarmDetails.pool_amount : 0}
						myRewards={userFarmDetails.pool_rewards ? userFarmDetails.pool_rewards : 0}
						xlhBalance={xlhBalance}
						isLoggedIn={isLoggedIn}
						maxXLH={availableStakeXLH}
						capacityPercentage={percentage}
						loadingTransactions={loadingTransactions}

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
							hint: "Individual rewards can be claimed with a minimum of 100 XLH",
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
			</Row>
		</div>
	)

}
