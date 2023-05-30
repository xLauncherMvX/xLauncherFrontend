import React from "react";

function SnakeTokenPresale(props) {
	let walletState = props.walletState;
	const {address} = walletState;

	return (
		<div>
			<p className="text-white font-bold mt-4 ms-2 mb-3" style={{fontSize: '40px'}}>SnakeTokenPresale</p>

		</div>
	);
}

export default SnakeTokenPresale;