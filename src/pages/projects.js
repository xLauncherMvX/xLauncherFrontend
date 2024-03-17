import React from "react";
import DefaultProjectCard from "cards/DefaultProjectCard";
import profile1 from "assets/images/zero2InfinityMini.jpeg";
import profile2 from "assets/images/estarGamesMini.png";
import profile3 from "assets/images/vestaXFinancesMini2.png";
import profile3b from "assets/images/vestaXFinancesMini.png";
import profile4 from "assets/images/ethernityx_mini.png";
import profile5 from "assets/images/parascox_mini.png";
import profile6 from "assets/images/bloodshed_nfts.png";
import profile7 from "assets/images/snake_token_mini.jpg";
import profile8 from "assets/images/xbid_mini2.png";
import profile9 from "assets/images/uniplay.jpg";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

function Projects() {

	let imgSrc = profile3b;
	if (window.innerWidth < 1680) {
		imgSrc = profile3b;
	} else {
		imgSrc = profile3;
	}

	return (
		<div>
			<p className="text-white font-bold mt-4 ms-2" style={{fontSize: '40px'}}>Projects</p>
			<Row>
				<Col xs={12} md={6} lg={4}>
					<div className="project-card mt-4">
						<DefaultProjectCard
							image={profile9}
							label="project #9"
							title="UniPlay"
							description="UniPlay is a leading gaming ecosystem, revolutionizing interactive entertainment with a sophisticated staking mechanism and a pioneering Play-to-Earn (P2E) model, to be launched on 
							 Midas Chain."
							totalRaised="15,350 USD"
							action={{
								route: "https://www.uniplaycoin.io/",
								color: "white",
								label: "VIEW",
							}}
						/>
					</div>
				</Col>
				<Col xs={12} md={6} lg={4}>
					<div className="project-card mt-4">
						<DefaultProjectCard
							image={profile8}
							label="project #8"
							title="xBid"
							description="XBid represents a sophisticated online auction platform, designed to facilitate the bidding process in
														a secure and efficient virtual environment. Through this platform, participants are invited to submit price bids for a variety of enticing prizes."
							totalRaised="23,000 USD"
							action={{
								type: "internal",
								route: "/projects/xbid",
								color: "white",
								label: "VIEW",
							}}
						/>
					</div>
				</Col>
				<Col xs={12} md={6} lg={4}>
					<div className="project-card mt-4">
						<DefaultProjectCard
							image={profile7}
							label="project #7"
							title="Snake Token"
							description="Snake Token is an incredibly scarce asset, with only 2 million units planned for circulation over
													 the next 5 years, and 3.3 million over 10 years. The maximum cap is set at 10 million, a threshold that may never be reached in theory."
							totalRaised="70,000 USD"
							action={{
								route: "https://demiourgos.holdings/",
								color: "white",
								label: "VIEW",
							}}
						/>
					</div>
				</Col>
				<Col xs={12} md={6} lg={4}>
					<div className="project-card mt-4">
						<DefaultProjectCard
							image={profile6}
							label="project #6"
							title="Bloodshed"
							description="A Gaming Guild within Age of Zalmoxis, the 1st blockchain-based, Triple-A, Unreal-Engine 5 based, MMORPG."
							totalRaised="115,000 USD"
							action={{
								route: "https://bloodshed.gg/",
								color: "white",
								label: "VIEW",
							}}
							action2={{
								type: "internal",
								route: "/lottery/bloodshed-reveal",
								color: "white",
								label: "NFT REVEAL",
							}}
						/>
					</div>
				</Col>
				<Col xs={12} md={6} lg={4}>
					<div className="project-card mt-4">
						<DefaultProjectCard
							image={profile5}
							label="project #5"
							title="Parasco-X"
							description="Parasco Staking  acquired an Ethernity Cloud nodes server as well and… they shared, with everyone who owns an SFT, 50 Nodes, in order to involve the community in this amazing journey around Ethernity Cloud project."
							totalRaised="19,000 USD"
							action={{
								route: "https://medium.com/@xlauncher/parascox-the-vision-xtended-9f4009fe383f",
								color: "white",
								label: "VIEW",
							}}
						/>
					</div>
				</Col>
				<Col xs={12} md={6} lg={4}>
					<div className="project-card mt-4">
						<DefaultProjectCard
							image={profile4}
							label="project #4"
							title="Ethernity-X"
							description="Ethernity-X: we provide & share the computational power to validate and run the best solutions out there
														as direct components, together with our Community! Let’s be part of something bigger than all of us!"
							totalRaised="36,000 USD"
							action={{
								route: "https://medium.com/@xlauncher/ethernity-x-a-concept-by-xlauncher-aabbedc7841e",
								color: "white",
								label: "VIEW",
							}}
						/>
					</div>
				</Col>
				<Col xs={12} md={6} lg={4}>
					<div className="project-card mt-4">
						<DefaultProjectCard
							image={imgSrc}
							label="project #3"
							title="VestaX.Finance"
							description="
                              VestaX.Finance is a community-driven liquid staking DEFI service provider for MultiverseX.
                              VestaX.Finance allows users to stake the native EGLD token and earn staking rewards without locking assets.
                            "
							totalRaised="100,000 USD"
							action={{
								type: "internal",
								route: "/projects/vestax-finance",
								color: "white",
								label: "view",
							}}
							action2={{
								route: "https://demiourgos.synaps.me/signup",
								color: "white",
								label: "KYC"
							}}
						/>
					</div>
				</Col>
				<Col xs={12} md={6} lg={4}>
					<div className="project-card mt-4">
						<DefaultProjectCard
							image={profile2}
							label="project #2"
							title="Estar.Games"
							description="
                                ESTAR.GAMES project is aiming to create a vibrant ecosystem of games that shares between
                                them the tokenomics with the central piece being the $ESTAR Token.
                            "
							totalRaised="10,000 USD"
							action={{
								type: "internal",
								route: "/projects/estar-games",
								color: "white",
								label: "view",
							}}
						/>
					</div>
				</Col>
				<Col xs={12} md={6} lg={4}>
					<div className="project-card mt-4">
						<DefaultProjectCard
							image={profile1}
							label="project #1"
							title="Zero 2 Infinity"
							description="Zero 2 Infinity mission: enable people with a project and a passion to place themselves above the Earth
                                in order to collect rich data, take high definition images, manage communications and more, much more.
                            "
							totalRaised="36,000 USD (100% Refunded)"
							action={{
								type: "internal",
								route: "/projects/zero-2-infinity",
								color: "white",
								label: "view",
							}}
						/>
					</div>
				</Col>
			</Row>
		</div>
	);
}

export default Projects;