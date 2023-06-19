import React, { useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { Toaster } from 'react-hot-toast';
import { InputBase, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import { useGetAccount, useGetPendingTransactions } from '@multiversx/sdk-dapp/hooks';
import Countdown from 'react-countdown';
import { getTokenDecimals } from './config';
import {
    getCurrentQuotePrice,
    getTokenBalanceFromApi,
    presaleBuy,
    viewPresaleBaseContext,
    viewPresaleStatsContext,
    viewPresaleUserContext,
} from './z/elrond';
import {
    PresaleBaseContext,
    PresaleStatsContext,
    PresaleUserContext,
} from './z/types';
import {
    applyPrecision,
    convertBigNumberToLocalString,
    convertEsdtToWei,
    convertTokenIdentifierToTicker,
    convertWeiToEsdt,
    ERROR_CONNECT_WALLET,
    ERROR_INVALID_NUMBER,
    ERROR_NOT_ENOUGH_BALANCE,
    ERROR_SC_DATA_NOT_LOADED,
    ERROR_TRANSACTION_ONGOING,
    isPositiveOrZeroBigNumber,
    parseBigNumber,
    toastError,
    ZERO_STRING,
} from './z/utils';
import './vesta_x.css';
import { TokenTransfer } from '@multiversx/sdk-core/out';
import imgNosferatu from './nosferatu.png';

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 4,
  borderRadius: 5,
//   padding: '13px 0',
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: 'currentColor',
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: '#f1dc46',
  },
}));

const BootstrapInput = styled(InputBase)(({ theme }) => ({
    'label + &': {
        marginTop: theme.spacing(3),
    },
    '& .MuiInputBase-input': {
        borderRadius: 4,
        position: 'relative',
        // backgroundColor: '#1B0921',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        fontSize: 16,
        padding: '10px 26px 10px 12px',
        width: '4rem',
        color: 'white',
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        // Use the system font instead of the default Roboto font.
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        '&:focus': {
            borderRadius: 4,
            borderColor: '#80bdff',
            boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
        },
    },
    '& .MuiSelect-icon': {
        color: 'white',
    }
}));

// Renderer callback with condition
const countdownRenderer = ({
    days,
    hours,
    minutes,
    seconds,
    completed,
} : {
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
    completed: boolean,
}) => {
    return (
        <div className="presale-timer-container text-center mt-3">
            <strong>
                <span className="presale-timer-box p-2 me-2">{String(days).padStart(2, '0')}</span>
                <span className="presale-timer-box p-2 me-2">{String(hours).padStart(2, '0')}</span>
                <span className="presale-timer-box p-2 me-2">{String(minutes).padStart(2, '0')}</span>
                <span className="presale-timer-box p-2 me-2">{String(seconds).padStart(2, '0')}</span>
            </strong>
        </div>
    );
};

export const NosferatuMint = () => {
    const { address, balance: egldBalance } = useGetAccount();
    const { hasPendingTransactions } = useGetPendingTransactions();

    const [baseContext, setBaseContext] = useState<PresaleBaseContext>();
    const [statsContext, setStatsContext] = useState<PresaleStatsContext>();
    const [userContext, setUserContext] = useState<PresaleUserContext>();
    const [quoteTokenBalance, setQuoteTokenBalance] = useState<number>(0);
    const [buyQuoteAmount, setBuyQuoteAmount] = useState<string>(ZERO_STRING);

    const [selectedTokenId, setSelectedTokenId] = useState<string>('');
    const [priceRate, setPriceRate] = useState<string>(ZERO_STRING);

    const tokenTicker = selectedTokenId.startsWith('WEGLD') ? 'EGLD' : convertTokenIdentifierToTicker(selectedTokenId);

    const presaleRoundTitle = statsContext ? statsContext.current_round_id == 5 ? 'Presale Is Coming'
        : statsContext.current_round_id < 5 ? `Round ${statsContext.current_round_id + 1}`
        : 'Presale Is Finished'
        : 'Presale Is Finished';
    const timerTitle = statsContext ? statsContext.current_round_id == 5 ? 'Presale Starts In'
        : statsContext.current_round_id < 5 ? 'Current Round Ends In'
        : ''
        : '';
    
    const soldAmount = statsContext ? statsContext.current_round_id < 5 ? convertWeiToEsdt(statsContext.sold_amounts[statsContext.current_round_id]).toNumber() : convertWeiToEsdt(statsContext.sold_amounts.reduce((sum, cur) => sum.plus(cur), new BigNumber(0))).toNumber() : 0;
    const saleAmount = statsContext ? statsContext.current_round_id < 5 ? convertWeiToEsdt(parseBigNumber(statsContext.sale_amount_for_current_round).plus(statsContext.sold_amounts[statsContext.current_round_id])).toNumber() : convertWeiToEsdt(statsContext.total_sale_amount).toNumber() : 0;
    const salePercent = soldAmount / saleAmount * 100;

    const requirementsText = statsContext ?
        statsContext.current_round_id == 0 ? '10+ Snake NFT Holders Only'
        : statsContext.current_round_id == 1 ? '1+ Snake NFT Holders Only'
        : statsContext.current_round_id == 2 ? 'DHCD Holders Only'
        : statsContext.current_round_id == 3 ? 'Any Demiourgos Assets Holders'
        : statsContext.current_round_id == 4 ? 'Everyone'
        : '-'
        : '-';
    const roundEndDate = baseContext && statsContext ? statsContext.current_round_id == 5 ? new Date(baseContext.start_timestamp * 1000)
        : statsContext.current_round_id < 5 ? new Date((baseContext.start_timestamp + baseContext.round_lengths.slice(0, statsContext.current_round_id + 1).reduce((sum, v) => sum + v, 0)) * 1000)
        : 0
        : Date.now() + 30_000;
    // console.log('roundEndDate', roundEndDate);

    let receiveText = '';
    if (statsContext && statsContext.current_round_id < 5 && Number(buyQuoteAmount) > 0 && parseBigNumber(priceRate).isPositive() && selectedTokenId) {
        const buyAmount = Number(buyQuoteAmount) / convertWeiToEsdt(priceRate, getTokenDecimals(selectedTokenId)).toNumber();
        if (statsContext.current_round_id == 0) {
            receiveText = `(You will receive ${convertBigNumberToLocalString(buyAmount * 0.025)} EAURYN and ${convertBigNumberToLocalString(buyAmount * 0.975)} Vested EAURYN)`;
        } else if (statsContext.current_round_id == 1) {
            receiveText = `(You will receive ${convertBigNumberToLocalString(buyAmount * 0.05)} EAURYN and ${convertBigNumberToLocalString(buyAmount * 0.95)} Vested EAURYN)`;
        } else if (statsContext.current_round_id == 2) {
            receiveText = `(You will receive ${convertBigNumberToLocalString(buyAmount * 0.07)} EAURYN and ${convertBigNumberToLocalString(buyAmount * 0.93)} Vested EAURYN)`;
        } else if (statsContext.current_round_id == 3) {
            receiveText = `(You will receive ${convertBigNumberToLocalString(buyAmount * 0.04)} AURYN, ${convertBigNumberToLocalString(buyAmount * 0.46)} Vested AURYN), ${convertBigNumberToLocalString(buyAmount * 0.04)} OURO and ${convertBigNumberToLocalString(buyAmount * 0.46)} Vested OURO`;
        } else if (statsContext.current_round_id == 4) {
            receiveText = `(You will receive ${convertBigNumberToLocalString(buyAmount * 0.2)} OURO and ${convertBigNumberToLocalString(buyAmount * 0.8)} Vested OURO)`;
        }
    }

    useEffect(() => {
        (async () => {
            const _baseContext = await viewPresaleBaseContext();
            // console.log('_baseContext', _baseContext);
            setBaseContext(_baseContext);

            // selecte first token
            if (_baseContext) {
                setSelectedTokenId(_baseContext.quote_tokens[0]);
            }
        })();
    }, []);

    useEffect(() => {
        if (hasPendingTransactions) return;

        (async () => {
            const _statsContext = await viewPresaleStatsContext();
            // console.log('_statsContext', _statsContext);
            setStatsContext(_statsContext);
        })();
    }, [hasPendingTransactions]);

    useEffect(() => {
        if (!address || hasPendingTransactions) return;
        
        (async () => {
            const _userContext = await viewPresaleUserContext(address);
            // console.log('_userContext', _userContext);
            setUserContext(_userContext);
        })();
    }, [address, hasPendingTransactions]);

    useEffect(() => {
        if (!selectedTokenId || !address || hasPendingTransactions) return;

        (async () => {
            if (tokenTicker == 'EGLD') {
                setQuoteTokenBalance(convertWeiToEsdt(egldBalance, getTokenDecimals(selectedTokenId), 2).toNumber());
            } else {
                const _balance = await getTokenBalanceFromApi(address, selectedTokenId);
                const _balanceAmount = _balance ? convertWeiToEsdt(_balance.balance, _balance.decimals, 2).toNumber() : 0;
                // console.log('_balanceAmount', _balanceAmount);
                setQuoteTokenBalance(_balanceAmount);
            }
        })();
    }, [selectedTokenId, address, hasPendingTransactions]);

    useEffect(() => {
        if (hasPendingTransactions) return;
        onChangeBuyQuoteAmount(ZERO_STRING);
    }, [hasPendingTransactions]);

    useEffect(() => {
        if (!selectedTokenId) return;

        (async () => {
            const _priceRate = await getCurrentQuotePrice(selectedTokenId);
            // console.log('_priceRate', _priceRate);
            setPriceRate(_priceRate);
        })();
    }, [selectedTokenId]);

    function onChangeBuyQuoteAmount(valueAsString: string) {
        // if (!isPositiveOrZeroBigNumber(valueAsString)) return;
        const value = Number(valueAsString);
        if (value > quoteTokenBalance) {
            toastError(ERROR_NOT_ENOUGH_BALANCE);
            return;
        }
        if (parseBigNumber(priceRate).isPositive() && statsContext && selectedTokenId) {
            const buyAmount = value / convertWeiToEsdt(priceRate, getTokenDecimals(selectedTokenId)).toNumber();
            if (convertEsdtToWei(buyAmount).comparedTo(statsContext.sale_amount_for_current_round) > 0) {
                toastError('Not enough token left for current round');
                return;
            }
        }

        setBuyQuoteAmount(valueAsString);
    }

    function onClickMaxButton() {
        let value = quoteTokenBalance;
        if (parseBigNumber(priceRate).isPositive() && statsContext && selectedTokenId) {
            const v2 = convertWeiToEsdt(statsContext.sale_amount_for_current_round).multipliedBy(convertWeiToEsdt(priceRate, getTokenDecimals(selectedTokenId))).toNumber();
            value = Math.min(value, v2);
        }
        
        onChangeBuyQuoteAmount(value.toString());
    }

    async function onClickBuy() {
        if (!address) {
            toastError(ERROR_CONNECT_WALLET);
            return;
        }
        if (hasPendingTransactions) {
            toastError(ERROR_TRANSACTION_ONGOING);
            return;
        }
        if (!(baseContext && statsContext && userContext && selectedTokenId)) {
            toastError(ERROR_SC_DATA_NOT_LOADED);
            return;
        }
        if (statsContext.current_round_id == 5) {
            toastError('Presale is not started');
            return;
        }
        if (statsContext.current_round_id > 5) {
            toastError('Presale is finished');
            return;
        }
        if (!userContext.can_join_current_round) {
            toastError('You do not meet NFT holding requirements');
            return;
        }
        if (!isPositiveOrZeroBigNumber(buyQuoteAmount)) {
            toastError(ERROR_INVALID_NUMBER);
            return;
        }
        const value = Number(buyQuoteAmount);
        if (value > quoteTokenBalance) {
            toastError(ERROR_NOT_ENOUGH_BALANCE);
            return;
        }
        if (parseBigNumber(priceRate).isPositive() && statsContext && selectedTokenId) {
            const buyAmount = value / convertWeiToEsdt(priceRate, getTokenDecimals(selectedTokenId)).toNumber();
            if (convertEsdtToWei(buyAmount).comparedTo(statsContext.sale_amount_for_current_round) > 0) {
                toastError('Not enough token left for current round');
                return;
            }
        }
        if (statsContext && statsContext.current_round_id == 0 && Number(buyQuoteAmount) > 0 && parseBigNumber(priceRate).isPositive() && selectedTokenId) {
            if (Date.now() < baseContext.start_timestamp * 1000 + 3600 * 1000) {
                const buyAmount = Number(buyQuoteAmount) / convertWeiToEsdt(priceRate, getTokenDecimals(selectedTokenId)).toNumber();
                if (buyAmount > 1000) {
                    toastError('You can only buy $1000 OURO in the first 1 hour');
                    return;
                }
            }
        }

        const payment = TokenTransfer.fungibleFromAmount(
            selectedTokenId,
            value,
            getTokenDecimals(selectedTokenId),
        );
        await presaleBuy(payment);
    }

    function onCompleteCountDown() {
        if (statsContext && statsContext.current_round_id <= 5) {
            location.reload();
        }
    }

    return (
        <>
            <div className="container" style={{ marginTop: '50px' }}>
                <div className='row'>
                    <div className='col-lg-6 col-12 px-2'>
                        <div className="vesta_x_swap_card mb-4">
                            <div className="d-flex justify-content-center align-items-center mt-3">
                                <div
                                    style={{
                                        color: '#F1DC46',
                                        fontSize: '1.5rem',
                                    }}
                                >
                                    Nosferatu NFT Mint
                                </div>
                            </div>

                            <div className='mt-4 text-center px-4' style={{ fontSize: '.9rem', color: '#969696' }}>
                                {"An NFT collection that possesses a 50% stake in the movie titled 'Origins of Terror' featuring Nosferatu."}
                            </div>

                            <div style={{ marginTop: '2rem' }}>
                                <BorderLinearProgress variant="determinate" value={salePercent} />
                            </div>
                            <div className='d-flex justify-content-between mt-2' style={{ fontSize: '.8rem', color: '#969696' }}>
                                <span>{convertBigNumberToLocalString(soldAmount)} {`(${convertBigNumberToLocalString(salePercent, 2)}%)`}</span>
                                <span>{convertBigNumberToLocalString(saleAmount)}</span>
                            </div>

                            <div className='mt-4 text-center px-4' style={{ fontSize: '1rem', color: '#c0b038' }}>
                                {"1400 NFTs of Common, Rare, Epic"}
                            </div>

                            <div className='d-flex justify-content-center mt-3'>
                                <img
                                    src={imgNosferatu}
                                    style={{
                                        width: '90%',
                                        height: 'auto',
                                        borderRadius: '5px',
                                        border: '1px solid #ffffff2f',
                                        padding: '4px',
                                    }}
                                />
                            </div>

                            <div className='presale-label-container mt-4'>
                                <div className="presale-label-row presale-label-border">
                                    <span>Price</span>
                                    <span>13 OURO</span>
                                </div>
                                <div className="presale-label-row presale-label-border">
                                    <span>Balance</span>
                                    <span>{convertBigNumberToLocalString(quoteTokenBalance)} {tokenTicker}</span>
                                </div>
                                <div className="presale-label-row">
                                    <span>You minted</span>
                                    <span>5 NFT(s)</span>
                                </div>
                            </div>

                            <div className='d-flex justify-content-center align-items-center mt-4'>
                                <button
                                    className="mint-number-button"
                                    style={{ marginLeft: '0.1rem' }}
                                >
                                    -
                                </button>
                                <div className='mx-3' style={{ color: '#f0f0f0', fontSize: '1.3rem', fontWeight: 'bold' }}>9</div>
                                <button
                                    className="mint-number-button"
                                    style={{ marginLeft: '0.1rem' }}
                                >
                                    +
                                </button>
                            </div>

                            <div className="d-flex justify-content-center mt-4 mb-2">
                                <button
                                    className="presale-button"
                                    onClick={onClickBuy}
                                >
                                    Mint
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='col-lg-6 col-12 px-2'>
                        <div className="vesta_x_swap_card mb-4">
                            <div className='mt-3' style={{ color: '#F1DC46', fontSize: '1.2rem' }}>Nosferatu NFT</div>
                            <div className="mt-2" style={{ color: '#939da7', fontSize: '.9rem' }}>
                                <div className='mb-2'>
                                    Introducing a remarkable NFT collection, meticulously curated by Demiourgos Holdings, known as &apos;Nosferatu: Origins of Terror.&apos; <br />
                                </div>
                                <div className='mb-2'>
                                    This extraordinary collection comprises a total of 100 Legendaries, 200 Epics, 400 Rares, and 800 Uniques, all of which symbolize a tangible piece of ownership in the movie venture.<br />
                                </div>
                                <div className='mb-2'>
                                    As an exceptional characteristic, each category holds a significant share, contributing one-fourth of the overall 50% stake in the film. <br />
                                </div>
                                <div className='mb-2'>
                                    This groundbreaking endeavor marks Demiourgos Holdings&apos; inaugural cinematic creation, establishing a captivating synergy between NFT artistry and the mesmerizing world of Nosferatu. <br />
                                </div>
                            </div>

                            <div className='mt-5' style={{ color: '#F1DC46', fontSize: '1.1rem' }}>Nosferatu NFTs revenue-sharing structure:</div>
                            <div className="mt-2" style={{ color: '#939da7', fontSize: '.9rem' }}>
                                We offer 50% of all profits generated by the &quot;Origins of Terror&quot; movie, to be allocated to the 1500 NFTs in the collection as follows:

                                <ul>
                                    <li>
                                        100 Legendary NFTs: 12.5% (only via $ouro lottery)
                                    </li>
                                    <li>
                                        200 Epic NFTs: 12.5% 
                                    </li>
                                    <li>
                                        400 Rare NFTs: 12.5% 
                                    </li>
                                    <li>
                                        800 Common NFTs: 12.5%
                                    </li>
                                </ul>

                                These profits are made from: 
                                <ul>
                                    <li>
                                        shared cinema box office profits worldwide
                                    </li>
                                    <li>
                                        shared streaming/TV platform profits worldwide 
                                    </li>
                                    <li>
                                        shared merchandise profits worldwide for Nosferatu cans, t-shirts, hoods, books, posters, drinks, and more. - franchising &quot;Origins of Terror&quot;
                                    </li>
                                </ul>
                            </div>

                            <div className='mt-4 mb-3 text-center' style={{ fontSize: '.95rem', color: '#F1DC46' }}>
                                Embark on an exciting journey as a film investor, a Snake token holder, and an exclusive Nosferatu NFT holder!  Become a part of us!
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Toaster />
        </>
    );
};
