import React, { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { Toaster } from 'react-hot-toast'
import { InputBase, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import LinearProgress, {
  linearProgressClasses,
} from '@mui/material/LinearProgress'
import { styled } from '@mui/material/styles'
import {
  useGetAccount,
  useGetPendingTransactions,
} from '@multiversx/sdk-dapp/hooks'
import Countdown from 'react-countdown'
import { USDC_DECIMALS, USDC_TOKEN_ID, getTokenDecimals } from './config'
import {
  getAccountNftCountByCollection,
  getMintedSnakes,
  getSnakeCollection,
  getSnakeLeftCount,
  getSnakePriceMap,
  getTokenBalanceFromApi,
  snakeBuy,
} from './z/elrond'
import {
  applyPrecision,
  convertBigNumberToLocalString,
  convertEsdtToWei,
  convertTokenIdentifierToTicker,
  convertWeiToEsdt,
  DEFAULT_DECIMALS,
  ERROR_CONNECT_WALLET,
  ERROR_INVALID_NUMBER,
  ERROR_NOT_ENOUGH_BALANCE,
  ERROR_SC_DATA_NOT_LOADED,
  ERROR_TRANSACTION_ONGOING,
  isPositiveOrZeroBigNumber,
  parseBigNumber,
  sleep,
  toastError,
  ZERO_STRING,
} from './z/utils'
import './vesta_x.css'
import { TokenTransfer } from '@multiversx/sdk-core/out'
import imgSnake from './nft.png'
import { PriceType } from './z/types'
import SelectInput from '@mui/material/Select/SelectInput'
import { setTokenLogin } from '@multiversx/sdk-dapp/reduxStore/slices'

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
}))

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
  },
}))

// Renderer callback with condition
const countdownRenderer = ({
  days,
  hours,
  minutes,
  seconds,
  completed,
}: {
  days: number
  hours: number
  minutes: number
  seconds: number
  completed: boolean
}) => {
  return (
    <div className="presale-timer-container text-center mt-3">
      <strong>
        <span className="presale-timer-box p-2 me-2">
          {String(days).padStart(2, '0')}
        </span>
        <span className="presale-timer-box p-2 me-2">
          {String(hours).padStart(2, '0')}
        </span>
        <span className="presale-timer-box p-2 me-2">
          {String(minutes).padStart(2, '0')}
        </span>
        <span className="presale-timer-box p-2 me-2">
          {String(seconds).padStart(2, '0')}
        </span>
      </strong>
    </div>
  )
}

export const SnakeMint = () => {
  const { address, balance: egldBalance } = useGetAccount()
  const { hasPendingTransactions } = useGetPendingTransactions()

  const [collection, setCollection] = useState<string>('')
  const [leftCount, setLeftCount] = useState<number>(0)
  const [prices, setPrices] = useState<PriceType[]>([])

  const [quoteTokenBalance, setQuoteTokenBalance] = useState<number>(0)

  const [selectedTokenId, setSelectedTokenId] = useState<string>('')
  const [selectedPrice, setSelectedPrice] = useState<number>(0)
  const [mintCount, setMintCount] = useState<number>(1)
  const [nftBalance, setNftBalance] = useState<number>(0)
  // console.log('selectedPrice', selectedPrice);
  // console.log('quoteTokenBalance', quoteTokenBalance);

  const tokenTicker = selectedTokenId.startsWith('WEGLD')
    ? 'EGLD'
    : convertTokenIdentifierToTicker(selectedTokenId)
  const totalCount = 200

  function onChangeMintCount(value: number) {
    if (hasPendingTransactions) return
    if (value <= 0) return
    if (value > leftCount) return
    setMintCount(value)
  }

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
    if (completed) {
        return (<></>);
    } else {
        return (
            <div className="presale-timer-container text-center mt-4">
                <strong>
                    <span className="presale-timer-box p-2 me-2">{String(days).padStart(2, '0')}</span>
                    <span className="presale-timer-box p-2 me-2">{String(hours).padStart(2, '0')}</span>
                    <span className="presale-timer-box p-2 me-2">{String(minutes).padStart(2, '0')}</span>
                    <span className="presale-timer-box p-2 me-2">{String(seconds).padStart(2, '0')}</span>
                </strong>
            </div>
        );
    }
};

  useEffect(() => {
    (async () => {
      const _collection = await getSnakeCollection()
      // console.log('_collection', _collection);
      setCollection(_collection)
    })()
    ;(async () => {
      const _prices = await getSnakePriceMap()
      // console.log('_prices', _prices);
      setPrices(_prices)
    })()
  }, [])

  useEffect(() => {
    if (prices.length > 0) {
      setSelectedTokenId(prices[0].identifier)
    }
  }, [prices])
  useEffect(() => {
    if (selectedTokenId && prices.length > 0) {
      for (const price of prices) {
        if (price.identifier == selectedTokenId) {
          setSelectedPrice(convertWeiToEsdt(price.price, USDC_DECIMALS).toNumber())
          return
        }
      }
    }
    setSelectedPrice(0)
  }, [selectedTokenId])

  useEffect(() => {
    if (hasPendingTransactions) return
    ;(async () => {
      const _leftCount = await getSnakeLeftCount()
      // console.log('_leftCount', _leftCount);
      setLeftCount(_leftCount)
      console.log('left', _leftCount);
    })()
  }, [hasPendingTransactions])

  useEffect(() => {
    if (!collection || !address || hasPendingTransactions) return
    ;(async () => {
      const _nftCount = await getMintedSnakes(
        address
      )
      // console.log('_nftCount', _nftCount);
      setNftBalance(_nftCount)
    })()
  }, [collection, address, hasPendingTransactions])

  useEffect(() => {
    if (!selectedTokenId || !address || hasPendingTransactions) return
    ;(async () => {
      const _balance = await getTokenBalanceFromApi(address, selectedTokenId)
      const _balanceAmount = _balance
        ? convertWeiToEsdt(_balance.balance, _balance.decimals, 2).toNumber()
        : 0
      // console.log('_balanceAmount', _balanceAmount);
      setQuoteTokenBalance(_balanceAmount)
    })()
  }, [selectedTokenId, address, hasPendingTransactions])

  // useEffect(() => {
  //     if (hasPendingTransactions) return;
  //     onChangeBuyQuoteAmount(ZERO_STRING);
  // }, [hasPendingTransactions]);

  // useEffect(() => {
  //     if (!selectedTokenId) return;

  //     (async () => {
  //         const _priceRate = await getCurrentQuotePrice(selectedTokenId);
  //         // console.log('_priceRate', _priceRate);
  //         setPriceRate(_priceRate);
  //     })();
  // }, [selectedTokenId]);

  // function onChangeBuyQuoteAmount(valueAsString: string) {
  //     // if (!isPositiveOrZeroBigNumber(valueAsString)) return;
  //     const value = Number(valueAsString);
  //     if (value > quoteTokenBalance) {
  //         toastError(ERROR_NOT_ENOUGH_BALANCE);
  //         return;
  //     }
  //     if (parseBigNumber(priceRate).isPositive() && statsContext && selectedTokenId) {
  //         const buyAmount = value / convertWeiToEsdt(priceRate, getTokenDecimals(selectedTokenId)).toNumber();
  //         if (convertEsdtToWei(buyAmount).comparedTo(statsContext.sale_amount_for_current_round) > 0) {
  //             toastError('Not enough token left for current round');
  //             return;
  //         }
  //     }

  //     setBuyQuoteAmount(valueAsString);
  // }

  // function onClickMaxButton() {
  //     let value = quoteTokenBalance;
  //     if (parseBigNumber(priceRate).isPositive() && statsContext && selectedTokenId) {
  //         const v2 = convertWeiToEsdt(statsContext.sale_amount_for_current_round).multipliedBy(convertWeiToEsdt(priceRate, getTokenDecimals(selectedTokenId))).toNumber();
  //         value = Math.min(value, v2);
  //     }

  //     onChangeBuyQuoteAmount(value.toString());
  // }

  async function onClickBuy() {
    if (!address) {
      toastError(ERROR_CONNECT_WALLET)
      return
    }
    if (hasPendingTransactions) {
      toastError(ERROR_TRANSACTION_ONGOING)
      return
    }
    if (!selectedTokenId) {
      toastError(ERROR_SC_DATA_NOT_LOADED)
      return
    }
    if (mintCount <= 0) {
      toastError(ERROR_INVALID_NUMBER)
      return
    }
    if (mintCount > leftCount) {
      toastError('Not enough NFTs left')
      return
    }

    if (mintCount * selectedPrice > quoteTokenBalance) {
      toastError(ERROR_NOT_ENOUGH_BALANCE)
      return
    }

    const payment = TokenTransfer.fungibleFromAmount(
      USDC_TOKEN_ID,
      mintCount * selectedPrice,
      USDC_DECIMALS,
    )

    await snakeBuy(payment, mintCount)
  }

  // function onCompleteCountDown() {
  //     if (statsContext && statsContext.current_round_id <= 5) {
  //         location.reload();
  //     }
  // }
  function onCompleteCountDown() {
    location.reload();
  }
  const mintStartTimestamp = 1687280400000;
  return (
    <>
      <div className="container" style={{ marginTop: '25px' }}>
        <div className="row">
          <div className="col-lg-12 col-12 px-2 d-flex justify-content-center">
            <div className="vesta_x_swap_card mb-4 w-50">
              <div className="d-flex justify-content-center align-items-center mt-3">
                <div
                  style={{
                    color: '#F1DC46',
                    fontSize: '1.5rem',
                  }}
                >
                  Snake NFT Mint
                </div>
              </div>
              <Countdown renderer={countdownRenderer} date={mintStartTimestamp} onComplete={onCompleteCountDown} autoStart />
              <div style={{ marginTop: '2rem' }}>
                <BorderLinearProgress
                  variant="determinate"
                  value={((totalCount - leftCount) / totalCount) * 100}
                />
              </div>
              <div
                className="d-flex justify-content-between mt-2"
                style={{ fontSize: '.8rem', color: '#969696' }}
              >
                <span>
                  {convertBigNumberToLocalString(totalCount - leftCount)}{' '}
                  {`(${convertBigNumberToLocalString(
                    ((totalCount - leftCount) / totalCount) * 100,
                    2,
                  )}%)`}
                </span>
                <span>{convertBigNumberToLocalString(totalCount)}</span>
              </div>

              <div className="d-flex justify-content-center mt-3">
                <img
                  src={imgSnake}
                  style={{
                    width: '90%',
                    height: 'auto',
                    borderRadius: '5px',
                    border: '1px solid #ffffff2f',
                    padding: '4px',
                  }}
                />
              </div>

              <div className="presale-label-container mt-4">
                <div className="presale-label-row presale-label-border">
                  <span>Price</span>
                  <span>
                    {prices
                      .map(
                        (price) =>
                          `${convertBigNumberToLocalString(
                            convertWeiToEsdt(price.price, USDC_DECIMALS),
                          )} ${price.ticker}`,
                      )
                      .join(' or ')}
                  </span>
                </div>
                <div className="presale-label-row presale-label-border">
                  <span>Balance</span>
                  <span>
                    {convertBigNumberToLocalString(quoteTokenBalance)}{' '}
                    {tokenTicker}
                  </span>
                </div>
                <div className="presale-label-row">
                  <span>You minted</span>
                  <span>
                    {nftBalance > 1
                      ? `${nftBalance} NFTs`
                      : `${nftBalance} NFT`}{' '}
                  </span>
                </div>
              </div>

              <div className="d-flex justify-content-center align-items-center mt-4">
                <button
                  className="mint-number-button"
                  style={{ marginLeft: '0.1rem' }}
                  onClick={() => onChangeMintCount(mintCount - 1)}
                >
                  -
                </button>
                <div
                  className="mx-3"
                  style={{
                    color: '#f0f0f0',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                  }}
                >
                  {mintCount}
                </div>
                <button
                  className="mint-number-button"
                  style={{ marginLeft: '0.1rem' }}
                  onClick={() => onChangeMintCount(mintCount + 1)}
                >
                  +
                </button>

                {/* <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={selectedTokenId}
                  label="Age"
                  onChange={(event: SelectChangeEvent) => {
                    if (hasPendingTransactions) return
                    setSelectedTokenId(event.target.value)
                  }}
                  input={<BootstrapInput />}
                >
                  {prices.length > 0 &&
                    prices.map((price, index) => (
                      <MenuItem key={index} value={price.identifier}>
                        {price.ticker}
                      </MenuItem>
                    ))}
                </Select> */}
              </div>

              <div className="d-flex justify-content-center mt-4 mb-2">
                <button className="presale-button" onClick={onClickBuy} disabled={Date.now() < mintStartTimestamp}>
                  Mint
                </button>
              </div>
            </div>
          </div>
          {/* <div className="col-lg-6 col-12 px-2">
            <div className="vesta_x_swap_card mb-4">
              <div
                className="mt-3"
                style={{ color: '#F1DC46', fontSize: '1.2rem' }}
              >
                Nosferatu NFT
              </div>
              <div
                className="mt-2"
                style={{ color: '#939da7', fontSize: '.9rem' }}
              >
                <div className="mb-2">
                  Introducing a remarkable NFT collection, meticulously curated
                  by Demiourgos Holdings, known as &apos;Nosferatu: Origins of
                  Terror.&apos; <br />
                </div>
                <div className="mb-2">
                  This extraordinary collection comprises a total of 100
                  Legendaries, 200 Epics, 400 Rares, and 800 Uniques, all of
                  which symbolize a tangible piece of ownership in the movie
                  venture.
                  <br />
                </div>
                <div className="mb-2">
                  As an exceptional characteristic, each category holds a
                  significant share, contributing one-fourth of the overall 50%
                  stake in the film. <br />
                </div>
                <div className="mb-2">
                  This groundbreaking endeavor marks Demiourgos Holdings&apos;
                  inaugural cinematic creation, establishing a captivating
                  synergy between NFT artistry and the mesmerizing world of
                  Nosferatu. <br />
                </div>
              </div>

              <div
                className="mt-5"
                style={{ color: '#F1DC46', fontSize: '1.1rem' }}
              >
                Nosferatu NFTs revenue-sharing structure:
              </div>
              <div
                className="mt-2"
                style={{ color: '#939da7', fontSize: '.9rem' }}
              >
                We offer 50% of all profits generated by the &quot;Origins of
                Terror&quot; movie, to be allocated to the 1500 NFTs in the
                collection as follows:
                <ul>
                  <li>100 Legendary NFTs: 12.5% (only via $ouro lottery)</li>
                  <li>200 Epic NFTs: 12.5%</li>
                  <li>400 Rare NFTs: 12.5%</li>
                  <li>800 Common NFTs: 12.5%</li>
                </ul>
                These profits are made from:
                <ul>
                  <li>shared cinema box office profits worldwide</li>
                  <li>shared streaming/TV platform profits worldwide</li>
                  <li>
                    shared merchandise profits worldwide for Nosferatu cans,
                    t-shirts, hoods, books, posters, drinks, and more. -
                    franchising &quot;Origins of Terror&quot;
                  </li>
                </ul>
              </div>

              <div
                className="mt-4 mb-3 text-center"
                style={{ fontSize: '.95rem', color: '#F1DC46' }}
              >
                Embark on an exciting journey as a film investor, a Snake token
                holder, and an exclusive Nosferatu NFT holder! Become a part of
                us!
              </div>
            </div>
          </div> */}
        </div>
      </div>

      <Toaster />
    </>
  )
}
