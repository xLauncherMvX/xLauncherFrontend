import React, {useCallback, useEffect, useState, useRef} from "react";
import "assets/css/globals.css";
import "assets/css/mint.css";
import picture from "assets/images/bloodshed_mint.jpg";
import Container from "@mui/material/Container";
import TextField from '@mui/material/TextField';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import {Card} from "react-bootstrap";
import CustomCountdown from "components/countdown";
import CustomProgressBar from "components/progress_bar";
import toast, {Toaster} from 'react-hot-toast';
import BigNumber from 'bignumber.js';
import {useGetPendingTransactions} from "@multiversx/sdk-dapp/hooks/transactions";
import {intlNumberFormat, multiplier, openInNewTab} from "utils/utilities";

import {contractQueryMultipleValues, contractQuery} from "utils/api";
import {customConfig, networkId} from "config/customConfig";
import {networkConfig} from "config/networks";
import abiFile from "abiFiles/bloodshed_mint.abi.json";
import {ProxyNetworkProvider} from "@multiversx/sdk-network-providers/out";
import {useGetAccountInfo, useGetActiveTransactionsStatus} from "@multiversx/sdk-dapp/hooks";
import Box from "@mui/material/Box";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faMinus} from "@fortawesome/free-solid-svg-icons";
import {
	AbiRegistry,
	Address,
	AddressValue,
	SmartContract,
	TokenTransfer,
	U32Value,
	U64Value
} from "@multiversx/sdk-core/out";
import {refreshAccount} from "@multiversx/sdk-dapp/utils/account";
import {sendTransactions} from "@multiversx/sdk-dapp/services";
import { decodeBase64 } from '@multiversx/sdk-dapp/utils';
import {hexToNumber} from "utils/utilities";
import Modal from "react-bootstrap/Modal";
import {UpdateMintPrice} from "../../components/UpdateBloodshedPrice";


function BloodshedMint() {
	//Set the config network
	const config = customConfig[networkId];
	const {address} = useGetAccountInfo();

	const isLoggedIn = address.startsWith("erd");
	const networkProvider = new ProxyNetworkProvider(config.provider);
	const scAddress = "erd1qqqqqqqqqqqqqpgqcc2dakhdz23hk8gvlnn054uhzzeewn5xwmfsyqdssd";
	const scName = "SellNftsContract";
	const chainID = networkConfig[networkId].shortId;
	const tokensAPI = config.apiLink + address + "/tokens?size=2000";
	const nftAPI = config.apiLink + address + "/nfts?size=2000";
	const [mintCount, setMintCount] = useState(0);
	const [mintPrice, setMintPrice] = useState(0);
	const totalCount = 6000;
	const startTimestamp = 1700071200000;

	//get loading transactions
	const loadingTransactions = useGetPendingTransactions().hasPendingTransactions;

	//Balance
	const [ouroBalance, setOuroBalance] = useState(0);
	const [vstBalance, setVSTBalance] = useState(0);
	const [ticketsBalance, setTicketsBalance] = useState(0);
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
					if (item.identifier === "OURO-9ecd6a") {
						setOuroBalance(item.balance / multiplier);
					}
					if (item.identifier === "VST-c40502") {
						setVSTBalance(item.balance / multiplier);
					}
				});
			}
		} catch (e) {
			console.error(e);
		}

		try {
			const response = await fetch(nftAPI, {
				headers: {
					Accept: "application/json",
				},
			});
			const json = await response.json();
			if (json) {
				json.forEach((item) => {
					if (item.identifier === "DHLOTTERY-f6fc85-02") {
						setTicketsBalance(item.balance);
					}
				});
			}
		} catch (e) {
			console.error(e);
		}
	};

	// Get payment Data + premium attempts
	const [ouroData, setOuroData] = useState({identifier: '', nonce: 0, amount: 0});
	const [vstData, setVSTData] = useState({identifier: '', nonce: 0, amount: 0});
	const [ticketsData, setTicketsData] = useState({identifier: '', nonce: 0, amount: 0});
	const [premiumMints, setPremiumMints] = useState(0);
	const [requiredMints, setRequiredMints] = useState(0);
	const getMintInfo = async () => {
		const tokenPayment1 = await contractQuery(
			networkProvider,
			abiFile,
			scAddress,
			scName,
			"getFirstTokenPayment",
			[]
		);
		if(tokenPayment1){
			setOuroData({
				identifier: tokenPayment1.token_identifier,
				nonce: tokenPayment1.token_nonce,
				amount: tokenPayment1.amount / multiplier
			})
		}

		const tokenPayment2 = await contractQuery(
			networkProvider,
			abiFile,
			scAddress,
			scName,
			"getSecondTokenPayment",
			[]
		);
		if(tokenPayment2){
			setTicketsData({
				identifier: tokenPayment2.token_identifier,
				nonce: tokenPayment2.token_nonce,
				amount: tokenPayment2.amount
			})
		}

		const tokenPayment3 = await contractQuery(
			networkProvider,
			abiFile,
			scAddress,
			scName,
			"getThirdTokenPayment",
			[]
		);
		if(tokenPayment3){
			setVSTData({
				identifier: tokenPayment3.token_identifier,
				nonce: tokenPayment3.token_nonce,
				amount: tokenPayment3.amount / multiplier
			})
		}

		const premiumMintData = await contractQuery(
			networkProvider,
			abiFile,
			scAddress,
			scName,
			"getUserPremiumMints",
			[new AddressValue(new Address(address))]
		);
		if(premiumMintData){
			setPremiumMints(premiumMintData);
		}

		const normalMintData = await contractQuery(
			networkProvider,
			abiFile,
			scAddress,
			scName,
			"getUserMints",
			[new AddressValue(new Address(address))]
		);
		if(normalMintData){
			setRequiredMints(4 - parseInt(normalMintData));
		}
	};

	// set token based on the selected payment type
	const [scToken, setSCToken] = useState({identifier: '', nonce: 0, amount: 0});
	const [type, setType] = useState(0);
	function changeType(event) {
		const selectedType = event.target.value;
		switch (selectedType) {
			case "1":
				setSCToken(ouroData);
				setType(1);
				setMintCount(0);
				break;
			case "2":
				setSCToken(ticketsData);
				setType(2);
				setMintCount(0);
				break;
			case "3":
				setSCToken(vstData);
				setType(3);
				setMintCount(0);
				break;
			default:
				setSCToken(ouroData);
				setType(0);
				setMintCount(0);
		}
	}

	//get Left count
	const [leftCount, setLeftCount] = useState(0);
	const getLeftData = async () => {
		try {
			const response = await fetch(
				"https://mvx-api.estar.games/accounts/erd1qqqqqqqqqqqqqpgqcc2dakhdz23hk8gvlnn054uhzzeewn5xwmfsyqdssd/nfts/count?collection=BLOODSHED-a62781", {
				headers: {
					Accept: "application/json",
				},
			});
			const json = await response.json();
			if (json) {
				setLeftCount(parseInt(json));
			}
		} catch (e) {
			console.error(e);
		}
	};

	const currentTimestamp = new Date().getTime();
	let mintIsOpen = false;
	if (startTimestamp - currentTimestamp <= 0) {
		mintIsOpen = true;
	}

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
				"Not enough NFTS left",
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
		let auxPrice = scToken.amount * newValue;
		auxPrice = parseFloat(auxPrice.toFixed(4));
		setMintPrice(auxPrice);
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
				"You cannot mint less than 1 NFT",
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
			let auxPrice = scToken.amount * newValue;
			auxPrice = parseFloat(auxPrice.toFixed(4));
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
		let auxPrice = scToken.amount * newValue;
		auxPrice = parseFloat(auxPrice.toFixed(4));
		setMintPrice(auxPrice);
	};

	let disabledButtons = true;
	if(isLoggedIn && (leftCount > 0) && !loadingTransactions && type !== 0){
		disabledButtons = false;
	}

	//gasLimit
	let gasLimit = 25000000 + (2300000 * mintCount);

	//Mint Function
	const mintFunction = async (quantity, price) => {
		if (type === 3 && (mintCount > premiumMints)) {
			toast.error(
				"Not Enough VST Mint Available",
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
		if (mintCount === 0 || !mintCount) {
			toast.error(
				"You cannot mint 0 NFTS",
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
		if (mintCount >= leftCount) {
			toast.error(
				"Not enough NFTS left",
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
				.mint([new U64Value(quantity)])
				.withChainID(chainID)
				.withSingleESDTTransfer(
					TokenTransfer.fungibleFromAmount(scToken.identifier, price, 18)
				)
				.buildTransaction();

			const mintTransaction = {
				value: 0,
				data: Buffer.from(transaction.getData().valueOf()),
				receiver: scAddress,
				gasLimit: gasLimit
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

	const mintFunctionWithSFT = async (quantity, price) => {
		if (mintCount === 0 || !mintCount) {
			toast.error(
				"You cannot mint 0 NFTS",
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
		if (mintCount >= leftCount) {
			toast.error(
				"Not enough NFTS left",
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
				.mint([new U64Value(quantity)])
				.withChainID(chainID)
				.withSingleESDTNFTTransfer(
					TokenTransfer.semiFungible(scToken.identifier, scToken.nonce, price)
				)
				.withSender(new Address(address))
				.buildTransaction();

			const mintTransaction = {
				value: 0,
				data: Buffer.from(transaction.getData().valueOf()),
				receiver: address,
				gasLimit: gasLimit
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

	// Buy element
	const buyButton = () => {
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

		if ((type === 1 && mintPrice > ouroBalance) || (type === 2 && mintPrice > ticketsBalance) || (type === 3 && mintPrice > vstBalance)) {
			return (
				<Button
					className="btn btn-block btn-sm btn-info mt-3"
					style={{minWidth: "90px"}}
					onClick={() => {
						toast.error(
							`Insufficient ${type === 1 ? 'OURO' : type === 3 ? 'VST' : 'TICKETS'}`,
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
					Insufficient {type === 1 ? 'OURO' : type === 3 ? 'VST' : 'TICKETS'}
				</Button>
			);
		} else {
			if(type === 2){
				return (
					<Button
						className="btn btn-block btn-sm btn-info mt-3"
						style={{minWidth: "90px"}}
						onClick={() => mintFunctionWithSFT(mintCount, mintPrice)}
						disabled={disabledButtons}
					>
						Mint NFTS
					</Button>
				);
			}else{
				return (
					<Button
						className="btn btn-block btn-sm btn-info mt-3"
						style={{minWidth: "90px"}}
						onClick={() => mintFunction(mintCount, mintPrice)}
						disabled={disabledButtons}
					>
						Mint NFTS
					</Button>
				);
			}
		}
	};

	//Details modal
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);

	useEffect(() => {
		getMintInfo();
		const interval = window.setInterval(() => {
			getMintInfo();
		}, 2000);
		return () => window.clearInterval(interval);
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		getLeftData();
		const interval = window.setInterval(() => {
			getLeftData();
		}, 1000);
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
						<CustomCountdown startTitle={`Mint starts in`} titleStyles="h2" startTimestamp={startTimestamp}
														 completedTitle={"Mint started"}/>
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
									<p className="h4 text-white mb-1 mt-2">BLOODSHED MINT</p>
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
											<span className="text-green-A200">{mintCount}</span> NFT{mintCount == 1 ? "" : "S"}
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
									<div className="d-flex justify-content-center align-items-center">
										{type === 1 &&
											<p className="text-green-A200 h4">{new BigNumber(mintCount).multipliedBy(scToken.amount).toFixed(4)}</p>
										}
										{type === 3 &&
										<p className="text-green-A200 h4">{new BigNumber(mintCount).multipliedBy(scToken.amount).toFixed(4)}</p>
										}
										{type === 2 &&
										<p className="text-green-A200 h4">{new BigNumber(mintCount).multipliedBy(scToken.amount).toFixed(0)}</p>
										}
										<select
											className="form-select ms-2 text-white"
											value={type}
											onChange={changeType}
											style={{
												width: 'auto',
												marginTop: '-10px',
												backgroundColor: 'transparent',
												borderColor: '#808080'
											}}
										>
											<option value={0} style={{backgroundColor: '#060b28f0'}}>Payment</option>
											<option value={1} style={{backgroundColor: '#060b28f0'}}>OURO</option>
											<option value={3} style={{backgroundColor: '#060b28f0'}}>VST</option>
											<option value={2} style={{backgroundColor: '#060b28f0'}}>Tickets</option>
										</select>
									</div>
								</Col>
							</Row>
							<Row>
								<Col xs={{offset: 1, span: 10}}>
									<Row>
										<Box>
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
													className: 'text-center text-white mb-1 b-r-md',
													style: {
														border: '0.5px solid rgb(74, 85, 104)',
														width: '100%',
														textAlign: 'center',
														height: '2.2em'
													},
													inputProps: {
														style: {textAlign: "center"},
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
												<span className="ms-2">Mint more</span>
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
												<span className="ms-2">Mint less</span>
											</Button>
										</Col>
									</Row>
									<Row>
										<Col xs={12}>
											<div
												className="light-divider"
												style={{width: "100%", marginLeft: 0}}
											>
												{" "}
											</div>
											<Box justifyContent="center" alignItems="center">
												{type === 1 &&
														<p className="h5 text-white mb-2">
															Balance:
															<span className="text-green-A200 ms-1 me-1">{intlNumberFormat(ouroBalance, "en-GB", 2, 2)}</span>
															OURO
														</p>
												}
												{type === 2 &&
													<p className="h5 text-white mb-2">
														Balance:
														<span className="text-green-A200 ms-1 me-1">{intlNumberFormat(ticketsBalance, "en-GB", 0, 0)}</span>
														Tickets
													</p>
												}
												{type === 3 &&
													<>
														<p className="h5 text-white mb-2" onClick={() => setShow(true)}>Available Mints: {premiumMints.toString()} <span style={{ cursor: 'pointer' }}>(Info)</span></p>
														<p className="h5 text-white mb-2">
															Balance:
															<span className="text-green-A200 ms-1 me-1">{intlNumberFormat(vstBalance, "en-GB", 2, 2)}</span>
															VST
														</p>
													</>
												}
											</Box>
											<Button
												variant="outline-light"
												size="sm"
												disabled={!isLoggedIn}
												className="btn-block"
												onClick={() => openInNewTab("https://app.jexchange.io/")}
											>
												<span className="ms-2">Buy {type === 1 ? 'OURO' : type === 3 ? 'VST' : 'OURO'}</span>
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
											style={{width: "100%", marginLeft: 0}}
										>
											{" "}
										</div>
									</Box>
								</Col>
								{!isLoggedIn &&
								<Col xs={12}>
									<Button
										className="btn btn-block btn-sm btn-info mt-3"
										style={{minWidth: "90px"}}
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
				<UpdateMintPrice />

				{/*Details modal*/}
				<Modal show={show} onHide={handleClose} centered size="sm">
					<Modal.Body>
						<Row>
							<Col xs={12}>
								<Button
									size="sm"
									variant="danger"
									className="float-end b-r-sm"
									onClick={handleClose}
									style={{zIndex: 999}}
								>
									<FontAwesomeIcon icon="fa-xmark" size="sm" />
								</Button>
								<p className="h5 text-center mb-2 text-capitalize">VST Mint Details</p>
							</Col>
						</Row>
						<Row>
							<Col xs={12} className="mt-3">
								<p>You need {requiredMints} more OURO mints to unlock one VST mint</p>
							</Col>
						</Row>
					</Modal.Body>
				</Modal>
			</Container>
			<Toaster/>
		</div>
	);
}

export default BloodshedMint;