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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSortAmountUp, faSortAmountDesc, faArrowUp, faArrowDown} from '@fortawesome/free-solid-svg-icons';
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";

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

	//Options button triggers
	const [showClaimUnstakedCards, setShowClaimUnstakedCards] = useState(false);
	const handleOptionsClaimUnstake = () => {
		setShowClaimUnstakedCards(!showClaimUnstakedCards);
	};


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
		if (newSFTNumber && isLoggedIn) {
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
	const [sortOptions, setSortOptions] = useState('tierAsc');
	const [farmsDetails, setFarmsDetails] = useState([]);
	const [createdFarms, setCreatedFarms] = useState(0);
	const getFarmsDetails = async () => {
		const farmsNumber = await getFarmsNumber();
		const newFarmsDetails = [];

		let createdFarmsAux = 0;
		for (let i = 1; i <= farmsNumber; i++) {
			const newPoolData = await contractQuery(
				networkProvider,
				stakeV2Abi,
				stakeScAddress,
				"HelloWorld",
				"getPoolData",
				[new U64Value(i)]
			);

			if (newPoolData) {
				// Convert pool title buffer to ASCII string
				const poolTitleString = Buffer.from(newPoolData.pool_title).toString("ascii");
				const formattedTotal = newPoolData.pool_total_xlh / multiplier;
				const formattedCreationFunds = newPoolData.pool_creation_funds / multiplier;

				const poolOwner = newPoolData.pool_owner.bech32();
				if (poolOwner === address) {
					createdFarmsAux += 1;
				}

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
		// Sort options
		if(sortOptions === 'tierAsc' ){
			newFarmsDetails.sort((a, b) => parseInt(a.pool_rank) - parseInt(b.pool_rank));
			setFarmsDetails(newFarmsDetails);
		}else if(sortOptions === 'tierDesc' ) {
			newFarmsDetails.sort((a, b) => parseInt(b.pool_rank) - parseInt(a.pool_rank));
			setFarmsDetails(newFarmsDetails);
		}else if(sortOptions === 'capacityAsc' ) {
			newFarmsDetails.sort((a, b) => a.pool_total_xlh - b.pool_total_xlh);
			setFarmsDetails(newFarmsDetails);
		}else if(sortOptions === 'capacityDesc' ) {
			newFarmsDetails.sort((a, b) => b.pool_total_xlh - a.pool_total_xlh);
			setFarmsDetails(newFarmsDetails);
		}else if(sortOptions === 'alphabet' ) {
			newFarmsDetails.sort((a, b) => a.pool_title.localeCompare(b.pool_title));
			setFarmsDetails(newFarmsDetails);
		}

		setCreatedFarms(createdFarmsAux);
	};

	//get the user farms staked data
	const [userFarmsDetails, setUserFarmsDetails] = useState([]);
	const [totalRewards, setTotalRewards] = useState(0);
	const [totalStaked, setTotalStaked] = useState(0);
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
		let totalAux = 0;
		if (newUserPoolData) {
			if (Object.keys(newUserPoolData).length > 0) {
				newUserPoolData.report_pool_vector.map((element) => {
					let myRewardsXlh = element.xlh_rewords ? (element.xlh_rewords / multiplier) : 0;
					rewardsAux += myRewardsXlh;

					let myStakedTotal = element.xlh_amount ? (element.xlh_amount / multiplier) : 0;
					totalAux += myStakedTotal;
				});
			}
		}
		if (rewardsAux) {
			setTotalRewards(rewardsAux);
		}
		if(totalAux){
			setTotalStaked(totalAux);
		}
	};

	const [claimUnstakeXLHAmount, setClaimUnstakeXLHAmount] = useState(0);
	const [claimUnstakeXLHTimestamp, setClaimUnstakeXLHTimestamp] = useState(null);
	const [claimUnstakeSFTAmount, setClaimUnstakeSFTAmount] = useState(0);
	const [claimUnstakeSFTTimestamp, setClaimUnstakeSFTTimestamp] = useState(null);
	const getClaimUnstakeStatsNumber = async () => {
		const newStateXlh = await contractQuery(
			networkProvider,
			stakeV2Abi,
			stakeScAddress,
			"HelloWorld",
			"getUnstakeXlhState",
			[new AddressValue(new Address(address))]
		);
		if (newStateXlh) {
			const unstakedAmount = newStateXlh.total_unstaked_amount / multiplier;
			const unlockingTimestamp = newStateXlh.free_after_time_stamp;

			setClaimUnstakeXLHAmount(unstakedAmount);
			setClaimUnstakeXLHTimestamp(unlockingTimestamp);
		}

		const newStateSft = await contractQuery(
			networkProvider,
			stakeV2Abi,
			stakeScAddress,
			"HelloWorld",
			"getUnstakeSftState",
			[new AddressValue(new Address(address))]
		);

		if (newStateSft) {
			const unstakedAmountS = newStateSft.total_unstaked_sft_amount;
			const unlockingTimestampS = newStateSft.free_after_time_stamp;

			setClaimUnstakeSFTAmount(unstakedAmountS);
			setClaimUnstakeSFTTimestamp(unlockingTimestampS);
		}
	};

	//NewFarm modal
	const [farmTitle, setFarmTitle] = useState('');
	const handleInputChangeN = (event) => {
		const inputValue = event.target.value;

		if (inputValue.length > 18) {
			return;
		}

		const filteredValue = inputValue.replace(/[^a-zA-Z0-9\s-]/g, "");
		setFarmTitle(filteredValue);
	};

	const [farmTier, setFarmTier] = useState(0);
	const [farmCost, setFarmCost] = useState(0);
	const handleSelectChange = (event) => {
		const selectedValue = event.target.value;
		setFarmTier(parseInt(selectedValue));

		switch (event.target.value) {
			case 1: setFarmCost(300000); break;
			case 2: setFarmCost(200000); break;
			case 3: setFarmCost(100000); break;
			default: setFarmCost(0); break;
		}
	};

	const [openN, setOpenN] = useState(false);
	const handleOpenN = () => setOpenN(true);
	const handleCloseN = () => {
		setOpenN(false);
		setFarmTitle('');
		setFarmTier(0);
		setFarmCost(0);
	};

	let disabledN = true;
	if(xlhBalance >= farmCost && isLoggedIn && farmCost > 0){
		disabledN = false;
	}

	//Handle the options sort dropdown
	const handleSortOption = (name) => {
		setSortOptions(name);
	};

	//Show my farms only
	const [myFarms, setMyFarms] = useState(false);

	useEffect(() => {
		const hideFarmsElements = document.querySelectorAll('.hide-farms');

		if (myFarms) {
			hideFarmsElements.forEach((element) => {
				element.style.display = 'none';
			});
		} else {
			hideFarmsElements.forEach((element) => {
				element.style.display = 'block';
			});
		}
	}, [myFarms]);

	//Show my created farms only
	const [myCreatedFarms, setMyCreatedFarms] = useState(false);

	useEffect(() => {
		const hideCreatedFarmsElements = document.querySelectorAll('.hide-created-farms');

		if (myCreatedFarms) {
			hideCreatedFarmsElements.forEach((element) => {
				element.style.display = 'none';
			});
		} else {
			hideCreatedFarmsElements.forEach((element) => {
				element.style.display = 'block';
			});
		}
	}, [myCreatedFarms]);

	//get loading transactions for sending to elements
	const loadingTransactions = useGetPendingTransactions().hasPendingTransactions;

	//blacklist to hide unwanted farm pools
	const [blacklist, setBlacklist] = useState([]);
	const getBlacklist=()=>{
		fetch('blacklist.json'
			,{
				headers : {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			})
			.then(function(response){
				return response.json();
			})
			.then(function(myJson) {
				setBlacklist(myJson);
			});
	};

	//Build a new array without blacklisted farms
	const filteredFarmsDetails = farmsDetails.filter(farm => !blacklist.farms.some(blacklistedTitle => blacklistedTitle.toLowerCase() === farm.pool_title.toLowerCase()));


	useEffect(() => {
		getBlacklist();
		getFarmsDetails();
		getSFTNumber();
		if (isLoggedIn) {
			getUserFarmsDetails();
			getClaimUnstakeStatsNumber();
			getWalletData();
		}
		const interval = window.setInterval(() => {
			getBlacklist();
			getFarmsDetails();
			getSFTNumber();
			if (isLoggedIn) {
				getUserFarmsDetails();
				getClaimUnstakeStatsNumber();
				getWalletData();
			}
		}, 5000);

		return () => window.clearInterval(interval);
		// eslint-disable-next-line
	}, [isLoggedIn, sortOptions]);


	let cols = [];
	if (filteredFarmsDetails.length > 0) {
		cols = filteredFarmsDetails.map((farm) => {
			let createdClass = 'hide-created-farms';
			const owner = farm.pool_owner.bech32();
			if (owner === address) {
				createdClass = 'show-created-farms'
			}

			const {pool_id, pool_title, pool_rank, pool_total_xlh} = farm;
			let myClass = 'hide-farms';
			let myStackedXlh = 0;
			let myRewardsXlh = 0;
			let availableStakeXLH = pool_total_xlh ? (1000000 - pool_total_xlh) : 1000000;
			let percentage = pool_total_xlh ? ((pool_total_xlh / 1000000) * 100) : 0;
			if (Object.keys(userFarmsDetails).length > 0 && isLoggedIn) {
				userFarmsDetails.report_pool_vector.map((element) => {
					if (farm.pool_id.toString() === element.pool_id.toString()) {
						myStackedXlh = element.xlh_amount ? (element.xlh_amount / multiplier) : 0;
						myRewardsXlh = element.xlh_rewords ? (element.xlh_rewords / multiplier) : 0;
						myClass = 'show-farms';
					}
				});
			}

			return (
				<Col key={`poolNumber${pool_id}`} xs={12} lg={4} className={`${myClass} ${createdClass}`}>
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
			);
		});
	}

	let disabledCreate = false;
	if(loadingTransactions || !isLoggedIn){
		disabledCreate = true;
	}

	return (
		<div>
			<p
				className="text-white font-bold mt-4 ms-2"
				style={{ fontSize: "40px" }}
			>
				Staking V2
			</p>

			<Row className="mt-2">
				<Col xs={6} lg={2}>
					<Button className="btn btn-block" onClick={handleOpenN} disabled={disabledCreate}>New Farm</Button>
				</Col>
				<Col xs={6} lg={2}>
					<Dropdown>
						<Dropdown.Toggle variant="primary" id="options-dropdown" style={{width: "100%"}}>
							Options
						</Dropdown.Toggle>
						<Dropdown.Menu variant="dark">
							<Dropdown.Item  className={'text-white'} onClick={handleOptionsClaimUnstake}>
								{showClaimUnstakedCards ? "Hide Claim Unstaked Cards" : "Show Claim Unstaked Cards"}
							</Dropdown.Item>
							<Dropdown.Item  className={'text-white'} onClick={() => setMyFarms(!myFarms)}>
								{!myFarms ? "Show My Staking Farms" : "Show All Staking Farms"}
							</Dropdown.Item>
							<Dropdown.Item  className={'text-white'} onClick={() => setMyCreatedFarms(!myCreatedFarms)}>
								{myCreatedFarms ? "Show All Created Farms" : "Show My Created Farms"}
							</Dropdown.Item>
							<div className="light-divider" style={{width: '100%', marginLeft: 0, marginTop: '5px', marginBottom: '10px'}}></div>
							<Dropdown.Item  className={sortOptions === 'tierAsc' ? 'bg-primary text-white' : ''} onClick={() => handleSortOption('tierAsc')}>
								Sort by Tier <FontAwesomeIcon icon={faArrowUp} />
							</Dropdown.Item>
							<Dropdown.Item  className={sortOptions === 'tierDesc' ? 'bg-primary text-white' : ''} onClick={() => handleSortOption('tierDesc')}>
								Sort by Tier <FontAwesomeIcon icon={faArrowDown} />
							</Dropdown.Item>
							<Dropdown.Item  className={sortOptions === 'capacityAsc' ? 'bg-primary text-white' : ''} onClick={() => handleSortOption('capacityAsc')}>
								Sort by Capacity <FontAwesomeIcon icon={faArrowUp} />
							</Dropdown.Item>
							<Dropdown.Item className={sortOptions === 'capacityDesc' ? 'bg-primary text-white' : ''} onClick={() => handleSortOption('capacityDesc')}>
								Sort by Capacity <FontAwesomeIcon icon={faArrowDown} />
							</Dropdown.Item>
							<Dropdown.Item  className={sortOptions === 'alphabet' ? 'bg-primary text-white' : ''} onClick={() => handleSortOption('alphabet')}>
								Sort Alphabetically <FontAwesomeIcon icon={faArrowUp} />
							</Dropdown.Item>
						</Dropdown.Menu>
					</Dropdown>
				</Col>
			</Row>
			{showClaimUnstakedCards ? (
				<Row>
					<Col xs={12} lg={4}>
						<CompleteUnstakeCardV2
							stakeV2Abi={stakeV2Abi}
							stakeScAddress={stakeScAddress}
							scName={scName}
							chainID={chainID}

							lockedTime="10 Days Locked"
							amount={claimUnstakeXLHAmount}
							timestamp={claimUnstakeXLHTimestamp * 1000}
							isSftCard={false}
							isLoggedIn={isLoggedIn}
							loadingTransactions={loadingTransactions}
						/>
					</Col>
					<Col xs={12} lg={4}>
						<CompleteUnstakeCardV2
							stakeV2Abi={stakeV2Abi}
							stakeScAddress={stakeScAddress}
							scName={scName}
							chainID={chainID}

							lockedTime="60 Days Locked"
							amount={claimUnstakeSFTAmount}
							timestamp={claimUnstakeSFTTimestamp * 1000}
							isSftCard={true}
							isLoggedIn={isLoggedIn}
							loadingTransactions={loadingTransactions}
						/>
					</Col>
				</Row>
			) : ('')}
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
						createdFarms={createdFarms}
						loadingTransactions={loadingTransactions}

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
								"Individual rewards can be claimed 60 days after unstake transaction",
							disabled: false
						}}
					/>
				</Col>
				{cols}
			</Row>

			{/* New Farm Modal	*/}
			<Modal
				aria-labelledby="transition-modal-title2"
				aria-describedby="transition-modal-description2"
				open={openN}
				onClose={handleCloseN}
				closeAfterTransition
				BackdropComponent={Backdrop}
				BackdropProps={{
					timeout: 500,
				}}
			>
				<Fade in={openN}>
					<Box sx={style}>
						<div style={{minHeight: "250px"}} className="farm-card">
							<div className="d-flex mb-5 align-items-center">
								<Image
									width={42}
									height={35}
									alt="18x18"
									src={XLHLogo}
								/>
								<div id="transition-modal-title2" className="ms-3 font-size-md text-capitalize text-white font-medium">
									Open New Farm
								</div>
							</div>
							<div id="transition-modal-description2" className="mt-5">
								<Input
									value={farmTitle}
									size="small"
									placeholder="Enter Farm Name"
									onChange={handleInputChangeN}
									disableUnderline
									disabled={false}
									className="text-white ps-3 pe-5 pt-1 b-r-md"
									style={{border: '0.5px solid rgb(74, 85, 104)', width: '100%'}}
								/>
								<FormControl fullWidth>
									<Select
										value={farmTier}
										onChange={handleSelectChange}
										size="small"
										className="text-white b-r-md mt-2"
										sx={{border: '0.5px solid rgb(74, 85, 104)', fontSize: '15px', padding: '0'}}
									>
										<MenuItem value={0}>Select Farm Tier</MenuItem>
										<MenuItem value={1}>Tier 1</MenuItem>
										<MenuItem value={2}>Tier 2</MenuItem>
										<MenuItem value={3}>Tier 3</MenuItem>
									</Select>
								</FormControl>

								<p className="font-size-sm text-white text-capitalize mt-3 ms-1">
									Payment Cost: {intlNumberFormat(farmCost, "en-GB", 0, 0)} XLH
								</p>
								<p className="font-size-sm text-white text-capitalize ms-1" style={{marginTop: '-10px'}}>
									Available XLH: {intlNumberFormat(xlhBalance)}
								</p>
								<Row className="mt-5">
									<Col xs={12} md={6} lg={6} className="mt-4">
										<Button
											className="btn btn-block btn-sm btn-info"
											style={{minWidth: "90px"}}
											onClick={() => {createFarm(stakeV2Abi, stakeScAddress, scName, chainID, farmTier, farmTitle, stakeToken, farmCost);setOpenN(false);}}
											disabled={disabledN}
										>
											Create Farm
										</Button>
									</Col>
									<Col xs={12} md={6} lg={6} className="mt-4">
										<Button
											className="btn btn-block btn-sm btn-outline-light"
											style={{minWidth: "90px"}}
											onClick={handleCloseN}
										>
											Cancel
										</Button>
									</Col>
								</Row>
							</div>
						</div>
					</Box>
				</Fade>
			</Modal>
		</div>
	);
}

export default StakingV2;