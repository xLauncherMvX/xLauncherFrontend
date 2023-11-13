import React, {useCallback, useEffect, useState, useRef} from "react";
import "assets/css/globals.css";
import "assets/css/mint.css";
import picture from "assets/images/midas_chain.jpg";
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

import {contractQueryMultipleValues} from "utils/api";
import {customConfig, networkId} from "config/customConfig";
import {networkConfig} from "config/networks";
import abiFile from "abiFiles/midas-chain-sft-sale.abi.json";
import slotteryAbiFile from "abiFiles/slottery.abi.json";
import {ProxyNetworkProvider} from "@multiversx/sdk-network-providers/out";
import {useGetAccountInfo, useGetActiveTransactionsStatus} from "@multiversx/sdk-dapp/hooks";
import Box from "@mui/material/Box";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAdd, faMinus} from "@fortawesome/free-solid-svg-icons";
import {AbiRegistry, Address, SmartContract, TokenTransfer, U32Value} from "@multiversx/sdk-core/out";
import {refreshAccount} from "@multiversx/sdk-dapp/utils/account";
import {sendTransactions} from "@multiversx/sdk-dapp/services";
import { decodeBase64 } from '@multiversx/sdk-dapp/utils';
import {hexToNumber} from "utils/utilities";
import Modal from "react-bootstrap/Modal";

import Prize1 from 'assets/images/midasLottery/1.png';
import Prize2 from 'assets/images/midasLottery/2.png';
import Prize3 from 'assets/images/midasLottery/3.png';
import Prize4 from 'assets/images/midasLottery/4.png';
import Prize5 from 'assets/images/midasLottery/5.png';
import Prize6 from 'assets/images/midasLottery/6.png';
import Prize7 from 'assets/images/midasLottery/7.png';
import Prize8 from 'assets/images/midasLottery/8.png';
import Prize9 from 'assets/images/midasLottery/9.png';
import Prize10 from 'assets/images/midasLottery/10.png';
import Prize11 from 'assets/images/midasLottery/11.png';
import Prize12 from 'assets/images/midasLottery/12.png';
import Prize13 from 'assets/images/midasLottery/13-21.png';
import Prize22 from 'assets/images/midasLottery/22.png';
import Prize23 from 'assets/images/midasLottery/23.png';
import Prize24 from 'assets/images/midasLottery/24.png';



function MidasChain() {
	//Set the config network
	const config = customConfig[networkId];
	const {address} = useGetAccountInfo();

	const isLoggedIn = address.startsWith("erd");
	const networkProvider = new ProxyNetworkProvider(config.provider);
	const scAddress = "erd1qqqqqqqqqqqqqpgqkgew8kr7nyr2l03d40dwpwzm2udcyq2vyl5sm2k5sp";
	const scToken = "OURO-9ecd6a";
	//const scAddress = "erd1qqqqqqqqqqqqqpgqvrl9a2ngfv56h60cpw2460ymms7yprla6ppslhp9jm";
	//const scToken = "OURO-9b4e16";
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
		auxPrice = parseFloat(auxPrice.toFixed(3));
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
				"You cannot mint less than 1 ticket",
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
			auxPrice = parseFloat(auxPrice.toFixed(3));
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
		auxPrice = parseFloat(auxPrice.toFixed(3));
		setMintPrice(auxPrice);
	};

	let disabledButtons = true;
	if(isLoggedIn && (saleInfo.remaining > 0) && !loadingTransactions){
		disabledButtons = false;
	}

	let gasLimit = 25000000 + (2300000 * mintCount);

	//Mint Function
	const mintFunction = async (quantity, price) => {
		if (mintCount == 0 || !mintCount) {
			toast.error(
				"You cannot mint 0 tickets",
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
				gasLimit: gasLimit
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

	//claim phase section
	const slotteryAddress = config.slotteryAddress;
	const slotteryName = "Slottery";
	const slotterySFT = config.slotterySFT;
	const slotteryNonce = config.slotteryNonce;
	const { success } = useGetActiveTransactionsStatus();
	const claimStartTimestamp = 1697824800;
	const currentDateTimestamp = Math.floor(currentTimestamp / 1000);
	const storedTimestamp = localStorage.getItem('localTimestamp') ? parseInt(localStorage.getItem('localTimestamp')) : 0;
	const transactionAPI = config.apiAddress + "/transactions?size=1&sender=" +address + "&receiver=" + address + "&function=claimLottery&after=" + storedTimestamp + "&withScResults=true";
	const [prize, setPrize] = useState(null);
	const nftsAPI = config.apiLink + address + "/nfts?size=1000";
	const [winningAttempts, setWinningAttempts] = useState(0);

	const [isClaimStarted, setIsClaimStarted] = useState(false);
	const getClaimStatus = () => {
		if (currentDateTimestamp >= claimStartTimestamp) {
			setIsClaimStarted(true);
		} else {
			setIsClaimStarted(false);
		}
	};
	useEffect(() => {
		getClaimStatus();
		const interval = window.setInterval(() => {
			getClaimStatus();
		}, 1000);
		return () => window.clearInterval(interval);
	}, [currentDateTimestamp]);

	//Used for modal
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);

	const getWinningNFTs = async () => {
		try {
			const response = await fetch(nftsAPI, {
				headers: {
					Accept: "application/json",
				},
			});
			const json = await response.json();
			if (json) {
				json.forEach(item => {
					if(item.identifier === "DHLOTTERY-f6fc85-01"){
						setWinningAttempts(item.balance);
					}
				})
			}
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() =>
	{
		if (isLoggedIn) {
			getWinningNFTs();
		}
		const interval = window.setInterval(() => {
			if (isLoggedIn) {
				getWinningNFTs();
			}
		}, 4000);
		return () => window.clearInterval(interval);
		// eslint-disable-next-line
	}, []);

	//claim function
	const claimRewards = async () => {
		if (winningAttempts === 0) {
			toast.error(
				"No attempts left",
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
		localStorage.setItem('localTimestamp', currentDateTimestamp.toString());
		try {
			let abiRegistry = AbiRegistry.create(slotteryAbiFile);
			let contract = new SmartContract({
				address: new Address(slotteryAddress),
				abi: abiRegistry
			});

			const transaction = contract.methodsExplicit
				.claimLottery()
				.withChainID(chainID)
				.withSingleESDTNFTTransfer(
					TokenTransfer.semiFungible(slotterySFT, slotteryNonce, 1)
				)
				.withSender(new Address(address))

				.buildTransaction();
			const claimPrizeTransaction = {
				value: 0,
				data: Buffer.from(transaction.getData().valueOf()),
				receiver: address,
				gasLimit: '15000000'
			};
			await refreshAccount();

			const { sessionId } = await sendTransactions({
				transactions: claimPrizeTransaction,
				transactionsDisplayInfo: {
					processingMessage: 'Processing Claim Prize transaction',
					errorMessage: 'An error has occurred during Claim Prize transaction',
					successMessage: 'Claim Prize transaction successful'
				},
				redirectAfterSign: false
			});

		} catch (error) {
			console.error(error);
		}
	};

	const getResult = (dataResults) => {
		if (!dataResults || dataResults.length === 0) return;

		const dataResultsFiltered = dataResults.filter((result) => result.data !== undefined);
		const results = dataResultsFiltered.map((result) => decodeBase64(result.data));
		const resultInHex = results.find((res) => res.includes('6f6b'));
		const resultDecoded = resultInHex ? resultInHex.split('@').pop() : undefined;
		return hexToNumber(resultDecoded);
	};

	useEffect(() => {
		if(success) {
			const getTransactionData = async () => {
				try {
					const response = await fetch(transactionAPI);
					return await response.json();
				} catch (error) {
					console.error(error);
				}
			};
			getTransactionData().then(r => {
				if(r && Object.keys(r).length) {
					const prizeSwitcher = getResult(r[0].results);
					switch (prizeSwitcher) {
						case 1: setPrize(Prize1); break;
						case 2: setPrize(Prize2); break;
						case 3: setPrize(Prize3); break;
						case 4: setPrize(Prize4); break;
						case 5: setPrize(Prize5); break;
						case 6: setPrize(Prize6); break;
						case 7: setPrize(Prize7); break;
						case 8: setPrize(Prize8); break;
						case 9: setPrize(Prize9); break;
						case 10: setPrize(Prize10); break;
						case 11: setPrize(Prize11); break;
						case 12: setPrize(Prize12); break;
						case 13: setPrize(Prize13); break;
						case 14: setPrize(Prize13); break;
						case 15: setPrize(Prize13); break;
						case 16: setPrize(Prize13); break;
						case 17: setPrize(Prize13); break;
						case 18: setPrize(Prize13); break;
						case 19: setPrize(Prize13); break;
						case 20: setPrize(Prize13); break;
						case 21: setPrize(Prize13); break;
						case 22: setPrize(Prize22); break;
						case 23: setPrize(Prize23); break;
						case 24: setPrize(Prize24); break;
						default: setPrize(null);
					}
				}
				setShow(true);
			})
		}
	}, [success]);

	return (
		<div>
			{!isClaimStarted ? (
				<Container>
					<Row>
						<Col xs={12} lg={12} className="text-center">
							<CustomCountdown startTitle={`Tickets mint starts in`} titleStyles="h2" startTimestamp={startTimestamp}
															 completedTitle={"Tickets mint started"}/>
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
											<p className="h4 text-white"><span
												className="text-green-A200">{new BigNumber(mintCount).multipliedBy(saleInfo.price).toFixed(4)}</span> OURO
											</p>
										</Box>
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
												<Box display="flex" justifyContent="center" alignItems="center">
													<p className="h5 text-white mb-2">
														Balance: <span
														className="text-green-A200">{intlNumberFormat(ouroBalance, "en-GB", 2, 2)}</span> OURO
													</p>
												</Box>
												<Button
													variant="outline-light"
													size="sm"
													disabled={!isLoggedIn}
													className="btn-block"
													onClick={() => openInNewTab("https://app.jexchange.io/")}
												>
													<span className="ms-2">Buy OURO</span>
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
				</Container>
				) : (
				<div>
					<Container>
						<Row>
							<Col xs={12} lg={{offset: 3, span: 6}} className="text-center mt-5">
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
												<p className="h4 text-white"><span
													className="text-green-A200">{winningAttempts}</span> Attempts Left
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
												<Button
													className="btn btn-block btn-sm btn-info mt-3"
													style={{minWidth: "90px"}}
													onClick={() => claimRewards()}
													disabled={!isLoggedIn}
												>
													Claim Reward
												</Button>
											</Box>
										</Col>
									</Row>
								</div>
							</Col>
						</Row>
					</Container>

					<Modal show={show} onHide={handleClose} centered size="lg">

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
									<p className="h2 text-center mb-2">CONGRATULATIONS</p>
								</Col>
							</Row>
							<Row>
								<Col xs={12}>
									{prize ? (
										<img src={prize} width={'100%'} height={'100%'}/>
									): ('')}
								</Col>
							</Row>
						</Modal.Body>
					</Modal>
				</div>
			)}
			<Toaster/>
		</div>
	);
}

export default MidasChain;