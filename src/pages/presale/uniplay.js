import React, {useEffect, useState} from "react";
import "assets/css/globals.css";
import "assets/css/mint.css";
import picture from "assets/images/uniplay_logo.png";
import Container from "@mui/material/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import {Card} from "react-bootstrap";
import CustomCountdown from "components/countdown";
import CustomProgressBar from "components/progress_bar";
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import Slider from '@mui/material/Slider';
import Input from "@mui/material/Input";



import {contractQuery} from "utils/api";
import {customConfig, networkId} from "config/customConfig";
import abiFile from "abiFiles/uniplay_sale.abi.json";
import {ProxyNetworkProvider} from "@multiversx/sdk-network-providers/out";
import {multiplier, calc3, intlNumberFormat} from "utils/utilities";
import {useGetAccountInfo} from "@multiversx/sdk-dapp/hooks";
import Box from "@mui/material/Box";
import {
	AbiRegistry,
	Address,
	BigUIntValue,
	SmartContract, TokenTransfer
} from "@multiversx/sdk-core/out";
import {refreshAccount} from "@multiversx/sdk-dapp/utils/account";
import {sendTransactions} from "@multiversx/sdk-dapp/services";
import { useGetPendingTransactions } from "@multiversx/sdk-dapp/hooks/transactions";
import BigNumber from 'bignumber.js';


function UniPlay() {
	//Set the config network
	const config = customConfig[networkId];
	const { address, account } = useGetAccountInfo();

	const isLoggedIn = address.startsWith("erd");
	const networkProvider = new ProxyNetworkProvider(config.provider);
	const scAddress = config.uniplayAddress;
	const scTokenLabel = "UPlay";
	const scName = "Sale";
	const chainID = config.chainID;
	const tokensAPI = config.apiLink + address + "/tokens?size=2000";
	const totalCount = 500000000;
	const startTimestamp = 1707242400000;
	const [tokensAmount, setTokensCount] = useState(0);
	const [tokensPrice, setTokensPrice] = useState(0);
	const [usdcPrice, setUsdcPrice] = useState(0);
	const [usdcInEgld, setUsdcInEgld] = useState(0);
	const [usdcInVegld, setUsdcInVegld] = useState(0);
	const [usdcInOURO, setUsdcInOuro] = useState(0);
	const [paymentToken, setPaymentToken] = useState('usdc');
	const [paymentTokenLabel, setPaymentTokenLabel] = useState('USDC');

	//get loading transactions
	const loadingTransactions = useGetPendingTransactions().hasPendingTransactions;	

	// Calculate if the presale is open or closed
	let presaleIsOpen = false;
	const currentTimestamp = new Date().getTime();
	if (startTimestamp - currentTimestamp <= 0) {
		presaleIsOpen = true;
	}

	//Get the price in usdc
	const getUSDCPrice = async () => {
		const priceData = await contractQuery(
			networkProvider,
			abiFile,
			scAddress,
			scName,
			"getTokenPrice",
			[]
		);

		if(priceData){
			const newPrice = new BigNumber(priceData ?? 0).dividedBy(new BigNumber(10).pow(new BigNumber(6))).toNumber();
			setUsdcPrice(newPrice);
		}
	};

	//Get the price of usdc in egld
	const getUsdcinEgldPrice = async () => {
		const apiUrl = 'https://graph.xexchange.com/graphql';
		const requestBody = {
			query: `
				query ($amountIn: String, $amountOut: String, $tokenInID: String!, $tokenOutID: String!, $tolerance: Float!) {
					swap(
						amountIn: $amountIn
						amountOut: $amountOut
						tokenInID: $tokenInID
						tokenOutID: $tokenOutID
						tolerance: $tolerance
					) {
						amountIn
						tokenInID
						tokenInPriceUSD
						tokenInExchangeRateDenom
						amountOut
						tokenOutID
						tokenOutPriceUSD
						tokenOutExchangeRateDenom
					}
				}			
			`,
			variables: {
				amountIn: "1000000",
				tokenInID: "USDC-c76f1f",
				tokenOutID: "EGLD",
				tolerance: 0.01
			}
		};
	
		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			});

			const data = await response.json();
			const newPrice = new BigNumber(data.data.swap.amountOut ?? 0).dividedBy(new BigNumber(10).pow(new BigNumber(18))).toNumber();	
			setUsdcInEgld(newPrice);

		} catch (error) {
			console.error('Error fetching data:', error.message);
		}
	};

	//get the price of usdc in vegld
	const getUsdcinVEgldPrice = async () => {
		const apiUrl = 'https://gateway3.mvx-api.estar.games/vm-values/query';	
		const requestBody = {
				"funcName": "getEquivalent",
				"scAddress": "erd1qqqqqqqqqqqqqpgqyrgfkqzqn64na8h6stfq2ryyf8eyvtrl0a0spqag6s",
				"args": [
						"555344432d633736663166",
						"0de0b6b3a7640000"
				]
		}
	
		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			});
	
			const data = await response.json();	
			const encoded = data.data.data.returnData[0];

			const hex = Buffer.from(data.data.data.returnData[0], 'base64').toString('hex');
			const paddedHex = hex.length % 2 ? `0${hex}` : hex;
			const newPrice = BigNumber(paddedHex, 16).toString(10);
			const newFPrice = new BigNumber(newPrice ?? 0).dividedBy(new BigNumber(10).pow(new BigNumber(6))).toNumber();
			setUsdcInVegld(1 / newFPrice);

		} catch (error) {
			console.error('Error fetching data:', error.message);
		}
	};

	//get the price of usdc in ouro
	const getUsdcInOuroPrice = async () => {
		const apiUrl = 'https://gateway3.mvx-api.estar.games/vm-values/query';	
		const requestBody = {
				"funcName": "getEquivalent",
				"scAddress": "erd1qqqqqqqqqqqqqpgqzna793tw3sd2vshvzkt0ttwu9pdyj97e0a0s3j3dv2",
				"args": [
						"555344432d633736663166",
						"0de0b6b3a7640000"
				]
		}
	
		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			});
	
			const data = await response.json();	
			const encoded = data.data.data.returnData[0];

			const hex = Buffer.from(data.data.data.returnData[0], 'base64').toString('hex');
			const paddedHex = hex.length % 2 ? `0${hex}` : hex;
			const newPrice = BigNumber(paddedHex, 16).toString(10);
			const newFPrice = new BigNumber(newPrice ?? 0).dividedBy(new BigNumber(10).pow(new BigNumber(6))).toNumber();
			setUsdcInOuro(1 / newFPrice);

		} catch (error) {
			console.error('Error fetching data:', error.message);
		}
	};
	

	//getRemainingPurchaseLimit
	const [remainingTokensAmount, setRemainingTokensAmount] = useState(0);
	const getRemainingTokensAmount = async () => {
		const remainingTokensAmountData = await contractQuery(
			networkProvider,
			abiFile,
			scAddress,
			scName,
			"getSaleSupply",
			[]
		);
		if(remainingTokensAmountData){
			setRemainingTokensAmount(remainingTokensAmountData.toNumber()  / multiplier);
		}
	};

	//
	function changeType(event) {
		const selectedType = event.target.value;
		switch (selectedType) {
			case "usdc":
				setPaymentToken("usdc");
				setPaymentTokenLabel("USDC");
				setTokensCount(0);
				setTokensPrice(0);
				break;
			case "ouro":
				setPaymentToken("ouro");
				setPaymentTokenLabel("OURO");
				setTokensCount(0);
				setTokensPrice(0);
				break;
			case "egld":
				setPaymentToken("egld");
				setPaymentTokenLabel("EGLD");
				setTokensCount(0);
				setTokensPrice(0);
				break;
			case "vegld":
				setPaymentToken("vegld");
				setPaymentTokenLabel("VEGLD");
				setTokensCount(0);
				setTokensPrice(0);
				break;
		}
	}

	//disable buttons
	let disabledButtons = true;
	if(isLoggedIn && (remainingTokensAmount > 0) && !loadingTransactions){
		disabledButtons = false;
	}

	//+/- buttons
	const increaseAmount = (amount) => {
		if (tokensAmount > remainingTokensAmount) {
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
		switch(paymentToken){
			case 'usdc': setTokensPrice(usdcPrice * newValue); break;
			case 'egld': setTokensPrice(usdcPrice * newValue * usdcInEgld); break;
			case 'vegld': setTokensPrice(usdcPrice * newValue * usdcInVegld); break;
			case 'ouro': setTokensPrice(usdcPrice * newValue * usdcInOURO); break;
		}
		
	};

	const decreaseAmount = (amount) => {
		let newValue = tokensAmount - amount;
		if (tokensAmount > remainingTokensAmount) {
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
		if (newValue < 1) {
			toast.error(
				"You can't buy less than 1 token",
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
			switch(paymentToken){
				case 'usdc': setTokensPrice(usdcPrice * newValue); break;
				case 'egld': setTokensPrice(usdcPrice * newValue * usdcInEgld); break;
				case 'vegld': setTokensPrice(usdcPrice * newValue * usdcInVegld); break;
				case 'ouro': setTokensPrice(usdcPrice * newValue * usdcInOURO); break;
			}
		}
	};
	
	// slider
	const handleSliderChange = (value) => {
		setTokensCount(value);
		switch(paymentToken){
			case 'usdc': setTokensPrice(usdcPrice * value); break;
			case 'egld': setTokensPrice(usdcPrice * value * usdcInEgld); break;
			case 'vegld': setTokensPrice(usdcPrice * value * usdcInVegld); break;
			case 'ouro': setTokensPrice(usdcPrice * value * usdcInOURO); break;
		}
	};

	//input
  const handleInput = (event) => {
		if (event.target.value === '' || isNaN(Number(event.target.value))){
			setTokensCount(0);
			setTokensPrice(0);
		}else{
    	setTokensCount(event.target.value);
			switch(paymentToken){
				case 'usdc': setTokensPrice(usdcPrice * event.target.value); break;
				case 'egld': setTokensPrice(usdcPrice * event.target.value * usdcInEgld); break;
				case 'vegld': setTokensPrice(usdcPrice * event.target.value * usdcInVegld); break;
				case 'ouro': setTokensPrice(usdcPrice * event.target.value * usdcInOURO); break;
			}
		}
  };

	// format the egld balance
	const [walletBalance, setWalletBalance] = useState({
		egld: 0,
		vegld: 0,
		usdc: 0,
		ouro: 0
	});
	const getWalletData = async () => {
		let newOuro = 0;
		let newEgld = 0;
		let newVegld = 0;
		let newUsdc = 0;

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
						newOuro = item.balance / multiplier;
					}
					if (item.identifier === "VEGLD-2b9319") {
						newVegld = item.balance / multiplier;
					}
					if (item.identifier === "USDC-c76f1f") {
						newUsdc = item.balance / 1000000;
					}
				});
			}
		} catch (e) {
			console.error(e);
		}

		if (account.balance && account.balance !== "..." && !isNaN(Number(account.balance)) && isLoggedIn) {
			newEgld= account.balance / multiplier;
		}		
		setWalletBalance({
			egld: newEgld,
			vegld: newVegld,
			ouro: newOuro,
			usdc: newUsdc
		});
	};
	
	//Buy Function
	const buyFunction = async (price) => {
		if (tokensAmount > remainingTokensAmount) {
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

		let abiRegistry = AbiRegistry.create(abiFile);
		let contract = new SmartContract({
			address: new Address(scAddress),
			abi: abiRegistry
		});

		let transaction;
		let buyTransaction;
		switch(paymentToken){
			case 'egld':
				transaction = contract.methodsExplicit
					.buy([new BigUIntValue(tokensAmount * multiplier)])
					.withChainID(chainID)			
					.buildTransaction();
			
				buyTransaction = {
					value: (tokensPrice + 0.002) * multiplier,
					data: Buffer.from(transaction.getData().valueOf()),
					receiver: scAddress,
					gasLimit: 20_000_000
				};
			break;
			case 'ouro':
				transaction = contract.methodsExplicit
					.buy([new BigUIntValue(tokensAmount * multiplier)])
					.withChainID(chainID)
					.withSingleESDTTransfer(
						TokenTransfer.fungibleFromAmount("OURO-9ecd6a", tokensPrice + 0.0001, 18)
					)
					.buildTransaction();
			
				buyTransaction = {
					value: 0,
					data: Buffer.from(transaction.getData().valueOf()),
					receiver: scAddress,
					gasLimit: 20_000_000
				};
			break;
			case 'vegld':
				transaction = contract.methodsExplicit
					.buy([new BigUIntValue(tokensAmount * multiplier)])
					.withChainID(chainID)
					.withSingleESDTTransfer(
						TokenTransfer.fungibleFromAmount("VEGLD-2b9319", tokensPrice + 0.0001, 18)
					)
					.buildTransaction();
			
				buyTransaction = {
					value: 0,
					data: Buffer.from(transaction.getData().valueOf()),
					receiver: scAddress,
					gasLimit: 20_000_000
				};
			break;
			case 'usdc':
				transaction = contract.methodsExplicit
					.buy([new BigUIntValue(tokensAmount * multiplier)])
					.withChainID(chainID)
					.withSingleESDTTransfer(
						TokenTransfer.fungibleFromAmount("USDC-c76f1f", tokensPrice + 0.000001, 6)
					)
					.buildTransaction();
			
				buyTransaction = {
					value: 0,
					data: Buffer.from(transaction.getData().valueOf()),
					receiver: scAddress,
					gasLimit: 20_000_000
				};
			break;
		}

		
		await refreshAccount();

		const { sessionId /*, error*/ } = await sendTransactions({
			transactions: [buyTransaction],
			transactionsDisplayInfo: {
				processingMessage: "Processing Buying transaction",
				errorMessage: "An error has occurred during Buying transaction",
				successMessage: "Buying transaction successful",
			},
			redirectAfterSign: false,
		});
	};

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
		if (tokensPrice > walletBalance[paymentToken]) {			
			return (
				<Button
					className="btn btn-block btn-sm btn-info mt-3"
					style={{minWidth: "90px"}}
					disabled={disabledButtons}
					onClick={() => {
						toast.error(
							`Insufficient ${paymentTokenLabel}`,
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
					Insufficient {paymentTokenLabel}
				</Button>
			);
		} else {
			return (
				<Button
					className="btn btn-block btn-sm btn-info mt-3"
					style={{minWidth: "90px"}}
					onClick={() => buyFunction(tokensPrice)}
					disabled={disabledButtons}
				>
					Buy {scTokenLabel}
				</Button>
			);
		}
	};

	//unlocked and locked tokens math
	const percentageUnlocked = 5;
	const percentageBlocked = 100 - percentageUnlocked;

	const unlockedPercentage = (tokensAmount * percentageUnlocked) / 100;
	const blockedPercentage = (tokensAmount * percentageBlocked) / 100;

	useEffect(() => {
		getUSDCPrice();
		getUsdcinEgldPrice();
		getUsdcinVEgldPrice();
		getUsdcInOuroPrice();
		getRemainingTokensAmount();
		if(isLoggedIn){
			getWalletData();
		}
		const interval = window.setInterval(() => {
			getUSDCPrice();
			getUsdcinEgldPrice();
			getUsdcinVEgldPrice();
			getUsdcInOuroPrice();
			getRemainingTokensAmount();
			if(isLoggedIn){
				getWalletData();
			}
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
									<p className="h3 text-white mt-2">UniPlay</p>
									<Card.Img
										variant="top"
										src={picture}
										style={{borderRadius: "15px"}}
										className="xbid-image"
									/>									
								</Col>
								<Col xs={12}>
									<div className="light-divider" style={{width: "100%", marginLeft: 0}}>
										{" "}
									</div>
									<Box display="flex" justifyContent="center" alignItems="center">										
										<Input
											value={tokensAmount}
											size="small"
											placeholder=""
											onChange={handleInput}
											onKeyPress={(event) => {
													if (!/[0-9]/.test(event.key)) {
															event.preventDefault();
													}
											}}
											disableUnderline
											disabled={false}
											className="text-green-A200 ps-2 pe-3 pt-1 b-r-sm me-2"
											style={{border: '0.5px solid rgb(74, 85, 104)', width: '40%', textAlign: 'center'}}
										/>
										<span className="h3 text-white mb-1 mt-2">
											Tokens
										</span>
									</Box>
									<Box display="flex" justifyContent="center" alignItems="center">										
										<p className="mt-1 mb-1 small">(<span className="text-green-A200">{unlockedPercentage.toFixed(2)}</span> UPLAY, <span className="text-green-A200">{blockedPercentage.toFixed(2)}</span> VUPLAY)</p>
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
										<p className="h4 text-white"><span className="text-green-A200">{intlNumberFormat(tokensPrice, "en-GB", 5, 5)}</span></p>
										<select
												className="form-select ms-2 text-white"
												value={paymentToken}
												onChange={changeType}
												style={{
													width: 'auto',
													marginTop: '-10px',
													backgroundColor: 'transparent',
													borderColor: '#808080'
												}}
											>
												<option value="usdc" style={{backgroundColor: '#060b28f0'}}>USDC</option>
												<option value="ouro" style={{backgroundColor: '#060b28f0'}}>OURO</option>
												<option value="egld" style={{backgroundColor: '#060b28f0'}}>EGLD</option>
												<option value="vegld" style={{backgroundColor: '#060b28f0'}}>VEGLD</option>
											</select>
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
									<Box display="flex" justifyContent="center" alignItems="center">
										<p className="h6 text-white mb-2">
											Balance: <span
											className="text-green-A200">{intlNumberFormat(walletBalance[paymentToken], "en-GB", 4, 4)}</span> {paymentTokenLabel}
										</p>
									</Box>
									<Slider
										value={tokensAmount}
										onChange={e => handleSliderChange(e.target.value)}
										step={500}
										min={0}
										max={calc3(1000000)}
										disabled={disabledButtons}
										style={{marginTop: '-10px'}}
									/>
									<Row>
										<Col xs={4}>
											<Button
												variant="success"
												className="btn btn-sm btn-block"
												disabled={disabledButtons}
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
												disabled={disabledButtons}
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
												disabled={disabledButtons}
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
												disabled={disabledButtons}
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
												disabled={disabledButtons}
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
												disabled={disabledButtons}
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

export default UniPlay;