import {
	ResultsParser,
	SmartContract,
	Address,
	AbiRegistry,
	TokenIdentifierValue
} from '@multiversx/sdk-core/out';
import { useGetAccount } from '@multiversx/sdk-dapp/hooks/account/useGetAccount';
import { useGetNetworkConfig } from '@multiversx/sdk-dapp/hooks/useGetNetworkConfig';
import { sendTransactions } from '@multiversx/sdk-dapp/services/transactions/sendTransactions';
import { ProxyNetworkProvider } from '@multiversx/sdk-network-providers/out';
import React,{ useState } from 'react';
import abi from "abiFiles/bloodshed_mint.abi.json";
import BigNumber from 'bignumber.js';

export const UpdateMintPrice = () => {
	const { chainID } = useGetNetworkConfig();
	const { address } = useGetAccount();
	const [newPrice, setNewPrice] = useState(0);
	const [paymentToken, setPaymentToken] = useState('');

	const getSc = () => {
		return new SmartContract({
			address: new Address(
				'erd1qqqqqqqqqqqqqpgqcc2dakhdz23hk8gvlnn054uhzzeewn5xwmfsyqdssd'
			),
			abi: AbiRegistry.create(abi)
		});
	};

	const handleSetNewPrice = async () => {
		if (paymentToken.startsWith('OURO')) {
			await handleUpdateFirstTokenPrice();
			return;
		}
		if (paymentToken.startsWith('VST')) {
			await handleUpdateThirdTokenPrice();
			return;
		}
		window.alert('Invalid token selected');
	};

	const handleUpdateFirstTokenPrice = async () => {
		const tx = getSc()
			.methods.setFirstTokenPayment([
				new TokenIdentifierValue(paymentToken),
				new BigNumber(newPrice).shiftedBy(18)
			])
			.withChainID(chainID)
			.withGasLimit(20_000_000)
			.withSender(new Address(address))
			.buildTransaction();

		await sendTransactions({ transactions: [tx] });
	};

	const handleUpdateThirdTokenPrice = async () => {
		const tx = getSc()
			.methods.setThirdTokenPayment([
				new TokenIdentifierValue(paymentToken),
				new BigNumber(newPrice).shiftedBy(18)
			])
			.withChainID(chainID)
			.withGasLimit(20_000_000)
			.withSender(new Address(address))
			.buildTransaction();

		await sendTransactions({ transactions: [tx] });
	};

	return address !==
	// 'erd1h6lh2tqjscs4n69c4w4wunu4qw2mz708qn8mqk4quzsyz2syn0aq5gu64s' ? null : (
	'erd1h6lh2tqjscs4n69c4w4wunu4qw2mz708qn8mqk4quzsyz2syn0aq5gu64s' ? null : (
		<div className='container mt-5'>
			<div className='row'>
				<div className='col-12'>
					<h1 className="text-white text-center">Update Mint Price</h1>
				</div>
				<div className='col-12'>
					<input
						type='text'
						className='form-control'
						placeholder='New Price'
						onChange={(e) => setNewPrice(parseFloat(e.target.value))}
					/>
				</div>
				<div className='col-12 mt-3'>
					<select
						className='form-control'
						onChange={(e) => setPaymentToken(e.target.value)}
					>
						<option value=''>Select Payment Token</option>
						<option value='OURO-9ecd6a'>OURO</option>
						<option value='VST-c40502'>VST</option>
					</select>
				</div>
				<div className='col-12 mt-5'>
					<button className='btn btn-primary' onClick={handleSetNewPrice}>
						Update
					</button>
				</div>
			</div>
		</div>
	);
};