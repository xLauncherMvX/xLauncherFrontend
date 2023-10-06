import React, {useEffect, useState} from "react";
import "assets/css/globals.css";
import "assets/css/mint.css";
import Image from "react-bootstrap/Image";
import picture from "assets/images/xbid_logo.png";
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
import Slider from '@mui/material/Slider';



import {contractQuery, contractQueryMultipleValues} from "utils/api";
import {customConfig, networkId, allTokens} from "config/customConfig";
import {networkConfig} from "config/networks";
import abiFile from "abiFiles/xbid_presale.abi.json";
import {ProxyNetworkProvider} from "@multiversx/sdk-network-providers/out";
import {multiplier, calc3, intlNumberFormat} from "utils/utilities";
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
import {ZERO} from "@multiversx/sdk-dapp/__commonjs/constants";


function XBid() {
	//Set the config network
	const config = customConfig[networkId];
	const { address, account } = useGetAccountInfo();

	const isLoggedIn = address.startsWith("erd");
	const networkProvider = new ProxyNetworkProvider(config.provider);
	const scAddress = config.xBidAddress;
	const scToken = config.xBidToken;
	const scTokenLabel = config.xBidTokenLabel;
	const scName = "XlauncherSimple";
	const chainID = networkConfig[networkId].shortId;
	const scTokensAPI = config.apiLink + scAddress + "/tokens?size=2000";
	const totalCount = 5000000;
	const price = 0.0002;


	//get start timestamp
	const [startTimestamp, setStartTimestamp] = useState(0);
	const getStartTimestamp = async () => {
		const startTimestampData = await contractQuery(
			networkProvider,
			abiFile,
			scAddress,
			scName,
			"getStartTimestamp",
			[]
		);

		if(startTimestampData){
			setStartTimestamp(startTimestampData.toNumber() * 1000);
		}
	};

	// Calculate if the presale is open or closed
	let presaleIsOpen = false;
	const currentTimestamp = new Date().getTime();
	if (startTimestamp - currentTimestamp <= 0) {
		presaleIsOpen = true;
	}

	//getRemainingPurchaseLimit
	const [remainingTokensAmount, setRemainingTokensAmount] = useState(0);
	const getRemainingTokensAmount = async () => {
		try {
			const response = await fetch(scTokensAPI, {
				headers: {
					Accept: "application/json",
				},
			});
			const json = await response.json();
			if (json) {
				json.forEach((item) => {
					if (item.identifier === scToken) {
						setRemainingTokensAmount(item.balance / multiplier);
					}
				});
			}
		} catch (e) {
			console.error(e);
		}
	};

	const [tokensAmount, setTokensCount] = useState(5000);
	const [tokensPrice, setTokensPrice] = useState(1);

	//+/- buttons
	const increaseAmount = (amount) => {
		if (!presaleIsOpen) {
			toast.error(
				"Presale not started",
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
		if (tokensAmount >= remainingTokensAmount) {
			toast.error(
				"Not enough tokens left",
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

		let newValue = tokensAmount + amount;
		setTokensCount(newValue);
		setTokensPrice(price * newValue);
	};

	const decreaseAmount = (amount) => {
		let newValue = tokensAmount - amount;

		if (!presaleIsOpen) {
			toast.error(
				"Presale not started",
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
		if (tokensAmount >= remainingTokensAmount) {
			toast.error(
				"Not enough tokens left",
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
		if (newValue < 1000) {
			toast.error(
				"You can't buy less than 1000 tokens",
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
			setTokensCount(newValue);
			setTokensPrice(price * newValue);
		}
	};
	
	// slider
	const handleSliderChange = (value) => {
		setTokensCount(value);
		setTokensPrice(value * price);
	};

	//Buy Function
	const buyFunction = async (price) => {
		if (tokensAmount >= remainingTokensAmount) {
			toast.error(
				"Not enough tokens left",
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

		const createBuyingTransaction = {
			value: price * multiplier,
			data: [
				"buy",
			].join("@"),
			receiver: scAddress,
			gasLimit: 20_000_000,
		};

		await refreshAccount();

		const { sessionId /*, error*/ } = await sendTransactions({
			transactions: [createBuyingTransaction],
			transactionsDisplayInfo: {
				processingMessage: "Processing Buying transaction",
				errorMessage: "An error has occurred during Buying transaction",
				successMessage: "Buying transaction successful",
			},
			redirectAfterSign: false,
		});
	};

	// format the egld balance
	let accountBalance = 0.0;
	if (
		account.balance &&
		account.balance !== "..." &&
		!isNaN(Number(account.balance)) &&
		isLoggedIn
	) {
		accountBalance = calc3(account.balance / multiplier);
	}

	// Buy element
	const buyButton = () => {
		if (!presaleIsOpen) {
			return (
				<Button
					className="btn btn-block btn-sm btn-info mt-3"
					style={{minWidth: "90px"}}
					onClick={() => {
						toast.error(
							"Presale not started",
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
					Presale not started
				</Button>
			);
		}
		if (tokensPrice > accountBalance) {
			return (
				<Button
					className="btn btn-block btn-sm btn-info mt-3"
					style={{minWidth: "90px"}}
					onClick={() => {
						toast.error(
							"Insufficient EGLD",
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
					Insufficient EGLD
				</Button>
			);
		} else {
			return (
				<Button
					className="btn btn-block btn-sm btn-info mt-3"
					style={{minWidth: "90px"}}
					onClick={() => buyFunction(tokensPrice)}
				>
					Buy {scTokenLabel}
				</Button>
			);
		}
	};

	//disable buttons
	let disabledSlider = true;
	if(isLoggedIn && presaleIsOpen && (remainingTokensAmount > 0)){
		disabledSlider = false;
	}

	useEffect(() => {
		getStartTimestamp();
		getRemainingTokensAmount();
		const interval = window.setInterval(() => {
			getStartTimestamp();
			getRemainingTokensAmount();
		}, 2000);
		return () => window.clearInterval(interval);
		// eslint-disable-next-line
	}, []);

	return (
		<div>
			<Container>
				<Row>
					<Col xs={12} lg={12} className="text-center">
						{startTimestamp > 0  && <CustomCountdown startTitle="Presale starts in" completedTitle="Presale started"  titleStyles="h1" startTimestamp={startTimestamp}/>}
					</Col>
				</Row>
				<Row>
					<Col xs={12} lg={{offset: 3, span: 6}} className="text-center">
						{presaleIsOpen && <CustomProgressBar totalCount={totalCount} leftCount={remainingTokensAmount} activeColor="#32CD32"/>}
					</Col>
				</Row>
				<Row>
					<Col xs={12} lg={{offset: 4, span: 4}} className="text-center">
						<div className="farm-card text-white mt-4">
							<Row>
								<Col xs={12}>
									<p className="h3 text-white mt-2">XBID</p>
									<Card.Img
										variant="top"
										src={picture}
										style={{borderRadius: "15px"}}
										className="xbid-image"
									/>
									<p className="small">Bonus 1 SFT xBidLottery per 10 EGLD spent</p>
								</Col>
								<Col xs={12}>
									<div className="light-divider" style={{width: "100%", marginLeft: 0}}>
										{" "}
									</div>
									<Box display="flex" justifyContent="center" alignItems="center">
										<p className="h3 text-white mb-1 mt-2">
											<span className="text-green-A200">{intlNumberFormat(tokensAmount, "en-GB", 0, 0)}</span> {scTokenLabel}
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
										<p className="h4 text-white"><span className="text-green-A200">{intlNumberFormat(tokensPrice, "en-GB", 3, 3)}</span> EGLD</p>
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
									<Slider
										value={tokensAmount}
										onChange={e => handleSliderChange(e.target.value)}
										step={100}
										min={5000}
										max={calc3(remainingTokensAmount)}
										disabled={disabledSlider}
										style={{marginTop: '-10px'}}
									/>
									<Row>
										<Col xs={4}>
											<Button
												variant="success"
												className="btn btn-sm btn-block"
												disabled={!isLoggedIn}
												onClick={() => increaseAmount(100)}
												style={{width: '120%', marginLeft: '-10%'}}
											>
												<span>+100</span>
											</Button>
										</Col>
										<Col xs={4}>
											<Button
												variant="success"
												className="btn btn-sm btn-block"
												disabled={!isLoggedIn}
												onClick={() => increaseAmount(1000)}
												style={{width: '120%', marginLeft: '-10%'}}
											>
												<span>+1000</span>
											</Button>
										</Col>
										<Col xs={4}>
											<Button
												variant="success"
												className="btn btn-sm btn-block"
												disabled={!isLoggedIn}
												onClick={() => increaseAmount(5000)}
												style={{width: '120%', marginLeft: '-10%'}}
											>
												<span>+5000</span>
											</Button>
										</Col>
									</Row>
									<Row>
										<Col xs={4}>
											<Button
												variant="danger"
												className="btn btn-sm btn-block mt-1"
												disabled={!isLoggedIn}
												onClick={() => decreaseAmount(100)}
												style={{width: '120%', marginLeft: '-10%'}}
											>
												<span>-100</span>
											</Button>
										</Col>
										<Col xs={4}>
											<Button
												variant="danger"
												className="btn btn-sm btn-block mt-1"
												disabled={!isLoggedIn}
												onClick={() => decreaseAmount(1000)}
												style={{width: '120%', marginLeft: '-10%'}}
											>
												<span>-1000</span>
											</Button>
										</Col>
										<Col xs={4}>
											<Button
												variant="danger"
												className="btn btn-sm btn-block mt-1"
												disabled={!isLoggedIn}
												onClick={() => decreaseAmount(5000)}
												style={{width: '120%', marginLeft: '-10%'}}
											>
												<span>-5000</span>
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

export default XBid;