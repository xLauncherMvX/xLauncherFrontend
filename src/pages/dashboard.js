import React, {useEffect, useState} from "react";
import {Col, Row, Card, Container} from 'react-bootstrap';
import {MiniStatisticCard} from 'cards/miniStatisticCard';
import {MiniNFTRankCard} from 'cards/miniNFTRankCard';
import {MdOutlineDriveFileRenameOutline} from "react-icons/md";
import {BiCoinStack} from 'react-icons/bi';
import {GiFlame} from 'react-icons/gi';
import {RiCoinsLine} from 'react-icons/ri';
import {FaUserTie} from "react-icons/fa";
import {BiTransfer} from 'react-icons/bi';
import {intlNumberFormat, multiplier} from "utils/utilities";
import RustLogo from "assets/images/rockets/rust.png";
import BronzeLogo from "assets/images/rockets/bronze.png";
import SilverLogo from "assets/images/rockets/silver.png";
import GoldLogo from "assets/images/rockets/gold.png";
import PlatinumLogo from "assets/images/rockets/platinum.png";
import LegendaryLogo from "assets/images/rockets/legendary.png";
import {contractQuery} from "utils/api";
import {U64Value} from "@multiversx/sdk-core/out";
import {ProxyNetworkProvider} from "@multiversx/sdk-network-providers/out";
import {networkId, customConfig} from "config/customConfig";
import stakeV2Abi from "abiFiles/xlauncher-staking-v2.abi.json";
import Chart from "react-apexcharts";

function Dashboard(props) {
	//Set the config network
	const config = customConfig[networkId];
	const networkProvider = new ProxyNetworkProvider(config.provider);
	const stakeScAddress = config.stakeV2Address;

	//Get Token Details
	const tokenAPI = 'https://api.elrond.com/tokens/XLH-8daa50';
	const [tokenDetails, setTokenDetails] = useState([]);
	const getTokenDetails = async () => {
		try {
			const response = await fetch(tokenAPI,
				{
					headers: {
						'Accept': 'application/json',
					}
				});

			const json = await response.json();
			setTokenDetails(json);
		} catch (error) {
			console.error(error);
		}
	};

	let tokenMinted = 0;
	let tokenBurnt = 0;
	let tokenSupply = 0;
	let tokenHolders = 0;
	let tokenTransactions = 0;
	if (tokenDetails.initialMinted) {
		tokenMinted = intlNumberFormat(tokenDetails.initialMinted / multiplier, "en-GB", 0, 0);
	}
	if (tokenDetails.burnt) {
		tokenBurnt = intlNumberFormat(tokenDetails.burnt / multiplier, "en-GB", 0, 0);
	}
	if (tokenDetails.supply) {
		tokenSupply = intlNumberFormat(tokenDetails.supply, "en-GB", 0, 0);
	}
	if (tokenDetails.accounts) {
		tokenHolders = intlNumberFormat(tokenDetails.accounts, "en-GB", 0, 0);
	}
	if (tokenDetails.transactions) {
		tokenTransactions = intlNumberFormat(tokenDetails.transactions, "en-GB", 0, 0);
	}

	//Get Staking V2 farms
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
	const [poolRanksNumber, setPoolRanksNumber] = useState({tier1: 0, tier2: 0, tier3: 0});
	const [poolRanksTotal, setPoolRanksTotal] = useState({tier1: 0, tier2: 0, tier3: 0});
	const getFarmsDetails = async () => {
		const farmsNumber = await getFarmsNumber();
		const newFarmsDetails = [];

		let rank1Aux = 0;
		let rank2Aux = 0;
		let rank3Aux = 0;
		let rank1Tot = 0;
		let rank2Tot = 0;
		let rank3Tot = 0;
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
				if (newPoolData.pool_rank.toString() === '1') {
					rank1Aux += 1;
					rank1Tot += formattedTotal;
				}
				if (newPoolData.pool_rank.toString() === '2') {
					rank2Aux += 1;
					rank2Tot += formattedTotal;
				}
				if (newPoolData.pool_rank.toString() === '3') {
					rank3Aux += 1;
					rank3Tot += formattedTotal;
				}
			}
		}

		setPoolRanksNumber({tier1: rank1Aux, tier2: rank2Aux, tier3: rank3Aux});
		setPoolRanksTotal({tier1: rank1Tot, tier2: rank2Tot, tier3: rank3Tot});
		setFarmsDetails(newFarmsDetails);
	};

	const MINUTE_MS = 3000;
	useEffect(() => {
		getTokenDetails();
		getFarmsDetails();
		const interval = window.setInterval(() => {
			getTokenDetails();
			getFarmsDetails();
		}, MINUTE_MS);

		return () => window.clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
	}, []);


	return (
		<div>
			<p className="text-white font-bold mt-4 ms-2" style={{fontSize: '40px', marginBottom: '-10px'}}>Token
				Statistics</p>
			<Container>
				<Row>
					<Col xs={6} md={4} lg={2} className="mt-4">
						<MiniStatisticCard
							icon={MdOutlineDriveFileRenameOutline}
							title="General"
							description="Token Name"
							value="XLH-8daa50"
							border=""
						/>
					</Col>
					<Col xs={6} md={4} lg={2} className="mt-4">
						<MiniStatisticCard
							icon={RiCoinsLine}
							title="Minted"
							description="Initial Amount"
							value={tokenMinted}
							border=""
						/>
					</Col>
					<Col xs={6} md={4} lg={2} className="mt-4">
						<MiniStatisticCard
							icon={GiFlame}
							title="Burned"
							description="Total"
							value={tokenBurnt}
							border=""
						/>
					</Col>
					<Col xs={6} md={4} lg={2} className="mt-4">
						<MiniStatisticCard
							icon={BiCoinStack}
							title="Supply"
							description="Total"
							value={tokenSupply}
							border=""
						/>
					</Col>
					<Col xs={6} md={4} lg={2} className="mt-4">
						<MiniStatisticCard
							icon={FaUserTie}
							title="Holders"
							description="XLH Accounts"
							value={tokenHolders}
							border=""
						/>
					</Col>
					<Col xs={6} md={4} lg={2} className="mt-4">
						<MiniStatisticCard
							icon={BiTransfer}
							title="Transactions"
							description="Total"
							value={tokenTransactions}
							border=""
						/>
					</Col>
				</Row>
			</Container>

			<p className="text-white font-bold mt-5 ms-2" style={{fontSize: '40px', marginBottom: '-10px'}}>XLHOrigins NFTS
				Ranks</p>
			<Container>
				<Row>
					<Col xs={6} md={4} lg={2} className="mt-4">
						<MiniNFTRankCard
							image={RustLogo}
							title="Rust"
						/>
					</Col>
					<Col xs={6} md={4} lg={2} className="mt-4">
						<MiniNFTRankCard
							image={BronzeLogo}
							title="Bronze"
						/>
					</Col>
					<Col xs={6} md={4} lg={2} className="mt-4">
						<MiniNFTRankCard
							image={SilverLogo}
							title="Silver"
						/>
					</Col>
					<Col xs={6} md={4} lg={2} className="mt-4">
						<MiniNFTRankCard
							image={GoldLogo}
							title="Gold"
						/>
					</Col>
					<Col xs={6} md={4} lg={2} className="mt-4">
						<MiniNFTRankCard
							image={PlatinumLogo}
							title="Platinum"
						/>
					</Col>
					<Col xs={6} md={4} lg={2} className="mt-4">
						<MiniNFTRankCard
							image={LegendaryLogo}
							title="Legendary"
						/>
					</Col>
				</Row>
			</Container>

			<p className="text-white font-bold mt-5 ms-2" style={{fontSize: '40px', marginBottom: '-10px'}}>Staking V2
				Statistics</p>
			<Container>
				<Row>
					<Col xs={12} lg={4} className="mt-4">
						<div className="farming-card">
							<p className="text-white ms-3 h4 font-bold">Total Opened Farms</p>
							<Chart
								options={{
									chart: {
										toolbar: {
											show: false,
										}
									},
									plotOptions: {
										bar: {
											borderRadius: 5,
											barHeight: '40%',
											dataLabels: {
												position: 'center', // top, center, bottom
											},
											horizontal: true,
										}
									},
									dataLabels: {
										enabled: true,
										style: {
											fontSize: '12px',
											colors: ["#ffffff"]
										},
										formatter: function (val) {
											return intlNumberFormat(val, "en-GB", 0, 0);
										},
									},
									markers: {
										size: 3,
										colors: "#0C72F7",
										strokeColors: "#0C72F7",
										strokeWidth: 2,
										strokeOpacity: 0.9,
										strokeDashArray: 0,
										fillOpacity: 1,
										discrete: [],
										shape: "circle",
										radius: 2,
										offsetX: 0,
										offsetY: 0,
										showNullDataPoints: true,
									},
									tooltip: {
										theme: "dark",
									},
									xaxis: {
										categories: ["Tier1", "Tier2", "Tier3"],
										labels: {
											style: {
												colors: "white",
												fontSize: "12px",
											},
										},
										axisBorder: {
											show: true,
										},
										axisTicks: {
											show: false,
										},
									},
									yaxis: {
										labels: {
											style: {
												colors: "white",
												fontSize: "12px",
											},
											axisBorder: {
												show: true,
											},
											axisTicks: {
												show: false,
											},
										},
									},
									legend: {
										show: true,
									},
									grid: {
										colors: "white",
										strokeDashArray: 5,
										yaxis: {
											lines: {
												show: false,
											},
										},
										xaxis: {
											lines: {
												show: true,
											},
										},
									},
									fill: {
										type: "solid",
										colors: ["#0C72F7"],
									}
								}}
								series={[
									{
										name: "Total Farms",
										data: [poolRanksNumber.tier1, poolRanksNumber.tier2, poolRanksNumber.tier3]
									},
								]}
								type="bar"
								height={280}
							/>
						</div>
					</Col>
					<Col xs={12} lg={4} className="mt-4">
						<div className="farming-card">
							<p className="text-white ms-3 h4 font-bold">Total Staked XLH</p>
							<Chart
								options={{
									chart: {
										toolbar: {
											show: false,
										}
									},
									plotOptions: {
										bar: {
											borderRadius: 5,
											barHeight: '40%',
											dataLabels: {
												position: 'center', // top, center, bottom
											},
											horizontal: true,
										}
									},
									dataLabels: {
										enabled: true,
										style: {
											fontSize: '12px',
											colors: ["#ffffff"]
										},
										formatter: function (val) {
											return intlNumberFormat(val);
										},
									},
									markers: {
										size: 3,
										colors: "#0C72F7",
										strokeColors: "#0C72F7",
										strokeWidth: 2,
										strokeOpacity: 0.9,
										strokeDashArray: 0,
										fillOpacity: 1,
										discrete: [],
										shape: "circle",
										radius: 2,
										offsetX: 0,
										offsetY: 0,
										showNullDataPoints: true,
									},
									tooltip: {
										theme: "dark",
									},
									xaxis: {
										categories: ["Tier1", "Tier2", "Tier3"],
										labels: {
											style: {
												colors: "white",
												fontSize: "12px",
											},
										},
										axisBorder: {
											show: true,
										},
										axisTicks: {
											show: false,
										},
									},
									yaxis: {
										labels: {
											style: {
												colors: "white",
												fontSize: "12px",
											},
											axisBorder: {
												show: true,
											},
											axisTicks: {
												show: false,
											},
										},
									},
									legend: {
										show: true,
									},
									grid: {
										colors: "white",
										strokeDashArray: 5,
										yaxis: {
											lines: {
												show: false,
											},
										},
										xaxis: {
											lines: {
												show: true,
											},
										},
									},
									fill: {
										type: "solid",
										colors: ["#0C72F7"],
									}
								}}
								series={[
									{
										name: "Total Staked XLH",
										data: [poolRanksTotal.tier1, poolRanksTotal.tier2, poolRanksTotal.tier3]
									},
								]}
								type="bar"
								height={280}
							/>
						</div>
					</Col>
				</Row>
			</Container>
		</div>
	);
}

export default Dashboard;