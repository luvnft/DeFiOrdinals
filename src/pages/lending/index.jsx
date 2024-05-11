import { Principal } from "@dfinity/principal";
import {
  Col,
  Collapse,
  Divider,
  Flex,
  Grid,
  Input,
  Row,
  Skeleton,
  Typography,
} from "antd";
import { BottomSheet } from "react-spring-bottom-sheet";
import React, { useEffect, useState } from "react";
import { BiShowAlt } from "react-icons/bi";
import { FaCaretDown } from "react-icons/fa";
import { GoInfo } from "react-icons/go";
import { GrConnect } from "react-icons/gr";
import { HiOutlineInformationCircle } from "react-icons/hi2";
import ThreeDots from "react-loading-icons/dist/esm/components/three-dots";
import { Link } from "react-router-dom";
import MagicEden from "../../assets/brands/magiceden.svg";
import Bitcoin from "../../assets/coin_logo/ckbtc.png";
import CustomButton from "../../component/Button";
import Loading from "../../component/loading-wrapper/secondary-loader";
import ModalDisplay from "../../component/modal";
import Notify from "../../component/notification";
import WalletConnectDisplay from "../../component/wallet-error-display";
import { propsContainer } from "../../container/props-container";
import { setLoading } from "../../redux/slice/constant";
import {
  API_METHODS,
  IS_USER,
  apiUrl,
  daysCalculator,
} from "../../utils/common";
import { PiShareBold } from "react-icons/pi";

const Dashboard = (props) => {
  /* global BigInt */
  const { api_agent, ckBtcAgent, ckBtcActorAgent } = props.wallet;
  const { reduxState, dispatch, isPlugError } = props.redux;
  const activeWallet = reduxState.wallet.active;

  const walletState = reduxState.wallet;
  const btcValue = reduxState.constant.btcvalue;
  let plugAddress = walletState.plug.principalId;

  const xverseAddress = walletState.xverse.ordinals.address;
  const unisatAddress = walletState.unisat.address;
  const magicEdenAddress = walletState.magicEden.ordinals.address;

  const { Text } = Typography;
  const { useBreakpoint } = Grid;
  const breakpoints = useBreakpoint();

  // USE STATE
  const [lendData, setLendData] = useState(null);
  const [sheetData, setSheetData] = useState({});
  const [bottomSheet, setIsBottomSheet] = useState(false);
  const [loadingState, setLoadingState] = useState({
    isApproveBtn: false,
    isSupplyBtn: false,
    isLendCkbtcBtn: false,
    isBorrowData: false,
    isLendData: false,
    isWithdrawBtn: false,
    isRepayBtn: false,
    isAssetSupplies: false,
    isAssetWithdraw: false,
  });

  const [ckBtcRaw, setCkBtcRaw] = useState(0);
  const [lendTransferModal, setLendTransferModal] = useState(false);
  const [lendTransferData, setLendTransferData] = useState({
    floor: 0,
    assetId: "",
    halfFloor: 0,
    repayment_amount: 0,
    principal: undefined,
    inscriptionNumber: undefined,
    mimeType: undefined,
  });

  const [screenDimensions, setScreenDimensions] = React.useState({
    width: window.screen.width,
    height: window.screen.height,
  });

  const [askIds, setAskIds] = useState([]);

  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;
  const CONTENT_API = process.env.REACT_APP_ORDINALS_CONTENT_API;
  const WAHEED_ADDRESS = process.env.REACT_APP_WAHEED_ADDRESS;

  // COMPONENTS & FUNCTIONS
  const getScreenDimensions = (e) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    setScreenDimensions({ width, height });
  };

  const handleOk = () => {
    setLendTransferModal(false);
  };

  const handleCancel = () => {
    setLendTransferModal(false);
  };

  // API FUNCTIONS ---------------------------------------------------

  const getCollectionDetails = async (filteredData) => {
    const isFromApprovedAssets = filteredData.map(async (asset) => {
      return new Promise(async (resolve, reject) => {
        const result = await API_METHODS.get(
          `${apiUrl.Asset_server_base_url}/api/v1/fetch/asset/${asset.id}`
        );
        resolve({
          ...result.data,
          ...asset,
        });
      });
    });

    const revealedPromise = await Promise.all(isFromApprovedAssets);
    const finalAssets = revealedPromise.filter((asset) => asset.success);
    const fetchCollectionDetails = finalAssets.map(async (asset) => {
      return new Promise(async (resolve, reject) => {
        const result = await API_METHODS.get(
          `${apiUrl.Asset_server_base_url}/api/v1/fetch/collection/${asset.data.collectionName}`
        );
        resolve({
          ...result.data.data,
          ...asset,
        });
      });
    });
    const finalPromise = await Promise.all(fetchCollectionDetails);
    return finalPromise;
  };

  const handleLendAssetTransfer = async () => {
    let result;
    const transferArgs = {
      to: {
        owner: lendTransferData.principal,
        subaccount: [],
      },
      fee: [],
      memo: [],
      created_at_time: [],
      from_subaccount: [],
      amount: BigInt(lendTransferData.floor),
    };
    try {
      if (
        lendTransferData.principal &&
        lendTransferData.floor &&
        lendTransferData.assetId &&
        plugAddress &&
        (xverseAddress || unisatAddress || magicEdenAddress)
      ) {
        setLoadingState((prev) => ({ ...prev, isLendCkbtcBtn: true }));
        if (ckBtcAgent) {
          result = await ckBtcAgent.icrc1_transfer(transferArgs);
        } else {
          Notify("warning", "Reconnect the plug wallet to process!");
        }
        setLoadingState((prev) => ({ ...prev, isLendCkbtcBtn: false }));

        if (result?.Ok) {
          setLendTransferModal(false);
          Notify("success", "Lending successful!");
          dispatch(setLoading(true));
          await api_agent.setActiveLending(Principal.fromText(plugAddress), {
            transaction_id: Number(result.Ok).toString(),
            borrower_principal: lendTransferData.principal,
            lender_principal: Principal.fromText(plugAddress),
            loan_amount: lendTransferData.floor,
            repayment_amount: Math.round(lendTransferData.repayment_amount),
            asset_id: lendTransferData.assetId,
            timestamp: Date.now(),
            inscriptionid: lendTransferData.inscriptionNumber,
            mime_type: lendTransferData.mimeType,
          });
          dispatch(setLoading(false));

          getLendRequest();
          fetchUserSupplies();
        } else {
          const err = Object.keys(result.Err)[0];
          if (err.includes("InsufficientFunds")) {
            Notify(
              "error",
              `${err} balance is ${
                Number(result.Err.InsufficientFunds.balance) / BTC_ZERO
              }`
            );
          } else {
            Notify("error", "Something went wrong!");
          }
        }
      } else {
        Notify("error", "Connect wallets or some data missing!");
      }
    } catch (error) {
      setLoadingState((prev) => ({ ...prev, isLendCkbtcBtn: false }));
      dispatch(setLoading(false));
      // console.log("Lend Asset Transfet Error", error);
    }
  };

  const fetchUserSupplies = async () => {
    try {
      setLoadingState((prev) => ({ ...prev, isAssetSupplies: true }));

      // Fetching particular user's ask request.
      const getRequest = await api_agent.getAskRequest(
        IS_USER
          ? xverseAddress
            ? xverseAddress
            : unisatAddress
            ? unisatAddress
            : magicEdenAddress
          : WAHEED_ADDRESS
      );

      const getRequestData = getRequest.map((data) => {
        return JSON.parse(data.asset_details);
      });

      const getRequestId = getRequestData.map((data) => {
        return data.id;
      });
      setAskIds(getRequestId);
      setLoadingState((prev) => ({ ...prev, isAssetSupplies: false }));
    } catch (error) {
      // console.log("error", error);
      setLoadingState((prev) => ({ ...prev, isAssetSupplies: false }));
    }
  };

  // USeEFFECT DATA FETCHING ---------------------------------------------------

  useEffect(() => {
    window.addEventListener("resize", getScreenDimensions);

    return () => {
      window.removeEventListener("resize", getScreenDimensions);
    };
  });

  const fetchBtcAssetBalance = async () => {
    let ckBtcBalance = await ckBtcActorAgent.icrc1_balance_of({
      owner: Principal.fromText(plugAddress),
      subaccount: [],
    });

    if (Number(ckBtcBalance) < 99) {
      ckBtcBalance = 0;
    }

    setCkBtcRaw(Number(ckBtcBalance));
  };

  const getLendRequest = async () => {
    try {
      setLoadingState((prev) => ({ ...prev, isLendData: true }));

      // Fetching successfully lended assets
      const getActiveLendReq = await api_agent.getAllActiveLendings();

      const lendActiveIds = getActiveLendReq.map((array) => array[1]);

      // Fetching all asked request for lending
      const getLoanReq = await api_agent.getAllAskRequests();

      // Filtering assets which are already lended by any user and we hide the assets for user.
      const filteredData = getLoanReq.filter(
        (data) => !lendActiveIds.includes(data[0])
      );

      const loanData = filteredData.map((data) => {
        return {
          ...data[1],
          ...JSON.parse(data[1].asset_details),
        };
      });

      const finalPromise = await getCollectionDetails(loanData);
      let obj_ = {};
      // console.log("finalPromise", finalPromise);
      finalPromise.forEach((asset) => {
        obj_ = {
          ...obj_,
          [asset.id]: asset,
        };
      });

      const dataWithFloor = loanData.map((asset) => {
        let floorAsset = obj_[asset.id];
        if (asset.id === floorAsset?.id) {
          return { floorAsset, ...asset };
        } else {
          return asset;
        }
      });
      // console.log("dataWithFloor", dataWithFloor);
      if (dataWithFloor.length) {
        setLendData(dataWithFloor);
      } else {
        setLendData([]);
      }

      setLoadingState((prev) => ({ ...prev, isLendData: false }));
    } catch (error) {
      // console.log("error", error);
      setLoadingState((prev) => ({ ...prev, isLendData: false }));
    }
  };

  // Fetching lend details
  useEffect(() => {
    (async () => {
      getLendRequest();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api_agent, unisatAddress, xverseAddress, magicEdenAddress]);

  useEffect(() => {
    (async () => {
      if (api_agent && (xverseAddress || unisatAddress || magicEdenAddress)) {
        fetchUserSupplies();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api_agent, xverseAddress, unisatAddress, magicEdenAddress]);

  // Fetching ckBtc asset balance
  useEffect(() => {
    if (plugAddress && ckBtcAgent) {
      fetchBtcAssetBalance();
    }
    return () => clearInterval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ckBtcAgent, plugAddress]);

  useEffect(() => {
    if (activeWallet.length === 0) {
      // setLendData([]);
      setLendTransferData({
        floor: 0,
        assetId: "",
        halfFloor: 0,
        repayment_amount: 0,
        principal: undefined,
        inscriptionNumber: undefined,
        mimeType: undefined,
      });
    }
  }, [activeWallet]);

  const CardDetailsRender = ({ data }) => {
    return (
      <>
        <Row align={"middle"} justify={"space-between"}>
          {data.isXs && (
            <Col xs={24}>
              <Row justify={"end"}>
                {data?.floorAsset?.data?.collectionName && (
                  <Link
                    target="_blank"
                    to={`https://magiceden.io/ordinals/marketplace/${data?.floorAsset?.data?.collectionName}`}
                  >
                    <PiShareBold size={20} color="violet" />
                  </Link>
                )}
              </Row>
            </Col>
          )}

          <Col className="m-top-bottom" xs={24} md={24} lg={5}>
            <Row
              justify={{
                xs: "center",
                md: "center",
                xl: "center",
                sm: "center",
              }}
            >
              <Col>
                {data?.mimeType &&
                  (data?.mimeType.includes("text/html") ? (
                    <iframe
                      title="lend_image"
                      height={300}
                      src={`${CONTENT_API}/content/${data?.id}`}
                    />
                  ) : (
                    <img
                      src={`${CONTENT_API}/content/${data?.id}`}
                      alt={`modal_lend_image`}
                      width={
                        data.isXs
                          ? 75
                          : screenDimensions.width > 1023
                          ? 225
                          : 175
                      }
                      className="cardrelative border-radius-30 mt-7"
                    />
                  ))}
              </Col>
            </Row>
          </Col>

          <Col
            className="mt-15 details-bg card-one"
            xs={24}
            md={24}
            lg={10}
            style={{ padding: "10px 0px" }}
          >
            <Row justify={"space-around"}>
              <Col>
                <Row
                  className={`${
                    data.isXs ? "font-xmsmall" : "font-size-20"
                  } text-color-two `}
                >
                  Inscription
                </Row>
                <Row
                  className={`${
                    data.isXs ? "font-xmsmall" : "font-size-20"
                  } text-color-two mt`}
                >
                  Loan Amount
                </Row>
                <Row
                  className={`${
                    data.isXs ? "font-xmsmall" : "font-size-20"
                  } text-color-two mt`}
                >
                  Loan Due
                </Row>
                <Row
                  className={`${
                    data.isXs ? "font-xmsmall" : "font-size-20"
                  } text-color-two mt`}
                >
                  Interest Rate
                </Row>
                <Row
                  className={`${
                    data.isXs ? "font-xmsmall" : "font-size-20"
                  } text-color-two mt`}
                >
                  Lender Profit
                </Row>
                <Row
                  className={`${
                    data.isXs ? "font-xmsmall" : "font-size-20"
                  } text-color-two mt`}
                >
                  Platform fee
                </Row>
                <Row
                  className={`${
                    data.isXs ? "font-xmsmall" : "font-size-20"
                  } text-color-two mt`}
                >
                  Repayment
                </Row>
              </Col>
              <Col>
                <Row
                  className={`${
                    data.isXs ? "font-xmsmall" : "font-size-20"
                  } text-color-one `}
                >
                  #{data.inscriptionNumber}
                </Row>
                <Row
                  className={`${
                    data.isXs ? "font-xmsmall" : "font-size-20"
                  } text-color-one mt iconalignment`}
                >
                  {(data.loanAmount / BTC_ZERO).toFixed(8)}
                  <img
                    src={Bitcoin}
                    alt="noimage"
                    width={breakpoints.xs ? "15dvw" : "35dvw"}
                    height={breakpoints.xs && "15px"}
                  />
                </Row>
                <Row
                  className={`${
                    data.isXs ? "font-xmsmall" : "font-size-20"
                  } text-color-one mt`}
                >
                  {daysCalculator().date_time}
                </Row>
                <Row
                  className={`${
                    data.isXs ? "font-xmsmall" : "font-size-20"
                  } text-color-one mt`}
                >
                  5% APR
                </Row>
                <Row
                  className={`${
                    data.isXs ? "font-xmsmall" : "font-size-20"
                  } text-color-one mt iconalignment`}
                >
                  {data.profit}
                  <img
                    src={Bitcoin}
                    alt="noimage"
                    width={breakpoints.xs ? "15dvw" : "35dvw"}
                    height={breakpoints.xs && "15px"}
                  />
                </Row>
                <Row
                  className={`${
                    data.isXs ? "font-xmsmall" : "font-size-20"
                  } text-color-one mt iconalignment`}
                >
                  1 %
                  <img
                    src={Bitcoin}
                    alt="noimage"
                    width={breakpoints.xs ? "15dvw" : "35dvw"}
                    height={breakpoints.xs && "15px"}
                  />
                </Row>
                <Row
                  className={`${
                    data.isXs ? "font-xmsmall" : "font-size-20"
                  } text-color-one mt iconalignment`}
                >
                  {data.repayment_amount}
                  <img
                    src={Bitcoin}
                    alt="noimage"
                    width={breakpoints.xs ? "15dvw" : "35dvw"}
                    height={breakpoints.xs && "15px"}
                  />
                </Row>
              </Col>
            </Row>
          </Col>

          <Col
            xs={24}
            lg={7}
            md={24}
            className={`text-align text-color-one m-top-bottom ${
              data.isXs ? "font-xsmall" : "font-medium"
            } letter-spacing-medium-one`}
          >
            <GoInfo /> IF THE BORROWER DOES NOT REPAY, YOU'LL GET THEIR
            COLLATERAL.
          </Col>
        </Row>
        {data.isXs && (
          <Row justify={"center"}>
            {!askIds.includes(data.id) && activeWallet.length > 1 && (
              <CustomButton
                className={"click-btn font-weight-600 letter-spacing-small"}
                title="Lend"
                block
                size="middle"
                onClick={() => {
                  if ((data.floorPrice / BTC_ZERO).toFixed(8) < ckBtcRaw + 10) {
                    setLendTransferModal(true);
                    setIsBottomSheet(false);
                    setLendTransferData({
                      floor: data.floorPrice,
                      assetId: data.id,
                      principal: data.principal,
                      repayment_amount: data.repayment_amount * BTC_ZERO,
                      inscriptionNumber: data.inscriptionNumber,
                      mimeType: data.mimeType,
                    });
                  } else {
                    Notify(
                      "warning",
                      "You don't have enough balance to process."
                    );
                  }
                }}
              />
            )}
            {!activeWallet.length && (
              <span className="text-color-one grey-bg pad-5 border-radius-5 font-small letter-spacing-small">
                Connect wallet to continue
              </span>
            )}
          </Row>
        )}
      </>
    );
  };

  const panelStyle = {
    marginBottom: 24,
    background: "black",
    borderRadius: "20px",
    border: "1px solid #6c6c6c",
  };

  const priceAnalyser = (floorAsset, obj) => {
    const floorPrice = floorAsset?.floorPrice
      ? Number(floorAsset?.floorPrice)
      : Number(obj.floorPrice);
    const debt = floorAsset?.repaymentAmount
      ? Number(floorAsset?.repaymentAmount)
      : Number(obj.repaymentAmount);
    const profit = floorAsset?.interestAmount
      ? Number(floorAsset?.interestAmount)
      : Number(obj.interestAmount);
    return {
      floorPrice,
      debt,
      profit,
    };
  };

  const collapseItems = (obj) => {
    const { floorAsset } = obj;
    const { floorPrice, debt, profit } = priceAnalyser(floorAsset, obj);

    return {
      key: `lend-col-${obj.timestamp}`,
      style: panelStyle,
      label: (
        <Row justify={"space-between"} align={"middle"}>
          <Col xs={0} sm={0} md={2}>
            {obj.mimeType?.includes("text/html") ? (
              <iframe
                className="border-radius-30"
                title={`${obj.inscriptionNumber}-lend_image`}
                height={70}
                width={70}
                src={`${CONTENT_API}/content/${obj.id}`}
              />
            ) : (
              <img
                src={`${CONTENT_API}/content/${obj.id}`}
                alt={`${obj.inscriptionNumber}-lend_image`}
                className="border-radius-30"
                width={screenDimensions.width > 880 ? 70 : 50}
                height={screenDimensions.width > 880 ? 70 : 50}
              />
            )}
          </Col>

          <Col xs={24} sm={24} md={21} lg={21} xl={22}>
            <div
              style={{
                display: screenDimensions.width < 880 ? "flex" : "block",
                flexDirection:
                  screenDimensions.width < 880 ? "column" : "unset",
              }}
            >
              <Flex
                align="center"
                justify="space-between"
                className="grey-bg pad-10 border-radius-15"
              >
                {!breakpoints.md && (
                  <div>
                    {obj.mimeType?.includes("text/html") ? (
                      <iframe
                        className="border-radius-30"
                        title={`${obj.inscriptionNumber}-lend_image`}
                        height={70}
                        width={70}
                        src={`${CONTENT_API}/content/${obj.id}`}
                      />
                    ) : (
                      <img
                        src={`${CONTENT_API}/content/${obj.id}`}
                        alt={`${obj.inscriptionNumber}-lend_image`}
                        className="border-radius-30"
                        width={screenDimensions.width > 880 ? 70 : 50}
                        height={screenDimensions.width > 880 ? 70 : 50}
                      />
                    )}
                  </div>
                )}
                <Flex vertical align="center">
                  <span className="font-xsmall text-color-one letter-spacing-small">
                    {obj?.floorAsset?.data?.collectionName
                      ? obj?.floorAsset?.data.collectionName.toUpperCase()
                      : "--"}
                  </span>
                  <span className="font-xmsmall text-color-two letter-spacing-small">
                    #{obj.inscriptionNumber}
                  </span>
                </Flex>

                {screenDimensions.width > 880 && (
                  <Flex gap={35} align="center">
                    <Flex vertical align="center">
                      <span className="text-color-one font-xsmall letter-spacing-small">
                        Floor price
                      </span>
                      <span className="text-color-two font-xmsmall letter-spacing-small">
                        {(floorPrice / BTC_ZERO).toFixed(8)}
                      </span>
                    </Flex>

                    <Text className="font-medium color-grey">/</Text>

                    <Flex vertical align="center">
                      <span className="text-color-one font-xsmall letter-spacing-small">
                        Debt{" "}
                      </span>
                      <span className="text-color-two font-xmsmall letter-spacing-small">
                        {debt}
                      </span>
                    </Flex>

                    <Text className="font-medium color-grey">/</Text>

                    <Flex vertical align="center">
                      <span className="text-color-one font-xsmall letter-spacing-small">
                        Profit{" "}
                      </span>
                      <span className="text-color-two font-xmsmall letter-spacing-small">
                        {profit}
                      </span>
                    </Flex>
                  </Flex>
                )}

                <Row justify={"end"}>
                  <Flex
                    align="center"
                    className="card grey-bg pad-10"
                    style={{ flexDirection: "row" }}
                    gap={25}
                  >
                    {obj.data?.collectionName && activeWallet.length > 1 ? (
                      <Link
                        target="_blank"
                        to={`https://magiceden.io/ordinals/marketplace/${obj.data?.collectionName}`}
                      >
                        <img
                          src={MagicEden}
                          width={"50px"}
                          alt="magic_eden"
                          className="pointer"
                        />
                      </Link>
                    ) : (
                      ""
                    )}
                    {!askIds.includes(obj.id) && activeWallet.length > 1 && (
                      <CustomButton
                        className={
                          "click-btn font-weight-600 letter-spacing-small"
                        }
                        title="Lend"
                        size="middle"
                        onClick={() => {
                          if (
                            (floorPrice / BTC_ZERO).toFixed(8) <
                            ckBtcRaw + 10
                          ) {
                            setLendTransferModal(true);
                            setLendTransferData({
                              floor: floorPrice,
                              assetId: obj.id,
                              principal: obj.principal,
                              repayment_amount: debt * BTC_ZERO,
                              inscriptionNumber: obj.inscriptionNumber,
                              mimeType: obj.mimeType,
                            });
                          } else {
                            Notify(
                              "warning",
                              "You don't have enough balance to process."
                            );
                          }
                        }}
                      />
                    )}
                    {activeWallet.length > 1 ? (
                      ""
                    ) : (
                      <span className="text-color-one font-xsmall letter-spacing-small">
                        {screenDimensions.width > 880 ? (
                          "Connect wallet"
                        ) : (
                          <GrConnect size={20} />
                        )}
                      </span>
                    )}
                  </Flex>
                </Row>
              </Flex>

              {screenDimensions.width < 880 && (
                <Flex
                  gap={35}
                  justify="space-between"
                  className="mt-7"
                  align="center"
                >
                  <Flex vertical align="center">
                    <span className="text-color-one font-xsmall letter-spacing-small">
                      Floor price
                    </span>
                    <span className="text-color-two font-xmsmall letter-spacing-small">
                      {(floorPrice / BTC_ZERO).toFixed(8)}
                    </span>
                  </Flex>

                  <Text className="font-medium color-grey">/</Text>

                  <Flex vertical align="center">
                    <span className="text-color-one font-xsmall letter-spacing-small">
                      Debt{" "}
                    </span>
                    <span className="text-color-two font-xmsmall letter-spacing-small">
                      {debt}
                    </span>
                  </Flex>

                  <Text className="font-medium color-grey">/</Text>

                  <Flex vertical align="center">
                    <span className="text-color-one font-xsmall letter-spacing-small">
                      Profit{" "}
                    </span>
                    <span className="text-color-two font-xmsmall letter-spacing-small">
                      {profit}
                    </span>
                  </Flex>
                </Flex>
              )}
            </div>
          </Col>
        </Row>
      ),
      children: (
        <CardDetailsRender
          data={{
            ...obj,
            loanAmount: floorPrice,
            repayment_amount: debt,
            isXs: false,
            floorPrice,
            profit,
          }}
        />
      ),
    };
  };

  return (
    <>
      <Row justify={"space-between"} align={"middle"}>
        <Col>
          <h1 className="font-xlarge gradient-text-one">Lending</h1>
        </Col>
      </Row>

      {!isPlugError ? (
        <Row justify={"space-between"} className=" m-bottom" gutter={32}>
          <Col xs={24}>
            {lendData === null ? (
              <>
                {["", "", "", ""].map((data) => {
                  return (
                    <div className="card grey-one-bg pad-15 m-bottom">
                      <Skeleton.Avatar
                        className="m-bottom"
                        active
                        size={"large"}
                        shape={"circle"}
                      />
                      <Skeleton.Input block active size={"large"} />
                    </div>
                  );
                })}
              </>
            ) : screenDimensions.width >= 440 ? (
              <div className="collapse-antd-two">
                <>
                  <Collapse
                    className="pad-bottom-30"
                    size="large"
                    bordered={false}
                    collapsible={
                      screenDimensions.width >= 440 ? "icon" : "disabled"
                    }
                    defaultActiveKey={false}
                    accordion
                    destroyInactivePanel
                    expandIcon={({ isActive }) => (
                      <>
                        {screenDimensions.width >= 440 ? (
                          <FaCaretDown
                            color={isActive ? "#c572ef" : "#6c6c6c"}
                            size={25}
                            style={{
                              transform: isActive ? "" : "rotate(-90deg)",
                              transition: "0.5s ease",
                            }}
                          />
                        ) : (
                          <BiShowAlt size={25} color="violet" />
                        )}
                      </>
                    )}
                    items={lendData.map((data) => {
                      return collapseItems(data);
                    })}
                  />
                </>
              </div>
            ) : (
              <>
                {lendData.map((obj) => {
                  const { floorAsset } = obj;
                  const { floorPrice, debt, profit } = priceAnalyser(
                    floorAsset,
                    obj
                  );
                  return (
                    <>
                      <Row className="bg-black pad-inline pad-10 border-radius-15 m-bottom">
                        <Col xs={24} sm={0}>
                          <Flex align="center" justify="space-between">
                            {obj.mimeType?.includes("text/html") ? (
                              <iframe
                                className="border-radius-30"
                                title={`${obj.inscriptionNumber}-lend_image`}
                                height={70}
                                width={70}
                                src={`${CONTENT_API}/content/${obj.id}`}
                              />
                            ) : (
                              <img
                                src={`${CONTENT_API}/content/${obj.id}`}
                                alt={`${obj.inscriptionNumber}-lend_image`}
                                className="border-radius-30"
                                width={50}
                              />
                            )}
                            <Flex vertical align="center">
                              <span className="font-xsmall text-color-one letter-spacing-small">
                                {obj?.floorAsset?.data?.collectionName
                                  ? obj?.floorAsset?.data.collectionName.toUpperCase()
                                  : "--"}
                              </span>
                              <span className="font-xmsmall text-color-two letter-spacing-small">
                                #{obj.inscriptionNumber}
                              </span>
                            </Flex>

                            <span className="text-color-one font-xsmall letter-spacing-small">
                              <BiShowAlt
                                size={20}
                                color="violet"
                                onClick={() => {
                                  setIsBottomSheet(true);
                                  setSheetData({
                                    ...obj,
                                    loanAmount: floorPrice,
                                    repayment_amount: debt,
                                    isXs: true,
                                    floorPrice,
                                    profit,
                                  });
                                }}
                              />
                            </span>
                          </Flex>
                        </Col>

                        <Col xs={24} md={0}>
                          <Row justify={"center"} className="divider-m-small">
                            <Divider style={{ margin: "10px !important" }} />
                          </Row>
                        </Col>

                        <Col
                          xs={24}
                          sm={0}
                          className="grey-bg pad-5 border-radius-15"
                        >
                          <Flex gap={10} justify="space-between" align="center">
                            <Flex vertical align="center">
                              <span className="text-color-one font-xsmall letter-spacing-small">
                                Floor price
                              </span>
                              <span className="text-color-two font-xmsmall letter-spacing-small">
                                {(floorPrice / BTC_ZERO).toFixed(8)}
                              </span>
                            </Flex>

                            <Text className="font-medium color-grey">/</Text>

                            <Flex vertical align="center">
                              <span className="text-color-one font-xsmall letter-spacing-small">
                                Debt{" "}
                              </span>
                              <span className="text-color-two font-xmsmall letter-spacing-small">
                                {debt}
                              </span>
                            </Flex>

                            <Text className="font-medium color-grey">/</Text>

                            <Flex vertical align="center">
                              <span className="text-color-one font-xsmall letter-spacing-small">
                                Profit{" "}
                              </span>
                              <span className="text-color-two font-xmsmall letter-spacing-small">
                                {profit}
                              </span>
                            </Flex>
                          </Flex>
                        </Col>
                      </Row>
                    </>
                  );
                })}
              </>
            )}
          </Col>
        </Row>
      ) : (
        <WalletConnectDisplay isPlugError={isPlugError} />
      )}

      {breakpoints.xs && (
        <BottomSheet
          open={bottomSheet}
          snapPoints={(props) => {
            const { maxHeight } = props;
            return [505, maxHeight];
          }}
          onDismiss={() => setIsBottomSheet(false)}
        >
          <CardDetailsRender data={sheetData} />
        </BottomSheet>
      )}

      {/* Lend ckBTC Transfer Modal */}
      <ModalDisplay
        title={
          <Row className="black-bg white-color font-large">Lend ckBTC</Row>
        }
        open={lendTransferModal}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={null}
        width={breakpoints.xs ? "90%" : "25%"}
      >
        <Flex vertical>
          <Text className="text-color-two font-small iconalignment">
            Amount <HiOutlineInformationCircle />
          </Text>
          <Input
            readOnly
            style={{ fontSize: breakpoints.xs ? "15px" : "20px" }}
            value={(lendTransferData.floor / BTC_ZERO).toFixed(8)}
            suffix={
              <Flex vertical align="end">
                <span className="text-color-one font-small iconalignment font-weight-600">
                  <img
                    src={Bitcoin}
                    alt="noimage"
                    style={{ justifyContent: "center" }}
                    width="30dvw"
                  />
                </span>
              </Flex>
            }
          />
        </Flex>

        <Flex align="center" gap={5}>
          <span className="text-color-two">Value of</span>
          {lendTransferData.floor !== null ? (
            <>
              <span className="text-color-one font-xsmall letter-spacing-small">
                $
                {(
                  (lendTransferData.floor / BTC_ZERO).toFixed(8) * btcValue
                ).toFixed(2)}
              </span>
            </>
          ) : (
            <Loading
              spin={!lendTransferData.floor}
              indicator={
                <ThreeDots stroke="#6a85f1" alignmentBaseline="central" />
              }
            />
          )}
        </Flex>

        <Row className="mt-15">
          <Text
            className={`text-color-two ${
              breakpoints.xs ? "font-xmsmall" : "font-small"
            } `}
          >
            Transaction overview
          </Text>
        </Row>

        <Flex vertical className="border-color">
          <Row justify={"space-between"}>
            <Col>
              <Text
                className={`text-color-one ${
                  breakpoints.xs ? "font-xmsmall" : "font-small"
                } `}
              >
                Due at
              </Text>
            </Col>
            <Col xs={11}>
              <label
                className={`text-color-one ${
                  breakpoints.xs ? "font-xmsmall" : "font-small"
                } `}
              >
                7 days from now
              </label>
            </Col>
          </Row>
          <Row justify={"space-between"}>
            <Col>
              <Text
                className={`text-color-one ${
                  breakpoints.xs ? "font-xmsmall" : "font-small"
                } `}
              >
                Maturity amount
              </Text>
            </Col>
            <Col xs={11}>
              <label
                className={`text-color-one ${
                  breakpoints.xs ? "font-xmsmall" : "font-small"
                } `}
              >
                <Flex vertical>
                  {(lendTransferData.repayment_amount / BTC_ZERO).toFixed(8)}{" "}
                  <div>
                    <label style={{ lineHeight: "0px !important" }}>
                      &#91;${" "}
                      {(
                        (lendTransferData.repayment_amount / BTC_ZERO).toFixed(
                          8
                        ) * btcValue
                      ).toFixed(2)}
                      &#93;
                    </label>
                  </div>
                </Flex>
              </label>
            </Col>
          </Row>
          <Row justify={"space-between"}>
            <Col>
              <Text
                className={`text-color-one ${
                  breakpoints.xs ? "font-xmsmall" : "font-small"
                } `}
              >
                Collateralization
              </Text>
            </Col>
            <Col xs={11}>
              <Text
                className={`text-color-one ${
                  breakpoints.xs ? "font-xmsmall" : "font-small"
                } `}
              >
                Enabled
              </Text>
            </Col>
          </Row>
        </Flex>

        <Flex vertical className={"modalBoxGreenShadow mt"}>
          <Row justify={"space-between"}>
            <Col className={"iconalignment"}>
              <HiOutlineInformationCircle />
              <span>You are lending ckBTC for an asset!</span>
            </Col>
          </Row>
        </Flex>

        <>
          <CustomButton
            loading={loadingState.isLendCkbtcBtn}
            className={
              "font-weight-600 mt width font-small letter-spacing-small d-flex-all-center"
            }
            title={
              <Flex align="center" justify="center" gap={5}>
                <span>Lend ckBTC</span>
                <img
                  src={Bitcoin}
                  alt="noimage"
                  style={{ justifyContent: "center" }}
                  width="25dvw"
                />
              </Flex>
            }
            onClick={handleLendAssetTransfer}
          />
        </>
      </ModalDisplay>
    </>
  );
};
export default propsContainer(Dashboard);
