import React, {useEffect, useState} from "react";
import Button from 'react-bootstrap/Button';
import {contractQuery, getAccountTokens} from "utils/api";
import {ProxyNetworkProvider} from "@multiversx/sdk-network-providers/out";
import {networkId, customConfig} from "config/customConfig";
import stakeV2Abi from "abiFiles/xlauncher-staking-v2.abi.json";
import {U64Value} from "@multiversx/sdk-core/out";
import {calc2, formatString, multiplier} from "../utils/utilities";
import Row from "react-bootstrap/Row";
import Container from "@mui/material/Container";
import Col from "react-bootstrap/Col";
import {CSVLink} from "react-csv";

function Admin(props) {
	const address = props.address;
	const isLoggedIn = Boolean(address);

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

	//Set the config network
	const config = customConfig[networkId];
	const networkProvider = new ProxyNetworkProvider(config.provider);
	const stakeScAddress = config.stakeV2Address;


	//Get the total number of created farms
	const [timer, setTimer] = useState(0);
	const [farmsNumber, setFarmNumber] = useState(0);
	const getFarmsNumber = async () => {
		const newFarmsNumber = await contractQuery(
			networkProvider,
			stakeV2Abi,
			stakeScAddress,
			"HelloWorld",
			"getTotalStakedData",
			[]
		);
		if (newFarmsNumber) {
			setFarmNumber(newFarmsNumber?.last_pool_id);
			setTimer(parseInt(newFarmsNumber?.last_pool_id));
		}
	};

	const [walletsList, setWalletsList] = useState([]);
	const getFarmsDetails = async () => {
		const newFarmsDetails = [];

		let createdFarmsAux = 0;
		for (let i = 1; i <= farmsNumber; i++) {
			const newWalletsList = await contractQuery(
				networkProvider,
				stakeV2Abi,
				stakeScAddress,
				"HelloWorld",
				"getStakingWalletsReport",
				[new U64Value(i)]
			);

			if (newWalletsList) {
				const newArray = [];
				newWalletsList.forEach(wallet => {
					let formattedWallet = wallet.client_address.bech32();
					let formattedAmount = wallet.xlh_amount / multiplier;
					if (formattedAmount >= 1) {
						newArray.push({
							client_address: formattedWallet,
							xlh_amount: formattedAmount
						})
					}
				});
				newFarmsDetails[i] = newArray;
				setTimer(farmsNumber - i);
			}

			await new Promise(resolve => setTimeout(resolve, 1000));
			setWalletsList(newFarmsDetails);
		}
	}

	const [finalList, setFinalList] = useState([]);
	const sumXlhAmountsByAddress = (data) => {
		const sumsByAddress = {};

		data.forEach((innerArray) => {
			innerArray.forEach((obj) => {
				const { client_address, xlh_amount } = obj;
				if (!sumsByAddress[client_address]) {
					sumsByAddress[client_address] = 0;
				}
				sumsByAddress[client_address] += parseInt(xlh_amount);
			});
		});

		const resultArray = Object.entries(sumsByAddress).map(([client_address, xlh_amount]) => ({
			client_address,
			xlh_amount,
		}));
		resultArray.sort((a, b) => parseInt(b.xlh_amount) - parseInt(a.xlh_amount));
		setFinalList(resultArray);
	};



	const csvHeaders = [
		{ label: 'Wallet address', key: 'client_address' },
		{ label: 'Staked amount', key: 'xlh_amount' },
	];
	let filename = 'StakingV2_wallets_list.csv';

	return (
		<div>
			<p style={{fontSize: '50px', color: 'white'}}>Admin</p>
			{walletAddresses.includes(address) &&
			<Row>
				<Col xs={12} lg={6}>
					<div className="farm-card text-center">
						<Row>
							<Col xs={12}>
								<p className="h4 text-white">1. get total farm number</p>
								<Button className="btn btn-info btn-block" onClick={() => getFarmsNumber()}> Start</Button>
								<p className="h5 text-white mt-2">Result: {farmsNumber.toString()}</p>
							</Col>
						</Row>
						<Row className="mt-3">
							<Col xs={12}>
								<p className="h4 text-white">2. get all staking wallets for each pool</p>
								<Button className="btn btn-info btn-block" onClick={() => getFarmsDetails()}> Start</Button>
								<p className="h5 text-white mt-2">Done in: {timer.toString()}seconds</p>
							</Col>
						</Row>
						<Row className="mt-3">
							<Col xs={12}>
								<p className="h4 text-white">3. sum up the amount foreach farm </p>
								<Button className="btn btn-info btn-block" onClick={() => sumXlhAmountsByAddress(walletsList)}> Start</Button>
								<p className="h5 text-white mt-2">Result: {finalList.length ? 'done': 'not done'}</p>
							</Col>
						</Row>
						<Row className="mt-3">
							<Col xs={12}>
								<p className="h4 text-white">4. Download CSV </p>
								<button className="btn btn-info btn-block">
									<CSVLink data={finalList} headers={csvHeaders}  filename={filename} separator=";">
										<span className="text-white">Export Wallets</span>
									</CSVLink>
								</button>
							</Col>
						</Row>
					</div>
				</Col>
			</Row>
			}
		</div>
	);
}

export default Admin;