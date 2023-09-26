import React, {useEffect, useState} from "react";
import "assets/css/globals.css";
import Image from "react-bootstrap/Image";
import picture from "assets/images/og_vault_booster.jpg";
import Container from "@mui/material/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Input from "@mui/material/Input";
import Button from "react-bootstrap/Button";
import {Card} from "react-bootstrap";
import CustomCountdown from "components/countdown";
import CustomProgressBar from "components/progress_bar";
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';


import {contractQuery} from "utils/api";
import {customConfig, networkId, allTokens} from "config/customConfig";
import {networkConfig} from "config/networks";
import abiFile from "abiFiles/vault-booster-sale.abi.json";
import {ProxyNetworkProvider} from "@multiversx/sdk-network-providers/out";
import {multiplier} from "utils/utilities";
import {useGetAccountInfo} from "@multiversx/sdk-dapp/hooks";
import Box from "@mui/material/Box";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faMinus, faXmark, faCheck} from "@fortawesome/free-solid-svg-icons";
import {
	AbiRegistry,
	Address, AddressValue,
	SmartContract, TokenTransfer,
	U32Value
} from "@multiversx/sdk-core/out";
import {refreshAccount} from "@multiversx/sdk-dapp/utils/account";
import {sendTransactions} from "@multiversx/sdk-dapp/services";

function VaultBooster() {
	//Set the config network
	const config = customConfig[networkId];
	const tokens = allTokens[networkId];
	const {address} = useGetAccountInfo();

	const isLoggedIn = address.startsWith("erd");
	const networkProvider = new ProxyNetworkProvider(config.provider);
	const scAddress = "sds232dsfdsfs";
	const scToken = "OURO-9ecd6a";
	const scName = "VaultBoosterSaleContract";
	const chainID = networkConfig[networkId].shortId;
	const tokensAPI = config.apiLink + address + "/tokens?size=2000";

	// Get general config
	const [roundInfo, setRoundInfo] = useState({
		round_number: 0,
		start_timestamp: 0,
		end_timestamp: 0,
		discounted_price: 0
	});
	const getRoundInfo = async () => {
		const newRoundData = await contractQuery(
			networkProvider,
			abiFile,
			scAddress,
			scName,
			"getCurrentRoundInfo",
			[]
		);
		if(newRoundData){
			setRoundInfo({
				round_number: newRoundData[0],
				start_timestamp: newRoundData[1],
				end_timestamp: newRoundData[2],
				discounted_price: newRoundData[3] / multiplier
			});
		}
	};

	// Get whitelist info
	const [isWhitelisted, setIsWhitelisted] = useState(false);
	const getIsWhitelisted = async () => {
		const whitelistData = await contractQuery(
			networkProvider,
			abiFile,
			scAddress,
			scName,
			"getIsWhitelisted",
			[new AddressValue(new Address(address))]
		);
		if(whitelistData){
			setIsWhitelisted(whitelistData);
		}
	};

	let whitelistElement =
		<p className="mt-2">Address whitelisted:
			<FontAwesomeIcon className="ms-1" size="xl" icon={faXmark} style={{color: "red"}}/>
		</p>
	;
	if (isWhitelisted){
		whitelistElement =
			<p className="mt-2">Address whitelisted:
				<FontAwesomeIcon className="ms-1" size="lg" icon={faCheck} style={{color: "green"}}/>
			</p>
		;
	}

	const mintStartTimestamp = 695834000000;
	const currentTimestamp = new Date().getTime();

	let mintIsOpen = false;
	if (mintStartTimestamp - currentTimestamp <= 0) {
		mintIsOpen = true;
	}
	const totalCount = 1000;
	const leftCount = 5;

	const price = 5;
	const [mintCount, setMintCount] = useState(1);
	const [mintPrice, setMintPrice] = useState(price);

	//+/- buttons
	const increaseAmount = (amount) => {
		if (!mintIsOpen) {
			toast.error(
				"Mint not started",
				{
					position: 'top-right',
					duration: 1500,
					style: {
						border: '1px solid red'
					}
				}
			);
			return;
		}
		if (mintCount >= leftCount) {
			toast.error(
				"Not enough NFTs left",
				{
					position: 'top-right',
					duration: 1500,
					style: {
						border: '1px solid red'
					}
				}
			);
			return;
		}

		let newValue = mintCount + amount;
		setMintCount(newValue);
		setMintPrice(price * newValue);
	};

	const decreaseAmount = (amount) => {
		let newValue = mintCount - amount;

		if (!mintIsOpen) {
			toast.error(
				"Mint not started",
				{
					position: 'top-right',
					duration: 1500,
					style: {
						border: '1px solid red'
					}
				}
			);
			return;
		}
		if (newValue <= 0) {
			toast.error(
				"You can't mint less than 1 NFT",
				{
					position: 'top-right',
					duration: 1500,
					style: {
						border: '1px solid red'
					}
				}
			);
			return;
		}

		if (newValue > 0) {
			setMintCount(newValue);
			setMintPrice(price * newValue);
		}
	};

	//Mint Function
	const mintFunction = async (quantity) => {
		if (!isWhitelisted) {
			toast.error(
				"Your Address is not whitelisted",
				{
					position: 'top-right',
					duration: 1500,
					style: {
						border: '1px solid red'
					}
				}
			);
			return;
		}
		if (mintCount >= leftCount) {
			toast.error(
				"Not enough NFTs left",
				{
					position: 'top-right',
					duration: 1500,
					style: {
						border: '1px solid red'
					}
				}
			);
			return
		}

		try {
			let abiRegistry = AbiRegistry.create(abiFile);
			let contract = new SmartContract({
				address: new Address(scAddress),
				abi: abiRegistry
			});

			const transaction = contract.methodsExplicit
				.buy([new U32Value(quantity)])
				.withChainID(chainID)
				.withSingleESDTTransfer(
					TokenTransfer.fungibleFromAmount(scToken, quantity * multiplier, 18)
				)
				.buildTransaction();

			const mintTransaction = {
				value: 0,
				data: Buffer.from(transaction.getData().valueOf()),
				receiver: scAddress,
				gasLimit: '15000000'
			};
			await refreshAccount();

			const { sessionId } = await sendTransactions({
				transactions: mintTransaction,
				transactionsDisplayInfo: {
					processingMessage: 'Processing Mint transaction',
					errorMessage: 'An error has occurred during Mint transaction',
					successMessage: 'Mint transaction successful'
				},
				redirectAfterSign: false
			});

		} catch (error) {
			console.error(error);
		}
	};

	//Ouro Balance
	const [ouroBalance, setOuroBalance] = useState(0);
	const getWalletData = async () => {
		try {
			const response = await fetch(tokensAPI, {
				headers: {
					Accept: "application/json",
				},
			});
			const json = await response.json();
			if (json) {
				json.forEach((item) => {
					if (item.identifier === scToken) {
						setOuroBalance(item.balance / multiplier);
					}
				});
			}
		} catch (e) {
			console.error(e);
		}
	};

	// Buy element
	const buyButton = () => {
		if (!isWhitelisted) {
			return (
				<Button
					className="btn btn-block btn-sm btn-info mt-3"
					style={{minWidth: "90px"}}
					onClick={() => {
						toast.error(
							"Your Address is not whitelisted",
							{
								position: 'top-right',
								duration: 1500,
								style: {
									border: '1px solid red'
								}
							}
						);
					}}
				>
					Your Address is not whitelisted
				</Button>
			);
		}
		if (!mintIsOpen) {
			return (
				<Button
					className="btn btn-block btn-sm btn-info mt-3"
					style={{minWidth: "90px"}}
					onClick={() => {
						toast.error(
							"Mint not started",
							{
								position: 'top-right',
								duration: 1500,
								style: {
									border: '1px solid red'
								}
							}
						);
					}}
				>
					Mint not started
				</Button>
			);
		}
		if (mintPrice > ouroBalance) {
			return (
				<Button
					className="btn btn-block btn-sm btn-info mt-3"
					style={{minWidth: "90px"}}
					onClick={() => {
						toast.error(
							"Insufficient OURO",
							{
								position: 'top-right',
								duration: 1500,
								style: {
									border: '1px solid red'
								}
							}
						);
					}}
				>
					Insufficient OURO
				</Button>
			);
		} else {
			return (
				<Button
					className="btn btn-block btn-sm btn-info mt-3"
					style={{minWidth: "90px"}}
					onClick={() => mintFunction(mintCount)}
				>
					Mint NFT
				</Button>
			);
		}
	};

	//disable buttons
	let disabledButtons = false;

	useEffect(() => {
		getRoundInfo();
		if (isLoggedIn) {
			getWalletData();
			getIsWhitelisted();
		}
		const interval = window.setInterval(() => {
			if (isLoggedIn) {
				getWalletData();
				getIsWhitelisted();
			}
		}, 5000);
		return () => window.clearInterval(interval);
		// eslint-disable-next-line
	}, [isLoggedIn]);

	return (
		<div>
			<Container>
				<Row>
					<Col xs={12} lg={12} className="text-center">
						<CustomCountdown startTitle="Mint starts in" completedTitle="Mint Started" startTimestamp={mintStartTimestamp}/>
					</Col>
				</Row>
				<Row>
					<Col xs={12} lg={{offset: 3, span: 6}} className="text-center">
						{mintIsOpen && <CustomProgressBar totalCount={totalCount} leftCount={leftCount} activeColor="#32CD32"/>}
					</Col>
				</Row>
				<Row>
					<Col xs={12} lg={{offset: 4, span: 4}} className="text-center">
						<div className="farm-card text-white mt-4">
							<Row>
								<Col xs={12}>
									<p className="h3 text-white mb-1 mt-2">OG VAULT BOOSTER</p>
									<Card.Img
										variant="top"
										src={picture}
										style={{borderRadius: "15px", height: "300px", width: "300px"}}
										className="mt-2"
									/>
									{isLoggedIn && whitelistElement}
								</Col>
								<Col xs={12}>
									<div className="light-divider" style={{width: "100%", marginLeft: 0}}>
										{" "}
									</div>
									<Box display="flex" justifyContent="center" alignItems="center">
										<p className="h3 text-white mb-1 mt-2">
											<span className="text-green-A200">{mintCount}</span> NFT{mintCount === 1 ? "" : "s"}
										</p>
									</Box>
								</Col>
								<Col xs={12}>
									<div
										className="light-divider"
										style={{width: "100%", marginLeft: 0}}
									>
										{" "}
									</div>
									<Box
										display="flex"
										justifyContent="center"
										alignItems="center"
									>
										<p className="h4 text-white"><span className="text-green-A200">{mintPrice}</span> OURO</p>
									</Box>
								</Col>
							</Row>
							<Row>
								<Col xs={{offset: 1, span: 10}}>
									<Box mb={3}>
										<div
											className="light-divider"
											style={{width: "100%", marginLeft: 0}}
										>
											{" "}
										</div>
									</Box>
									<Col xs={12}>
										<Button
											variant="success"
											className="btn btn-sm btn-block"
											disabled={!isLoggedIn}
											onClick={() => increaseAmount(1)}
										>
											<FontAwesomeIcon fontSize={"medium"} icon={faAdd} color="white"/>
											<span className="ms-2">Buy more</span>
										</Button>
									</Col>
									<Col xs={12}>
										<Button
											variant="danger"
											className="btn btn-sm btn-block mt-1"
											disabled={!isLoggedIn}
											onClick={() => decreaseAmount(1)}
										>
											<FontAwesomeIcon
												fontSize={"medium"}
												icon={faMinus}
												color="white"
												style={{marginLeft: "-9px"}}
											/>
											<span className="ms-2">Buy less</span>
										</Button>
									</Col>
								</Col>
							</Row>
							<Row>
								<Col xs={12} mt={1}>
									<Box mt={2} mb={2}>
										<div
											className="light-divider"
											style={{ width: "100%", marginLeft: 0 }}
										>
											{" "}
										</div>
									</Box>
								</Col>
								{!isLoggedIn &&
									<Col xs={12}>
										<Button
											className="btn btn-block btn-sm btn-info mt-3"
											style={{ minWidth: "90px" }}
											disabled={true}
										>
											You are not logged in
										</Button>
									</Col>
								}
								{isLoggedIn && <Col xs={12}>{buyButton()}</Col>}
							</Row>
						</div>
					</Col>

				</Row>
				<Toaster/>
			</Container>
		</div>
	);
}

export default VaultBooster;