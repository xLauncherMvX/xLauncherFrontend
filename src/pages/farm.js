import React, {useEffect, useState, useRef} from "react";
import {Address, AddressValue, U64Value} from "@multiversx/sdk-core/out";
import Button from 'react-bootstrap/Button';
import {contractQuery, getAccountTokens, getAccountNFTS} from "utils/api";
import stakeV2Abi from "abiFiles/xlauncher-staking-v2.abi.json";
import {ProxyNetworkProvider} from "@multiversx/sdk-network-providers/out";
import {allTokens, networkId, customConfig} from "config/customConfig";
import {networkConfig} from "config/networks";
import {multiplier} from "utils/utilities";
import StakingV2Card from "cards/StakingV2Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {useGetPendingTransactions} from "@multiversx/sdk-dapp/hooks/transactions";
import {app, database} from "config/firebase";
import {ref, get, set, push} from "firebase/database";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'assets/css/editor.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faRedo, faSave, faClose } from '@fortawesome/free-solid-svg-icons';
import Tooltip from "@mui/material/Tooltip/Tooltip";
import Fade from "@mui/material/Fade/Fade";

const componentsProps={
	tooltip: {
		sx: {
			maxWidth: '200px',
			backgroundColor: 'black',
			color: 'white',
			fontSize: '14px',
			fontWeight: '400',
			textAlign: 'center',
			borderRadius: '10px',
			padding: '10px',
			top: '-10px'
		},
	},
	arrow: {
		sx: {
			color: 'black',
		},
	},
	TransitionComponent: Fade,
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

	//Admin addresses
	const walletAddresses = [
		'erd1xa39h8q20gy25449vw2qt4dm38pp3nnxp7kzga2pt54z4u2rgjlqadlgdl',
		'erd1fegge5067awlw94ksycw0gfk8z2zzz2l3rnesjuytz8ampucsnwq5ns2hn',
		'erd1pl8syl8y75tqakjftujaf432gc7z3rad94h5ejn0huv2dgf9qlnsyu6mqv',
		'erd1pwpvplnj9l9f4ap56v9h92dtynqkwyrh3w80jfvz2f5q95av52qqdv9ydk',
		'erd1znusjpmfpukrtf0wscvf4su8yjqg393c092j8sxxvvrfk9m0rdss0646y0',
		'erd1vf74652wxr59vxhtp4wmlzyzwcd9f907nle9qg5el52y4re5yxnqwtltc9',
		'erd179xw6t04ug48m74jzyw9zq028hv66jhqayelzpzvgds0ptnzmckq2jf07f'
	];

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
			if ((poolOwner.toString() === address.toString()) || walletAddresses.includes(address)) {
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
					if (element.pool_id.toString() === farmId.toString()) {
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
		}, 2000);
		return () => window.clearInterval(interval);
		// eslint-disable-next-line
	}, [isLoggedIn]);

	// Create a state variable for the farm offer
	const [farmOffer, setFarmOffer] = useState("");

	// Reference the "farm" node in the database
	const farmRef = ref(database, "farm");
	const [poolInfo, setPoolInfo] = useState([]);

	// Function to fetch existing farm data for displaying it
	const fetchFarmData = () => {
		get(farmRef)
			.then((snapshot) => {
				const existingFarmData = snapshot.val();
				if(existingFarmData){
					existingFarmData.forEach((item) => {
						if (item.poolId.toString() === farmId.toString()) {
							setPoolInfo(item);
						}
					});
				}
			})
			.catch((error) => {
				console.log("Error retrieving existing farm data:", error);
			});
	};

	// Function to handle the save farm offer to database
	const saveFarmOffer = () => {
		const newFarm = {poolId: farmId, name: farmOffer};

		// Fetch the existing items from the "farm" node
		get(farmRef)
			.then((snapshot) => {
				const existingFarmData = snapshot.val();

				if (!existingFarmData) {
					// If no existing data, set the new farm object as the first item with ID 1
					set(farmRef, {1: newFarm})
						.then(() => {
							console.log("New farm item added successfully");
						})
						.catch((error) => {
							console.log("Error adding farm item:", error);
						});
					return;
				}

				let nextId = 1;
				const updatedFarmData = {...existingFarmData};

				// Check if an item with the same poolId already exists
				const existingItem = Object.entries(existingFarmData).find(
					([_, item]) => item.poolId === newFarm.poolId
				);

				if (existingItem) {
					// If an item with the same poolId exists, update it
					const [existingItemId, _] = existingItem;
					updatedFarmData[existingItemId] = newFarm;

					// Get the next available ID for new items
					const existingIds = Object.keys(existingFarmData);
					const maxId = Math.max(...existingIds.map((id) => parseInt(id)));
					nextId = maxId + 1;
				} else {
					// If no item with the same poolId exists, add the new farm object
					const existingIds = Object.keys(existingFarmData).map((id) =>
						parseInt(id)
					);
					nextId = Math.max(...existingIds) + 1;
					updatedFarmData[nextId] = newFarm;

					console.log("New farm item added successfully");
				}
				// Set the updated data back to the "farm" node
				set(farmRef, updatedFarmData)
					.then(() => {
						console.log("Farm data updated successfully");
					})
					.catch((error) => {
						console.log("Error updating farm data:", error);
					});
			})
			.catch((error) => {
				console.log("Error retrieving existing farm data:", error);
			});
	};

	//Disable save button if new object size is larger than 300kb
	const [saveDisabled, setSaveDisabled] = useState(false);
	const handleFarmOfferChange = (value) => {
		setFarmOffer(value);
		let stringifyData = JSON.stringify(value);
		let sizeInBytes = new TextEncoder().encode(stringifyData).length;
		let sizeInKb = sizeInBytes / 1024;

		if (sizeInKb > 300) {
			setSaveDisabled(true);
		}
		if (sizeInKb <= 300) {
			setSaveDisabled(false);
		}
	};


	useEffect(() => {
		fetchFarmData();
		const interval = window.setInterval(() => {
			fetchFarmData();
		}, 1000);

		return () => window.clearInterval(interval);
		// eslint-disable-next-line
	}, [isLoggedIn]);

	// Editor options
	const quillRef = useRef(null);
	const handleUndo = () => {
		const quillInstance = quillRef.current.getEditor();
		quillInstance.history.undo();
	};
	const handleRedo = () => {
		const quillInstance = quillRef.current.getEditor();
		quillInstance.history.redo();
	};
	let toolbarOptions = [
		[{'header': [1, 2, 3, 4, 5, 6, false]}],
		['bold', 'italic', 'underline', 'strike'],
		[{'align': []}],
		[{'color': []}, {'background': []}],
		[{'list': 'ordered'}, {'list': 'bullet'}],
		[{'indent': '-1'}, {'indent': '+1'}],
		[{'script': 'sub'}, {'script': 'super'}],
		['link', 'image'],
		['clean']
	];

	// Show / hide editor
	const [showEditor, setShowEditor] = useState(false);
	const changeVisibility = () => {
		setShowEditor(!showEditor);
	};

	return (
		<div>
			<p className="text-white font-bold mt-4 ms-2 mb-4" style={{fontSize: "40px"}}>
				{farmDetails.pool_title ? (farmDetails.pool_title + ' Farm Details') : 'Farm Details'}
			</p>
			{(!showEditor && isOwner) ? (
				<Row>
					<Col xs={6} lg={2}>
						<button className="btn btn-info btn-block" onClick={changeVisibility}>Edit Offer</button>
					</Col>
					<Col xs={6} lg={2}>
						<button className="btn btn-info btn-block">Export Wallets List</button>
					</Col>
				</Row>
				): (' ')
			}
			{showEditor ? (
				<div className="mt-4 mb-2">
					<Row>
						<Col lg={5}>
							<p className="text-white h4">Editor:</p>
							<div className="bg-white p-2" style={{marginTop: '11px'}}>
								<ReactQuill
									ref={quillRef}
									theme="snow"
									value={farmOffer}
									onChange={handleFarmOfferChange}
									placeholder="Enter farm name..."
									modules={{toolbar: toolbarOptions}}
								/>
							</div>
							<div className="mt-2 mb-2" style={{textAlign: 'right'}}>
								<button className="btn btn-light text-black bg-white btn-sm b-r-xs" style={{minWidth: '81px'}}
												onClick={handleUndo}>
									<FontAwesomeIcon icon={faUndo}/> Undo
								</button>
								<button className="btn btn-light text-black bg-white btn-sm b-r-xs ms-1" style={{minWidth: '81px'}}
												onClick={handleRedo}>
									<FontAwesomeIcon icon={faRedo}/> Redo
								</button>
								<Tooltip key="unstake" title="Maximum offer size is 300KB" arrow placement="bottom"
												 componentsProps={componentsProps}>
								<span>
									<button className="btn btn-light text-black bg-white btn-sm b-r-xs ms-1" style={{minWidth: '81px'}}
													onClick={saveFarmOffer} disabled={saveDisabled}>
										<FontAwesomeIcon icon={faSave}/> Submit
									</button>
								</span>
								</Tooltip>
								<button className="btn btn-light text-black bg-white btn-sm b-r-xs ms-1" style={{minWidth: '80px'}}
												onClick={() => setShowEditor(false)}>
									<FontAwesomeIcon icon={faClose}/> Close Editor
								</button>
							</div>
						</Col>
						<Col lg={7}>
							<p className="text-white h4">Live Preview:</p>
							<div className="farming-card-v2 text-white">
								{farmOffer ? (
									<div dangerouslySetInnerHTML={{__html: farmOffer}}/>
								) : (
									''
								)}
							</div>
						</Col>
					</Row>
				</div>) : ('')
			}
			{!showEditor ? (
				<Row className="mt-2">
					<Col xs={12} lg={5}>
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
					<Col lg={7}>
						<div className="farming-card-v2 text-white" style={{minHeight: '309px'}}>
							{poolInfo.name ? (
								<div dangerouslySetInnerHTML={{__html: poolInfo.name}}/>
							) : (
								<p className="h3 text-center">Farm Offer</p>
							)}
						</div>
					</Col>
				</Row>
				) : ('')
			}
		</div>
	)
}
