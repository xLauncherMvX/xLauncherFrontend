import React, { useState, useEffect } from "react";
import { Col, Row } from 'react-bootstrap';
import CustomCountdown from "../components/countdown";

function ChristmasContest(props) {

	const [label, setLabel] = useState('');
	const [step, setStep] = useState(0);
	const [currentTimestamp, setCurrentTimestamp] = useState(Date.now()); // Initialize with the current timestamp

	const timestamps = [
		1701771540000,
		1701771550000,
		1701771560000,
		1701771570000,
		1702771580000,
	];

	const labels = [
		'The 1st riddle is revealed in',
		'The 2nd riddle is revealed in',
		'The 3rd riddle is revealed in',
		'The 4th riddle is revealed in',
		'The 5th riddle is revealed in',
		'The 6th riddle is revealed in',
		'The 7th riddle is revealed in',
		'The 8th riddle is revealed in',
		'The 9th riddle is revealed in',
		'The 10th riddle is revealed in',
		'The 11th riddle is revealed in',
		'The 12th riddle is revealed in',
		'The 13th riddle is revealed in',
		'The 14th riddle is revealed in',
		'The 15th riddle is revealed in',
		'The 16th riddle is revealed in',
		'The 17th riddle is revealed in',
		'The 18th riddle is revealed in',
		'The 19th riddle is revealed in',
		'The 20th riddle is revealed in',
		'The 21st riddle is revealed in',
		'The 22nd riddle is revealed in',
		'The 23rd riddle is revealed in',
		'The 24th riddle is revealed in'
	];

	const words = [
		'final',
		'kingdom',
		'miracle',
		'invite',
		'seven',
		'prize',
		'bridge',
		'economy',
		'two',
		'flee',
		'blast',
		'inside',
		'rent',
		'absurd',
		'senior',
		'valve',
		'lunch',
		'upgrade',
		'hope',
		'glass',
		'ugly',
		'kick',
		'tuna',
		'test'
	];

	const questions = [
		"<p>I come at the end, the ultimate call,<br>The conclusion of it all.<br>What am I?</p>",
		"<p>I have subjects but wear no crown,<br>Royalty without a gown.<br>What am I?</p>",
		"<p>A wonder beyond the logical,<br>A marvel, magical.<br>What am I?</p>",
		"<p>I'm sent in the mail, a request so sweet,<br>To join an event or a date to meet.<br>What am I?</p>",
		"<p>Count on your fingers, one, two, three,<br>Keep going until you reach me.<br>What am I?</p>",
		"<p>I'm the reward for a victory grand,<br>In a competition, I'm what you stand to land.<br>What am I?</p>",
		"<p>Over water, I extend my reach,<br>Connecting lands, a structure to teach.<br>What am I?</p>",
		"<p>I control the money, trade, and toil,<br>The engine of a country's financial soil.<br>What am I?</p>",
		"<p>I'm the second in a sequence, not one or three,<br>In pairs, in a couple, you'll find me.<br>What am I?</p>",
		"<p>When danger nears, I take my chance,<br>Swiftly moving, in a hurried dance.<br>What am I?</p>",
		"<p>With a bang, I make my mark,<br>A sudden sound in the dark.<br>What am I?</p>",
		"<p>I'm the opposite of out,<br>Within, enclosed, without a doubt.<br>What am I?</p>",
		"<p>Pay me monthly, a place to reside,<br>A fee for shelter, where you abide.<br>What am I?</p>",
		"<p>I'm the crazy, the wild, the insane,<br>Logic and reason I disdain.<br>What am I?</p>",
		"<p>In years, I'm old and wise,<br>Life's experiences in my eyes.<br>What am I?</p>",
		"<p>In machines, I control the flow,<br>Open, close, a regulator I show.<br>What am I?</p>",
		"<p>Noon approaches, a meal in my clutch,<br>Between breakfast and dinner, what am I as such?<br>What am I?</p>",
		"<p>From basic to advanced, I rise,<br>Improved and better, a pleasant surprise.<br>What am I?</p>",
		"<p>In despair, I'm a shining light,<br>A wish, a dream, burning bright.<br>What am I?</p>",
		"<p>See through me, transparent and clear,<br>I hold liquids, and I bring cheer.<br>What am I?</p>",
		"<p>Not pretty, not fair to the eye,<br>Lacking beauty, I make some sigh.<br>What am I?</p>",
		"<p>With your foot, you give me might,<br>A sudden strike, a sporty delight.<br>What am I?</p>",
		"<p>In the depths of the ocean, I roam with grace,<br>Canned or fresh, a seafood delight to embrace.<br>What am I?</p>",
		"<p>In the classroom, I'm often feared,<br>A challenge for the mind, to be revered.<br>What am I?</p>",
	];

	const hints = [
		'5 letters',
		'7 letters',
		'7 letters',
		'6 letters',
		'5 letters',
		'5 letters',
		'6 letters',
		'7 letters',
		'3 letters',
		'4 letters',
		'5 letters',
		'6 letters',
		'4 letters',
		'6 letters',
		'6 letters',
		'5 letters',
		'5 letters',
		'7 letters',
		'4 letters',
		'5 letters',
		'4 letters',
		'4 letters',
		'4 letters',
		'4 letters'
	];

	useEffect(() => {
		const intervalId = setInterval(() => {
			setCurrentTimestamp(Date.now());
		}, 1000);

		return () => clearInterval(intervalId);
	}, []);

	useEffect(() => {
		const newStep = getCurrentStep(currentTimestamp);
		setStep(newStep);
	}, [currentTimestamp]);

	function getCurrentStep(currentTimestamp) {
		let newStep = -1;

		for (let i = 0; i < timestamps.length; i++) {
			if (currentTimestamp < timestamps[i]) {
				newStep = i;
				break;
			}
		}

		if (newStep === -1) {
			newStep = timestamps.length - 1;
		}
		return newStep;
	}

	return (
		<div style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} className="mt-2">
			<Row>
				<Col xs={12} lg={12} className="text-center">
					{step === 4 && <CustomCountdown startTitle={labels[step]} completedTitle="All riddles have been revealed" titleStyles="h1 text-white font-bold" startTimestamp={timestamps[4]} />}
				</Col>
			</Row>
			<p className="text-white text-center mt-2">{`Current step: ${step}, Word: ${words[step]}`}</p>
			<div dangerouslySetInnerHTML={{ __html: questions[step] }} className="text-white text-justified p-3" />
		</div>
	);
}

export default ChristmasContest;
