import React, {useEffect, useState} from "react";
import "assets/css/globals.css";
import "assets/css/mint.css";
import picture from "assets/images/midas_chain.jpg";
import Container from "@mui/material/Container";
import Input from "@mui/material/Input";
import TextField from '@mui/material/TextField';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import {Card} from "react-bootstrap";
import CustomCountdown from "components/countdown";
import CustomProgressBar from "components/progress_bar";
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import BigNumber from 'bignumber.js';
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";

import {contractQueryMultipleValues} from "utils/api";
import {customConfig, networkId} from "config/customConfig";
import {networkConfig} from "config/networks";
import abiFile from "abiFiles/midas-chain-sft-sale.abi.json";
import {ProxyNetworkProvider} from "@multiversx/sdk-network-providers/out";
import {multiplier} from "utils/utilities";
import {useGetAccountInfo} from "@multiversx/sdk-dapp/hooks";
import Box from "@mui/material/Box";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faMinus} from "@fortawesome/free-solid-svg-icons";
import {
	AbiRegistry,
	Address,
	SmartContract, TokenTransfer,
	U32Value
} from "@multiversx/sdk-core/out";
import {refreshAccount} from "@multiversx/sdk-dapp/utils/account";
import {sendTransactions} from "@multiversx/sdk-dapp/services";

function MidasChain() {
	//Set the config network
	const config = customConfig[networkId];
	const {address} = useGetAccountInfo();

	const isLoggedIn = address.startsWith("erd");
	const networkProvider = new ProxyNetworkProvider(config.provider);
	const scAddress = "erd1qqqqqqqqqqqqqpgqvrl9a2ngfv56h60cpw2460ymms7yprla6ppslhp9jm";
	//const scToken = "OURO-9ecd6a";
	const scToken = "OURO-9b4e16";
	const scName = "EnforcedPercentualSftSaleContract";
	const chainID = networkConfig[networkId].shortId;
	const tokensAPI = config.apiLink + address + "/tokens?size=2000";

	//get loading transactions
	const loadingTransactions = useGetPendingTransactions().hasPendingTransactions;

	const totalCount = 3100;
	const startTimestamp = 1697133600000;

	// Get general config
	const [saleInfo, setSaleInfo] = useState(0);

	const getSaleInfo = async () => {
		const newSaleData = await contractQueryMultipleValues(
			networkProvider,
			abiFile,
			scAddress,
			scName,
			"getSaleInfo",
			[]
		);

		if(newSaleData && !newSaleData.every(item => item === null)){
			setSaleInfo({
				price: newSaleData[1].value.toNumber() / multiplier,
				remaining: newSaleData[0].value.toNumber(),
			});
		}

		const newPaymentData = await contractQueryMultipleValues(
			networkProvider,
			abiFile,
			scAddress,
			scName,
			"getPaymentDetails",
			[]
		);
	};


	const currentTimestamp = new Date().getTime();
	let mintIsOpen = false;
	if (startTimestamp - currentTimestamp <= 0) {
		mintIsOpen = true;
	}


	const leftCount = saleInfo.remaining;
	const [mintCount, setMintCount] = useState(0);
	const [mintPrice, setMintPrice] = useState(0);

	//+/- buttons
	const increaseAmount = (amount) => {
		if (!mintIsOpen) {
			toast.error(
				"Tickets mint not started",
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
				"Not enough tickets left",
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
		let auxPrice = saleInfo.price * newValue;
		setMintPrice(auxPrice);
	};

	const decreaseAmount = (amount) => {
		let newValue = mintCount - amount;

		if (!mintIsOpen) {
			toast.error(
				"Tickets mint not started",
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
				"You can't buy less than 1 ticket",
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
			let auxPrice = saleInfo.price * newValue;
			setMintPrice(auxPrice);
		}
	};

	// input function
	const handleInputChange = (event) => {
		let newValue = event.target.value;
		if (newValue === '' || !newValue) {
			newValue = 0;
		}
		setMintCount(newValue);
		let auxPrice = saleInfo.price * newValue;
		setMintPrice(auxPrice);
	};

	let disabledButtons = true;
	if(isLoggedIn && (saleInfo.remaining > 0) && !loadingTransactions){
		disabledButtons = false;
	}

	//Mint Function
	const mintFunction = async (quantity, price) => {
		if (mintCount >= leftCount) {
			toast.error(
				"Not enough tickets left",
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
					TokenTransfer.fungibleFromAmount(scToken, price, 18)
				)
				.buildTransaction();

			const mintTransaction = {
				value: 0,
				data: Buffer.from(transaction.getData().valueOf()),
				receiver: scAddress,
				gasLimit: '30000000'
			};
			await refreshAccount();

			const { sessionId } = await sendTransactions({
				transactions: mintTransaction,
				transactionsDisplayInfo: {
					processingMessage: 'Processing Mint Tickets transaction',
					errorMessage: 'An error has occurred during Mint Tickets transaction',
					successMessage: 'Mint Tickets transaction successful'
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
		if (!mintIsOpen) {
			return (
				<Button
					className="btn btn-block btn-sm btn-info mt-3"
					style={{minWidth: "90px"}}
					onClick={() => {
						toast.error(
							"Tickets mint not started",
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
					Tickets Mint not started
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
					onClick={() => mintFunction(mintCount, mintPrice)}
					disabled={disabledButtons}
				>
					Mint Tickets
				</Button>
			);
		}
	};

	useEffect(() => {
		getSaleInfo();
		const interval = window.setInterval(() => {
			getSaleInfo();
		}, 2000);
		return () => window.clearInterval(interval);
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		if (isLoggedIn) {
			getWalletData();
		}
		const interval = window.setInterval(() => {
			if (isLoggedIn) {
				getWalletData();
			}
		}, 4000);
		return () => window.clearInterval(interval);
		// eslint-disable-next-line
	}, []);

	return (
		<div>
			<Container>
				<Row>
					<Col xs={12} lg={12} className="text-center">
						<CustomCountdown startTitle={`Tickets mint starts in`} titleStyles="h2" startTimestamp={startTimestamp} completedTitle={"Tickets mint started"}/>
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
									<p className="h4 text-white mb-1 mt-2">MIDAS CHAIN LOTTERY</p>
									<Card.Img
										variant="top"
										src={picture}
										style={{borderRadius: "15px"}}
										className="mt-2 mint-image2"
									/>
								</Col>
								<Col xs={12}>
									<div className="light-divider" style={{width: "100%", marginLeft: 0}}>
										{" "}
									</div>
									<Box display="flex" justifyContent="center" alignItems="center">
										<p className="h3 text-white mb-1 mt-2">
											<span className="text-green-A200">{mintCount}</span> Ticket{mintCount === 1 ? "" : "s"}
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
										<p className="h4 text-white"><span className="text-green-A200">{new BigNumber(mintCount).multipliedBy(saleInfo.price).toFixed(4)}</span> OURO</p>
									</Box>
								</Col>
							</Row>
							<Row>
								<Col xs={{offset: 1, span: 10}}>
									<Row>
										<Box mb={3}>
											<div
												className="light-divider"
												style={{width: "100%", marginLeft: 0}}
											>
												{" "}
											</div>
										</Box>
										<Col xs={12}>
											<TextField
												value={mintCount}
												variant="outlined"
												size="small"
												onChange={handleInputChange}
												onKeyPress={(event) => {
													if (!/[0-9]/.test(event.key)) {
														event.preventDefault();
													}
												}}
												fullWidth
												sx={{textAlign: 'center'}}
												InputProps={{
													disableUnderline: true,
													className: 'text-center text-white mb-1 b-r-md',
													style: {
														border: '0.5px solid rgb(74, 85, 104)',
														width: '100%',
														textAlign: 'center',
														height: '2.2em'
													},
													inputProps: {
														style: { textAlign: "center" },
													}
												}}

											/>
										</Col>
										<Col xs={12}>
											<Button
												variant="success"
												className="btn btn-sm btn-block"
												disabled={disabledButtons}
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
												disabled={disabledButtons}
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
									</Row>
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

export default MidasChain;