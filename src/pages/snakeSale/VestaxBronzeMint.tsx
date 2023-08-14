import React, { useEffect, useState } from 'react'
import { TokenTransfer } from '@multiversx/sdk-core/out';
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
import {
  VESTAX_BRONZE_COLLECTION,
  VESTAX_BRONZE_NONCE,
  OURO_TOKEN_ID,
  ELITE_ACCOUNT_TIER_NAMES,
} from './config'
import {
  getAccountNftBalanceFromApi,
  getTokenBalanceFromApi,
  vbmGetEliteAccountTier,
  vbmGetMintPrice,
  vbmGetSftReserve,
  vbmMint,
} from './z/elrond'
import {
  convertBigNumberToLocalString,
  convertWeiToEsdt,
  createNftId,
  ERROR_CONNECT_WALLET,
  ERROR_INVALID_NUMBER,
  ERROR_NOT_ENOUGH_BALANCE,
  ERROR_TRANSACTION_ONGOING,
  parseBigNumber,
  toastError,
  ZERO_STRING,
} from './z/utils'
import './vesta_x.css'
import {Col, Row} from "react-bootstrap";

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

export const VestaxBronzeMint = () => {
  const { address } = useGetAccount()
  const { hasPendingTransactions } = useGetPendingTransactions()

  const [leftCount, setLeftCount] = useState<number>(0);
  const [price, setPrice] = useState<string>(ZERO_STRING);

  const [quoteTokenBalance, setQuoteTokenBalance] = useState<string>(ZERO_STRING);

  const [mintCount, setMintCount] = useState<number>(1);
  const [nftBalance, setNftBalance] = useState<number>(0);
  const [eliteAccountTier, setEliteAccountTier] = useState<number>(0)
  // console.log('selectedPrice', selectedPrice);
  // console.log('quoteTokenBalance', quoteTokenBalance);

  function onChangeMintCount(value: number) {
    if (value <= 0) {
      toastError(ERROR_INVALID_NUMBER);
      return;
    }
    if (value > leftCount) {
      toastError(`You cannot mint more than ${leftCount} SFTs.`);
      return;
    }
    setMintCount(value)
  }

  useEffect(() => {
    if (!address) return;

    (async () => {
      const _price = await vbmGetMintPrice(address);
      console.log('_price', _price);
      setPrice(_price);
    })();

    (async () => {
      const _eat = await vbmGetEliteAccountTier(address);
      console.log('eliteAccountTier', _eat);
      setEliteAccountTier(_eat);
    })();
  }, [address])

  useEffect(() => {
    if (hasPendingTransactions) return;

    (async () => {
      const _leftCount = await vbmGetSftReserve();
      console.log('_leftCount', _leftCount);
      setLeftCount(_leftCount)
    })()
  }, [hasPendingTransactions])

  useEffect(() => {
    if (!address || hasPendingTransactions) return;

    (async () => {
      const _nftBalance = await getAccountNftBalanceFromApi(
        address,
        createNftId(VESTAX_BRONZE_COLLECTION, VESTAX_BRONZE_NONCE),
      );
      console.log('_nftBalance', _nftBalance);
      setNftBalance(_nftBalance);
    })();

    (async () => {
      const _balance = await getTokenBalanceFromApi(address, OURO_TOKEN_ID)
      console.log('_balance', _balance);
      if (_balance) {
        setQuoteTokenBalance(_balance.balance);
      }
    })()
  }, [address, hasPendingTransactions])

  async function onClickBuy() {
    if (!address) {
      toastError(ERROR_CONNECT_WALLET)
      return
    }
    if (hasPendingTransactions) {
      toastError(ERROR_TRANSACTION_ONGOING)
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
    if (parseBigNumber(mintCount).multipliedBy(price).isGreaterThan(quoteTokenBalance)) {
      toastError(ERROR_NOT_ENOUGH_BALANCE)
      return
    }

    const payment = TokenTransfer.fungibleFromBigInteger(
      OURO_TOKEN_ID,
      parseBigNumber(mintCount).multipliedBy(price),
    );

    await vbmMint(payment);
  }

  const totalCount = 4000;
  const mintStartTimestamp = 1687280400000;
  return (
    <>
      <div className="container" style={{ marginTop: '25px' }}>
        <Row>
          <Col xs={12} md={{offset: 3, span: 6}} className="px-2 d-flex justify-content-center">
            <div className="vesta_x_swap_card mb-4">
              <div className="d-flex justify-content-center align-items-center mt-3">
                <div
                  style={{
                    color: '#F1DC46',
                    fontSize: '1.5rem',
                  }}
                >
                  VestaX Bronze Mint
                </div>
              </div>
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
                <video
                  autoPlay
                  loop
                  muted
                  style={{
                    width: '90%',
                    height: 'auto',
                    borderRadius: '5px',
                    border: '1px solid #ffffff2f',
                    padding: '4px',
                  }}
                >
                  <source src="/bronze.mp4" type="video/mp4" />
                </video>
              </div>

              <div className="presale-label-container mt-4">
                <div className="presale-label-row presale-label-border">
                  <span>Elite Account Tier</span>
                  <span>
                    {Math.max(eliteAccountTier - 1, 0)}
                    {eliteAccountTier > 1 ? `: ${ELITE_ACCOUNT_TIER_NAMES[eliteAccountTier]}` : ''}
                  </span>
                </div>
                <div className="presale-label-row presale-label-border">
                  <span>Price</span>
                  <span>
                    {convertBigNumberToLocalString(convertWeiToEsdt(price).multipliedBy(mintCount))}
                    {' '}OURO
                  </span>
                </div>
                <div className="presale-label-row presale-label-border">
                  <span>Balance</span>
                  <span>
                    {convertBigNumberToLocalString(convertWeiToEsdt(quoteTokenBalance))}
                    {' '}OURO
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

                <input
                  type="number"
                  className='ms-3'
                  style={{
                    width: '4rem',
                    padding: '0rem .2rem',
                    textAlign: 'right',
                    fontSize: '1rem',
                  }}
                  value={mintCount}
                  onChange={(event) => onChangeMintCount(Number(event.target.value))}
                />
              </div>

              <div className="d-flex justify-content-center mt-4 mb-2">
                <button className="presale-button" onClick={onClickBuy} disabled={Date.now() < mintStartTimestamp}>
                  Mint
                </button>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <Toaster />
    </>
  )
}
