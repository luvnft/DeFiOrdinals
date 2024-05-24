import { Principal } from "@dfinity/principal";
import {
  Badge,
  Col,
  Collapse,
  Divider,
  Dropdown,
  Flex,
  Input,
  Popconfirm,
  Row,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import _ from "lodash";
import Aptos from "../../assets/wallet-logo/aptos_logo.png";
import axios from "axios";
import { load } from "cheerio";
import React, { useEffect, useState } from "react";
import { BiInfoSquare } from "react-icons/bi";
import {
  FaCaretDown,
  FaExternalLinkSquareAlt,
  FaRegSmileWink,
  FaTruck,
} from "react-icons/fa";
import { FaJetFighterUp } from "react-icons/fa6";
import { FcApproval } from "react-icons/fc";
import { GoInfo } from "react-icons/go";
import { HiOutlineInformationCircle } from "react-icons/hi2";
import { ImSad } from "react-icons/im";
import { IoWarningSharp } from "react-icons/io5";
import {
  MdContentCopy,
  MdDashboardCustomize,
  MdLockClock,
  MdOutlineCurrencyBitcoin,
} from "react-icons/md";
import { PiMagicWandFill } from "react-icons/pi";
import { RiInformationFill } from "react-icons/ri";
import { Bars } from "react-loading-icons";
import ThreeDots from "react-loading-icons/dist/esm/components/three-dots";
import { Link } from "react-router-dom";
import Bitcoin from "../../assets/coin_logo/ckbtc.png";
import CustomButton from "../../component/Button";
import Loading from "../../component/loading-wrapper/secondary-loader";
import ModalDisplay from "../../component/modal";
import Notify from "../../component/notification";
import TableComponent from "../../component/table";
import WalletConnectDisplay from "../../component/wallet-error-display";
import { propsContainer } from "../../container/props-container";
import { setLoading } from "../../redux/slice/constant";
import {
  API_METHODS,
  Capitalaize,
  DateTimeConverter,
  IS_USER,
  MAGICEDEN_WALLET_KEY,
  PLUG_WALLET_KEY,
  UNISAT_WALLET_KEY,
  XVERSE_WALLET_KEY,
  apiUrl,
  calculateFee,
  daysCalculator,
  sliceAddress,
} from "../../utils/common";

const NumericInput = (props) => {
  const { onChange, data, placeholder } = props;

  const handleChange = (e) => {
    const { value: inputValue } = e.target;
    const reg = data.asset === "ckETH" ? /^\d*(\.\d{0,3})?$/ : /^\d*(\.\d*)?$/;
    if (reg.test(inputValue) || inputValue === "") {
      onChange(inputValue);
    }
  };

  return (
    <Input
      {...props}
      size="large"
      className="inputStyle"
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
};

const Dashboard = (props) => {
  const { api_agent, ckBtcAgent, ckEthAgent, withdrawAgent } = props.wallet;
  const { reduxState, dispatch, isPlugError } = props.redux;
  const activeWallet = reduxState.wallet.active;

  const walletState = reduxState.wallet;
  const btcValue = reduxState.constant.btcvalue;
  const aptosvalue = reduxState.constant.aptosvalue;
  let plugAddress = walletState.plug.principalId;
  const collection = reduxState.constant.collection;

  const xverseAddress = walletState.xverse.ordinals.address;
  const unisatAddress = walletState.unisat.address;
  const magicEdenAddress = walletState.magicEden.ordinals.address;
  const martinAddress = walletState.martin.address;

  const MEMPOOL_API = process.env.REACT_APP_MEMPOOL_API;

  const { Text } = Typography;

  // USE STATE
  const [borrowData, setBorrowData] = useState(null);
  const [lendData, setLendData] = useState([]);
  const [askModal, setAskModal] = useState(false);
  const [userActiveLendData, setUserActiveLendData] = useState(null);

  const [copy, setCopy] = useState("Copy");
  const [value, setValue] = useState(null);

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
    isAskBtn: false,
  });

  const [ckBtcBalance, setCkBtcBalance] = useState(null);

  const [supplyItems, setSupplyItems] = useState(null);
  const [assetSupplies, setAssetSupplies] = useState(null);
  const [assetSuppliesFloor, setAssetSuppliesFloor] = useState({});
  const [assetWithdrawStatus, setAssetWithdrawStatus] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lendCardDetails, setCardDetails] = useState({});
  const [isLendModalOpen, setIsLendModalOpen] = useState(false);
  const [handleSupplyModal, setHandleSupplyModal] = useState(false);
  const [repayCanisterModal, setRepayCanisterModal] = useState(false);

  const [showIframe, setShowIframe] = useState({
    isDisplay: false,
    src: "",
  });
  const [assetToSupplyModalDetails, setAssetToSupplyModalDetails] = useState({
    asset: "",
    balance: "",
    img: "",
    isAllowance: false,
    ckBtcAllowance: 0,
    ckEthAllowance: 0,
  });
  const [withdrawModalData, setWithdrawModalData] = useState({
    asset: "",
    balance: "",
  });

  const [repayCanisterData, setRepayCanisterData] = useState({
    assetId: "",
    repayment_amount: 0,
    due_at: 0,
    lendData: {},
  });

  const [assetWithdrawModal, setAssetWithdrawModal] = useState(false);
  const [assetWithdrawModalData, setAssetWithdrawModalData] = useState({});
  const [activeFee, setActiveFee] = useState("High");
  const [askModalData, setAskModalData] = useState({
    loanAmount: null,
    repaymentAmount: 0,
    interestAmount: null,
  });

  const [screenDimensions, setScreenDimensions] = React.useState({
    width: window.screen.width,
    height: window.screen.height,
  });

  const [askIds, setAskIds] = useState([]);
  const [loopCount, setLoopCount] = useState(0);
  const [borrowedAssetIds, setBorrowedAssetIds] = useState(null);
  const [userPaymentIds, setUserPaymentIds] = useState([]);

  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;
  const CONTENT_API = process.env.REACT_APP_ORDINALS_CONTENT_API;
  const WAHEED_ADDRESS = process.env.REACT_APP_WAHEED_ADDRESS;
  const PLUG_CUSTODY_ADDRESS = process.env.REACT_APP_PLUG_CUSTODY_ADDRESS;
  const ORDINAL_CANISTER = process.env.REACT_APP_ORDINAL_CANISTER_ID;

  // COMPONENTS & FUNCTIONS
  const handleLendModalOk = () => {
    setIsLendModalOpen(false);
  };

  const handleLendModalCancel = () => {
    setIsLendModalOpen(false);
  };

  const getScreenDimensions = (e) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    setScreenDimensions({ width, height });
  };

  if (borrowData !== null) {
    borrowData.sort((a, b) => {
      return a.inscriptionNumber - b.inscriptionNumber;
    });
  }

  if (lendData.length !== 0) {
    lendData.sort((a, b) => {
      return a.inscriptionNumber - b.inscriptionNumber;
    });
  }

  const handleAskModalInput = (e) => {
    const value = e.target.value;
    let dotRegex = /\./;
    const interestAmount = (5 / 100) * value;
    const repayment = interestAmount + Number(value);
    setAskModalData({
      ...askModalData,
      loanAmount: value,
      repaymentAmount: repayment.toString().match(dotRegex)
        ? repayment.toFixed(6)
        : repayment,
      interestAmount: interestAmount.toString().match(dotRegex)
        ? interestAmount.toFixed(6)
        : interestAmount,
    });
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setHandleSupplyModal(false);
    setAssetWithdrawModal(false);
    setRepayCanisterModal(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setHandleSupplyModal(false);
    setValue(null);
    setAssetWithdrawModal(false);
    setRepayCanisterModal(false);
    setAskModal(false);
    setActiveFee("High");
    setShowIframe({
      isDisplay: false,
      src: "",
    });
    setAskModalData({
      ...askModalData,
      loanAmount: null,
      interestAmount: null,
      repaymentAmount: 0,
    });
  };

  const options = [
    {
      key: "1",
      label: (
        <CustomButton
          className={"click-btn font-weight-600 letter-spacing-small"}
          title={"Details"}
          size="medium"
          onClick={() => setIsModalOpen(true)}
        />
      ),
    },
  ];

  // API FUNCTIONS ---------------------------------------------------

  const getCollectionDetails = async (filteredData) => {
    try {
      const isFromApprovedAssets = filteredData.map(async (asset) => {
        return new Promise(async (resolve, reject) => {
          const result = await API_METHODS.get(
            `${apiUrl.Asset_server_base_url}/api/v2/fetch/asset/${asset.id}`
          );
          resolve(...result.data?.data?.tokens);
        });
      });
      const revealedPromise = await Promise.all(isFromApprovedAssets);
      let collectionSymbols = {};
      collection.forEach(
        (collection) =>
          (collectionSymbols = {
            ...collectionSymbols,
            [collection.symbol]: collection,
          })
      );
      const collectionNames = collection.map((collection) => collection.symbol);
      const isFromApprovedCollections = revealedPromise.filter((assets) =>
        collectionNames.includes(assets.collectionSymbol)
      );

      const finalPromise = isFromApprovedCollections.map((asset) => {
        const collection = collectionSymbols[asset.collectionSymbol];
        return {
          ...asset,
          collection,
        };
      });
      return finalPromise;
    } catch (error) {
      console.log("getCollectionDetails error", error);
    }
  };

  const fetchWalletAssets = async (address) => {
    try {
      const result = await API_METHODS.get(
        `${apiUrl.Asset_server_base_url}/api/v1/fetch/assets/${address}`
      );
      if (result.data.data.length) {
        // const filteredData = result.data.data.filter(
        //   (asset) =>
        //     asset.mimeType === "text/html" ||
        //     asset.mimeType === "image/webp" ||
        //     asset.mimeType === "image/jpeg" ||
        //     asset.mimeType === "image/png" ||
        //     asset.mimeType === "image/svg+xml"
        // );
        const finalPromise = await getCollectionDetails(result.data.data);
        return finalPromise;
      }
    } catch (error) {
      console.log("error", error);
      setLoadingState((prev) => ({ ...prev, isBorrowData: false }));
    }
  };

  const fetchCkBtcBalance = async () => {
    try {
      const ckBtcBalance = await api_agent.getckBTCBalance(
        Principal.fromText(plugAddress)
      );
      if (Number(ckBtcBalance) > 99) {
        setCkBtcBalance(Number(ckBtcBalance) / BTC_ZERO);
      } else {
        setCkBtcBalance(0);
      }
    } catch (error) {
      // console.log("Fetch ckBtc Balance error", error);
    }
  };

  const handleSupplyAssetWithdraw = async () => {
    try {
      const feeValue =
        activeFee === "High"
          ? assetWithdrawModalData.fastestFee.toString()
          : activeFee === "Medium"
          ? assetWithdrawModalData.halfHourFee.toString()
          : value;
      const fee = calculateFee(assetWithdrawModalData.contentLength, feeValue);
      setLoadingState((prev) => ({ ...prev, isAssetWithdraw: true }));

      if (activeFee === "Custom" && !feeValue) {
        Notify("warning", "Please select or input the fee!");
        setLoadingState((prev) => ({ ...prev, isAssetWithdraw: false }));
        return;
      }
      const transferArgs = {
        to: {
          owner: Principal.fromText(ORDINAL_CANISTER),
          subaccount: [],
        },
        fee: [],
        memo: [],
        created_at_time: [],
        from_subaccount: [],
        amount: 1n,
      };

      setLoadingState((prev) => ({ ...prev, isRepayBtn: true }));
      const transferResult = await ckBtcAgent.icrc1_transfer(transferArgs);
      if (transferResult?.Ok) {
        const args = {
          transaction_id: transferResult.Ok.toString(),
          fee_rate: parseInt(feeValue),
          timestamp: Date.now(),
          bitcoinAddress: assetWithdrawModalData.recipient,
          priority: activeFee,
          asset_id: assetWithdrawModalData.id,
          calculated_fee: parseInt(fee),
        };

        const withdrawRes = await api_agent.addWithDrawAssetsRequest(args);
        if (withdrawRes) {
          Notify("sucess", "Withdraw request sent, wait untill process!");
          setAssetWithdrawModal(false);
          fetchUserSupplies();
        } else {
          Notify("error", "Something went wrong!");
        }
      }
      setLoadingState((prev) => ({ ...prev, isAssetWithdraw: false }));
    } catch (error) {
      setLoadingState((prev) => ({ ...prev, isAssetWithdraw: false }));
      // console.log("Asset Withdraw Error", error);
    }
  };

  const handleLendWithdraw = async (data) => {
    try {
      dispatch(setLoading(true));
      const result = await withdrawAgent.withDrawProfit(
        data.asset_id,
        plugAddress
      );
      dispatch(setLoading(false));

      if (result) {
        Notify("success", "Withdraw successful!");
      } else {
        Notify("error", "failed to withdraw!");
      }
      getLendRequest();
      fetchUserSupplies();
    } catch (error) {
      dispatch(setLoading(false));
      // console.log("handleLendWithdraw error", error);
    }
  };

  const handleRepayToCanister = async () => {
    let repayResult;
    const transferArgs = {
      to: {
        owner: Principal.fromText(ORDINAL_CANISTER),
        subaccount: [],
      },
      fee: [],
      memo: [],
      created_at_time: [],
      from_subaccount: [],
      amount: repayCanisterData.repayment_amount,
    };

    try {
      setLoadingState((prev) => ({ ...prev, isRepayBtn: true }));
      if (ckBtcAgent) {
        repayResult = await ckBtcAgent.icrc1_transfer(transferArgs);
      } else {
        Notify("warning", "Reconnect the plug wallet to process!");
      }
      setLoadingState((prev) => ({ ...prev, isRepayBtn: false }));

      const repaymentArgs = {
        lenddata: repayCanisterData.lendData,
        repayment_transaction_id: Number(repayResult.Ok).toString(),
        timestamp: Date.now(),
        bitcoinAddress: IS_USER
          ? xverseAddress
            ? xverseAddress
            : unisatAddress
            ? unisatAddress
            : magicEdenAddress
          : WAHEED_ADDRESS,
        repayment_amount: repayCanisterData.repayment_amount,
        asset_id: repayCanisterData.assetId,
      };

      if (repayResult?.Ok) {
        setRepayCanisterModal(false);
        Notify("success", "Repayment successfull!");

        try {
          dispatch(setLoading(true));
          await api_agent.setRepayment(
            repayCanisterData.assetId,
            repaymentArgs
          );

          getLendRequest();
          fetchUserSupplies();

          dispatch(setLoading(false));
        } catch (error) {
          // console.log("Repayment error", error);
        }
      }
    } catch (error) {
      setLoadingState((prev) => ({ ...prev, isRepayBtn: false }));
      dispatch(setLoading(false));
    }
  };

  const fetchCkBtcAllowance = async () => {
    let allowanceResult;
    const allowanceArg = {
      spender: {
        owner: Principal.fromText(ORDINAL_CANISTER),
        subaccount: [],
      },
      account: {
        owner: Principal.fromText(plugAddress),
        subaccount: [],
      },
    };

    try {
      if (ckBtcAgent) {
        allowanceResult = await ckBtcAgent.icrc2_allowance(allowanceArg);
      } else {
        Notify("warning", "Reconnect the plug wallet to process!");
      }

      if (Number(allowanceResult.allowance) > 0) {
        setAssetToSupplyModalDetails((prev) => ({
          ...prev,
          isAllowance: true,
          ckBtcAllowance: Number(allowanceResult.allowance),
        }));
      }
    } catch (error) {
      Notify("error", error.message);
    }
  };

  const fetchCkEthAllowance = async () => {
    let allowanceResult;
    const allowanceArg = {
      spender: {
        owner: Principal.fromText(ORDINAL_CANISTER),
        subaccount: [],
      },
      account: {
        owner: Principal.fromText(plugAddress),
        subaccount: [],
      },
    };

    try {
      if (ckEthAgent) {
        allowanceResult = await ckEthAgent.icrc2_allowance(allowanceArg);
      } else {
        Notify("warning", "Reconnect the plug wallet to process!");
      }
      if (Number(allowanceResult.allowance) > 0) {
        setAssetToSupplyModalDetails((prev) => ({
          ...prev,
          isAllowance: true,
          ckEthAllowance: Number(allowanceResult.allowance),
        }));
      }
    } catch (error) {
      Notify("error", error.message);
    }
  };

  const fetchUserSupplies = async () => {
    try {
      setLoadingState((prev) => ({ ...prev, isAssetSupplies: true }));

      // Getting users supplies from canister, which user send to custody address.
      const supplies = await api_agent.getUserSupply(
        IS_USER
          ? xverseAddress
            ? xverseAddress
            : unisatAddress
            ? unisatAddress
            : magicEdenAddress
          : WAHEED_ADDRESS
      );
      console.log("supplies", supplies);
      if ((plugAddress || martinAddress) && api_agent) {
        // Fetching asset id's which all are user lended.
        const getUsersBorrow = await api_agent.getUserBorrows(
          IS_USER
            ? Principal.fromText(
                plugAddress || martinAddress
                // "o2lff-sae6t-dvphr-tzeqm-uhynr-fnt5q-tks35-dh32k-rjapn-pedje-oae"
              )
            : Principal.fromText(process.env.REACT_APP_PLUG_CUSTODY_ADDRESS)
        );

        let borrowIds = {};
        getUsersBorrow.forEach((asset) => {
          borrowIds[asset.asset_id] = asset;
        });
        setBorrowedAssetIds(borrowIds);
      }

      const withdrawStatus = await api_agent.getAllAssetStatus();
      let obj = {};

      // Get transaction ID
      const transactionIds = withdrawStatus.map((data) => {
        const [id, status] = data;
        return new Promise(async (res) => {
          const result = await api_agent.getTransaction(id);
          res({
            status,
            id: id,
            txid: result,
          });
        });
      });

      const tx_array = await Promise.all(transactionIds);

      tx_array.forEach((req) => {
        obj = {
          ...obj,
          [req.id]: req,
        };
      });

      setAssetWithdrawStatus(obj);

      setLoadingState((prev) => ({ ...prev, isAssetSupplies: false }));

      const supplyData = supplies.map((asset) => JSON.parse(asset));

      if (supplyData.length) {
        const resultWithFloor = await getCollectionDetails(supplyData);

        let obj_one = {};
        resultWithFloor.forEach((data) => {
          obj_one[data.id] = data.collection;
        });
        setAssetSuppliesFloor(obj_one);
        setAssetSupplies(supplyData);
      } else {
        setAssetSupplies([]);
      }
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

  // Fetching BTC & ETH Balance
  useEffect(() => {
    if (api_agent && plugAddress) {
      fetchCkBtcBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api_agent, plugAddress]);

  // Fetching User's All Assets
  useEffect(() => {
    (async () => {
      if (
        api_agent &&
        (activeWallet.includes(XVERSE_WALLET_KEY) ||
          activeWallet.includes(UNISAT_WALLET_KEY) ||
          activeWallet.includes(MAGICEDEN_WALLET_KEY)) &&
        collection[0]?.symbol &&
        loopCount < 2
      ) {
        setLoopCount(loopCount + 1);
        setLoadingState((prev) => ({ ...prev, isBorrowData: true }));
        const result = await fetchWalletAssets(
          IS_USER
            ? xverseAddress
              ? xverseAddress
              : unisatAddress
              ? unisatAddress
              : magicEdenAddress
            : WAHEED_ADDRESS
        );

        const uniqueData = result?.filter(
          (obj, index, self) =>
            index ===
            self.findIndex((o) => o.collectionSymbol === obj.collectionSymbol)
        );
        console.log("uniqueData", uniqueData);

        uniqueData?.length ? setBorrowData(uniqueData) : setBorrowData([]);
        setLoadingState((prev) => ({ ...prev, isBorrowData: false }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet, api_agent, dispatch, collection]);

  const getLendRequest = async () => {
    try {
      setLoadingState((prev) => ({ ...prev, isLendData: true }));

      if (plugAddress && api_agent) {
        // Fetching a particular users's lending
        const getUserLendReq = await api_agent.getUserLending(
          IS_USER
            ? Principal.fromText(plugAddress)
            : Principal.fromText(process.env.REACT_APP_PLUG_CUSTODY_ADDRESS)
        );

        setUserActiveLendData(getUserLendReq);

        // Fetching asset Id's which asset's repayment done
        const getUserPayment = await api_agent.getUserPaidAssets(
          Principal.fromText(plugAddress)
        );
        const resultData = getUserPayment.flat();
        setUserPaymentIds(resultData);
      }

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

      const finalPromise = await getCollectionDetails(getRequestData);
      let obj_ = {};

      finalPromise.forEach((asset) => {
        obj_ = {
          ...obj_,
          [asset.id]: asset,
        };
      });

      const dataWithFloor = getRequestData.map((asset) => {
        let floorAsset = obj_[asset.id];
        if (asset.id === floorAsset?.id) {
          return { floorAsset, ...asset };
        } else {
          return asset;
        }
      });

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

  const handleAskRequest = async () => {
    if (askModalData.repaymentAmount) {
      setLoadingState((prev) => ({ ...prev, isAskBtn: true }));
      try {
        const setAddress = await api_agent.setAskRequest(
          IS_USER
            ? xverseAddress
              ? xverseAddress
              : unisatAddress
              ? unisatAddress
              : magicEdenAddress
            : WAHEED_ADDRESS,
          askModalData.id,
          JSON.stringify(askModalData),
          Principal.fromText(PLUG_CUSTODY_ADDRESS)
        );
        setLoadingState((prev) => ({ ...prev, isAskBtn: false }));

        if (setAddress) {
          Notify("success", "Ask successful!");
        } else {
          Notify("warning", "Asset Id already exists");
        }

        setLoadingState((prev) => ({ ...prev, isAskBtn: false }));
        handleCancel();
        getLendRequest();
        fetchUserSupplies();
      } catch (error) {
        setLoadingState((prev) => ({ ...prev, isAskBtn: false }));
        console.log("Ask request error", error);
      }
    } else {
      Notify("warning", "Enter the amount!");
    }
  };

  // Fetching lend details
  useEffect(() => {
    (async () => {
      if (
        api_agent &&
        (activeWallet.includes(XVERSE_WALLET_KEY) ||
          activeWallet.includes(UNISAT_WALLET_KEY) ||
          activeWallet.includes(MAGICEDEN_WALLET_KEY)) &&
        activeWallet.includes(PLUG_WALLET_KEY)
      ) {
        // getting Lend Side Details
        getLendRequest();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api_agent, unisatAddress, xverseAddress, magicEdenAddress, plugAddress]);

  // Getting the ckBtc allowance is available or not
  useEffect(() => {
    (async () => {
      if (ckBtcAgent && plugAddress) {
        fetchCkBtcAllowance();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ckBtcAgent, plugAddress]);

  // Getting the ckEth allowance is available or not
  useEffect(() => {
    (async () => {
      if (
        ckEthAgent &&
        plugAddress &&
        !assetToSupplyModalDetails.ckEthAllowance
      ) {
        fetchCkEthAllowance();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ckEthAgent, plugAddress]);

  useEffect(() => {
    (async () => {
      if (
        api_agent &&
        (xverseAddress || unisatAddress || magicEdenAddress) &&
        plugAddress
      ) {
        fetchUserSupplies();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api_agent, xverseAddress, unisatAddress, magicEdenAddress, plugAddress]);

  useEffect(() => {
    if (activeWallet.length === 0) {
      setLendData([]);
      setBorrowData([]);
      setAssetToSupplyModalDetails({
        asset: "",
        balance: "",
        img: "",
        isAllowance: false,
        ckBtcAllowance: 0,
        ckEthAllowance: 0,
      });
      setWithdrawModalData({
        asset: "",
        balance: "",
      });
      setRepayCanisterData({
        assetId: "",
        repayment_amount: 0,
        due_at: 0,
        lendData: {},
      });
      setAssetSupplies(null);
      setBorrowedAssetIds(null);
      setUserPaymentIds([]);
    }
  }, [activeWallet]);

  // Data & Table Colums
  // C1 --------------------

  const AssetSupplyTableColumns = [
    {
      key: "Asset",
      title: "Asset",
      align: "center",
      dataIndex: "asset",
      render: (_, obj) => (
        <>
          {borrowedAssetIds ? (
            <>
              <Flex gap={5} vertical align="center">
                {obj.mimeType.includes("text/html") ? (
                  <Badge
                    style={{
                      display: !borrowedAssetIds[obj.id]?.asset_id && "none",
                    }}
                    count={
                      <MdLockClock
                        size={30}
                        style={{
                          color: "#f5222d",
                        }}
                      />
                    }
                  >
                    <iframe
                      onMouseEnter={() =>
                        setShowIframe({
                          isDisplay: true,
                          src: `${CONTENT_API}/content/${obj.id}`,
                          inscriptionNumber: obj.inscriptionNumber,
                        })
                      }
                      className="border-radius-30 pointer"
                      title={`${obj.id}-borrow_image`}
                      height={70}
                      width={70}
                      src={`${CONTENT_API}/content/${obj.id}`}
                    />
                  </Badge>
                ) : (
                  <>
                    <Badge
                      style={{
                        display: !borrowedAssetIds[obj.id]?.asset_id && "none",
                      }}
                      count={
                        <MdLockClock
                          size={30}
                          style={{
                            color: "#f5222d",
                          }}
                        />
                      }
                    >
                      <img
                        src={`${CONTENT_API}/content/${obj.id}`}
                        alt={`${obj.id}-borrow_image`}
                        className="border-radius-30"
                        width={70}
                        height={70}
                      />
                    </Badge>
                  </>
                )}
                #{obj.inscriptionNumber}
              </Flex>
            </>
          ) : (
            <Loading
              spin={!borrowedAssetIds}
              indicator={
                <ThreeDots stroke="#6a85f1" alignmentBaseline="central" />
              }
            />
          )}
        </>
      ),
    },
    {
      key: "Time stamp",
      title: "Date & Time",
      align: "center",
      dataIndex: "timestamp",
      defaultSortOrder: "ascend",
      sorter: (a, b) => a.timestamp - b.timestamp,
      render: (_, obj) => {
        const timeStamp = DateTimeConverter(obj.timestamp);
        return (
          <Flex vertical align="center" gap={5}>
            <span className="text-color-one font-medium letter-spacing-small">
              {timeStamp[0]}
            </span>
            <span className="text-color-two font-msmall letter-spacing-small">
              {timeStamp[1]}
            </span>
          </Flex>
        );
      },
    },
    {
      key: "ActionButtons",
      title: " ",
      width: "25%",
      align: "center",
      render: (_, obj) => {
        let lendData = {};
        if (borrowedAssetIds) {
          lendData = borrowedAssetIds[obj.id];
        }
        const collection = assetSuppliesFloor[obj.id];
        const withdrawStatus = assetWithdrawStatus[obj.id];
        return (
          <>
            {borrowedAssetIds ? (
              <Flex gap={10} justify="center">
                {!lendData?.asset_id ? (
                  <>
                    {withdrawStatus?.status === "WITHDRAW" ? (
                      <Tag
                        style={{
                          backgroundColor: "blanchedalmond",
                          color: "black",
                        }}
                      >
                        WITHDRAW REQUESTED
                      </Tag>
                    ) : withdrawStatus?.status === "PROGRESS" ? (
                      <Link
                        target="_blank"
                        to={`${MEMPOOL_API}/tx/${withdrawStatus.txid}`}
                        className="font-small text-decor-line text-color-three"
                      >
                        View Tx <FaExternalLinkSquareAlt />
                      </Link>
                    ) : (
                      <>
                        <Popconfirm
                          className="z-index"
                          color="black"
                          placement="top"
                          style={{ color: "white" }}
                          title={
                            <span className="font-small heading-one text-color-two">
                              {`Do you want to ${
                                askIds.includes(obj.id) ? "cancel" : "initiate"
                              } the borrow request?`}
                            </span>
                          }
                          okText="Yes"
                          disabled={!askIds.includes(obj.id)}
                          cancelText="No"
                          onConfirm={async () => {
                            if (plugAddress) {
                              if (askIds.includes(obj.id)) {
                                try {
                                  const pauseAddress =
                                    await api_agent.setPauseRequest(
                                      IS_USER
                                        ? xverseAddress
                                          ? xverseAddress
                                          : unisatAddress
                                          ? unisatAddress
                                          : magicEdenAddress
                                        : WAHEED_ADDRESS,
                                      obj.id
                                    );
                                  if (Number(pauseAddress) === 200) {
                                    Notify("success", "Paused the asset!");
                                  } else {
                                    Notify("warning", "Asset not found");
                                  }
                                } catch (error) {
                                  // console.log("error", error);
                                }
                              }

                              getLendRequest();
                              fetchUserSupplies();
                            } else {
                              Notify(
                                "warning",
                                "Connect plug wallet to continue!"
                              );
                            }
                          }}
                        >
                          <CustomButton
                            block
                            className={
                              "click-btn font-weight-600 letter-spacing-small"
                            }
                            title={askIds.includes(obj.id) ? "Pause" : "Ask"}
                            size="medium"
                            onClick={() => {
                              !askIds.includes(obj.id) && setAskModal(true);
                              setAskModalData({
                                ...askModalData,
                                floorPrice: collection?.floorPrice
                                  ? collection.floorPrice
                                  : 10,
                                ...obj,
                                isApprovedCollection: collection?.floorPrice
                                  ? true
                                  : false,
                              });
                            }}
                          />
                        </Popconfirm>
                        {!askIds.includes(obj.id) && (
                          <CustomButton
                            block
                            className={
                              "click-btn font-weight-600 letter-spacing-small"
                            }
                            title="Withdraw"
                            onClick={async () => {
                              setAssetWithdrawModal(true);
                              const info = await axios.get(
                                `${MEMPOOL_API}/api/v1/fees/recommended`
                              );
                              const inscription = await axios.get(
                                `${process.env.REACT_APP_ORDINALS_CONTENT_API}/inscription/${obj.id}`
                              );
                              const $ = load(inscription.data);
                              const contentLength = $(
                                'dt:contains("content length")'
                              )
                                .next("dd")
                                .text();

                              setAssetWithdrawModalData({
                                ...obj,
                                ...info.data,
                                contentLength,
                              });
                              setValue(info.data.halfHourFee);
                            }}
                            size="medium"
                          />
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <CustomButton
                    className={"font-weight-600 letter-spacing-small"}
                    title={"Repay"}
                    block
                    size="medium"
                    onClick={() => {
                      setRepayCanisterModal(true);
                      setRepayCanisterData({
                        assetId: lendData.asset_id,
                        repayment_amount: lendData.repayment_amount,
                        due_at: daysCalculator(lendData.timestamp).date_time,
                        lendData,
                      });
                    }}
                  />
                )}
              </Flex>
            ) : (
              <Loading
                spin={!borrowedAssetIds}
                indicator={
                  <ThreeDots stroke="#6a85f1" alignmentBaseline="central" />
                }
              />
            )}
          </>
        );
      },
    },
  ];

  // C2 --------------------------------------------------------------
  const AssetsToSupplyTableColumns = [
    {
      key: "Asset",
      title: "Asset",
      align: "center",
      dataIndex: "asset",
      render: (_, obj) => (
        <>
          <Flex gap={5} vertical align="center">
            {obj.contentType.includes(
              "image/webp" || "image/jpeg" || "image/png"
            ) ? (
              <img
                src={`${CONTENT_API}/content/${obj.id}`}
                alt={`${obj.id}-borrow_image`}
                className="border-radius-30"
                width={70}
                height={70}
              />
            ) : obj.contentType.includes("image/svg") ? (
              <iframe
                loading="lazy"
                width={"50%"}
                height={"80px"}
                style={{ border: "none", borderRadius: "20%" }}
                src={`${CONTENT_API}/content/${obj.id}`}
                title="svg"
                sandbox="allow-scripts"
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <image href={`${CONTENT_API}/content/${obj.id}`} />
                </svg>
              </iframe>
            ) : (
              <img
                src={`${
                  obj?.meta?.collection_page_img_url
                    ? obj?.meta?.collection_page_img_url
                    : `${process.env.PUBLIC_URL}/collections/${obj?.collectionSymbol}`
                }`}
                // NatBoys
                // src={`https://ipfs.io/ipfs/QmdQboXbkTdwEa2xPkzLsCmXmgzzQg3WCxWFEnSvbnqKJr/1842.png`}
                // src={`${process.env.PUBLIC_URL}/collections/${obj?.collectionSymbol}.png`}
                onError={(e) =>
                  (e.target.src = `${process.env.PUBLIC_URL}/collections/${obj?.collectionSymbol}.png`)
                }
                alt={`${obj.id}-borrow_image`}
                className="border-radius-30"
                width={70}
                height={70}
              />
            )}
            {obj.displayName}
          </Flex>
        </>
      ),
    },
    {
      key: "Floor Price",
      title: "Floor price",
      align: "center",
      dataIndex: "value",
      render: (_, obj) => {
        return (
          <>
            {obj.collection.floorPrice ? (
              <Flex vertical align="center">
                <Flex
                  align="center"
                  gap={3}
                  className="text-color-two font-small letter-spacing-small"
                >
                  <img src={Aptos} alt="noimage" width={20} height={20} />
                  {(
                    ((obj.collection.floorPrice / BTC_ZERO) * btcValue) /
                    aptosvalue
                  ).toFixed(2)}
                </Flex>
                <span className="text-color-one font-xsmall letter-spacing-small">
                  ${" "}
                  {(
                    (Number(obj.collection.floorPrice) / BTC_ZERO) *
                    btcValue
                  ).toFixed(2)}
                </span>
              </Flex>
            ) : (
              "-"
            )}
          </>
        );
      },
    },
    {
      key: "APY",
      title: "APY",
      align: "center",
      dataIndex: "category_id",
      render: (id, obj) => {
        return <Text className="text-color-two font-small">5%</Text>;
      },
    },
    {
      key: "Can be collateral",
      title: "Can be collateral",
      align: "center",
      dataIndex: "link",
      render: (_, obj) => (
        <>
          <FcApproval color="orange" size={30} />
        </>
      ),
    },
    {
      key: "Action Buttons",
      title: " ",
      align: "center",
      render: (_, obj) => {
        return (
          <Flex gap={5}>
            <Dropdown.Button
              className="dbButtons-grey font-weight-600 letter-spacing-small"
              trigger={"click"}
              onClick={() => setHandleSupplyModal(true)}
              menu={{
                items: options,
                onClick: () => setSupplyItems(obj),
              }}
            >
              Supply
            </Dropdown.Button>
          </Flex>
        );
      },
    },
  ];

  // C3----------------------------------------------------------------
  const yourLendTableColumns = [
    {
      key: "Asset",
      title: "Asset",
      align: "center",
      dataIndex: "asset",
      render: (_, obj) => (
        <Flex align="center" gap={5} vertical>
          {obj.mime_type?.includes("text/html") ? (
            <iframe
              className="border-radius-30"
              title={`${obj.id}-borrow_image`}
              height={70}
              width={70}
              src={`${CONTENT_API}/content/${obj.asset_id}`}
            />
          ) : (
            <img
              src={`${CONTENT_API}/content/${obj.asset_id}`}
              alt={`${obj.id}-lend_image`}
              className="border-radius-30"
              width={70}
              height={70}
            />
          )}
          #{obj.inscriptionid}
        </Flex>
      ),
    },
    {
      key: "Amount",
      title: "Amount",
      align: "center",
      dataIndex: "debt",
      render: (_, obj) => (
        <>
          {ckBtcBalance !== null ? (
            <Flex align="center" vertical>
              <span className="text-color-one font-small letter-spacing-small">
                {(Number(obj.loan_amount) / BTC_ZERO).toFixed(8)}
              </span>
              <span className="text-color-two font-xsmall letter-spacing-small">
                $ {((Number(obj.loan_amount) / BTC_ZERO) * btcValue).toFixed(2)}
              </span>
            </Flex>
          ) : (
            <Loading
              spin={!ckBtcBalance}
              indicator={
                <ThreeDots stroke="#6a85f1" alignmentBaseline="central" />
              }
            />
          )}
        </>
      ),
    },
    {
      key: "Date/Time",
      title: "Date & Time",
      align: "center",
      dataIndex: "date",
      render: (_, obj) => {
        const timeStamp = DateTimeConverter(Number(obj.timestamp));
        return (
          <Flex vertical align="center" gap={5}>
            <span className="text-color-one font-medium letter-spacing-small">
              {timeStamp[0]}
            </span>
            <span className="text-color-two font-msmall letter-spacing-small">
              {timeStamp[1]}
            </span>
          </Flex>
        );
      },
    },
    {
      key: "repayment",
      title: "Due at",
      align: "center",
      dataIndex: "apy",
      render: (_, obj) => {
        const result = daysCalculator(obj.timestamp).date_time;
        const timeStamp = result.split(" ");
        return (
          <Flex vertical align="center" gap={5}>
            <span className="text-color-one font-medium letter-spacing-small">
              {timeStamp[0]}
            </span>
            <span className="text-color-two font-msmall letter-spacing-small">
              {timeStamp[1]} {timeStamp[2]}
            </span>
          </Flex>
        );
      },
    },
    {
      key: "Action Buttons",
      title: " ",
      align: "center",
      render: (_, obj) => (
        <Flex gap={5} align="center" justify="center">
          <Tooltip
            placement="top"
            arrow
            overlayStyle={{
              display: userPaymentIds.includes(obj.asset_id) && "none",
            }}
            trigger={"hover"}
            color="purple"
            title={"Wait untill repay!"}
          >
            <Badge
              dot
              status="processing"
              color={"green"}
              style={{
                display: !userPaymentIds.includes(obj.asset_id) && "none",
                borderRadius: "25%",
              }}
            >
              <Popconfirm
                color="black"
                placement="top"
                style={{ color: "white" }}
                overlayStyle={{
                  display: !userPaymentIds.includes(obj.asset_id) && "none",
                }}
                title={
                  <span className="font-small heading-one text-color-two">
                    {"Do you want to withdraw amount?"}
                  </span>
                }
                okText="Yes"
                cancelText="No"
                onConfirm={() => {
                  userPaymentIds.includes(obj.asset_id) &&
                    handleLendWithdraw(obj);
                }}
              >
                <CustomButton
                  className={"click-btn font-weight-600 letter-spacing-small"}
                  title="Withdraw"
                  size="middle"
                />
              </Popconfirm>
            </Badge>
          </Tooltip>
        </Flex>
      ),
    },
  ];

  // C4----------------------------------------------------------------
  const assetsToLendTableColumns = [
    {
      key: "Asset",
      title: "Asset",
      align: "center",
      dataIndex: "asset",
      render: (_, obj) => (
        <Flex align="center" vertical gap={5}>
          {obj.mimeType?.includes("text/html") ? (
            <iframe
              className="border-radius-30"
              onMouseEnter={() =>
                setShowIframe({
                  isDisplay: true,
                  src: `${CONTENT_API}/content/${obj.id}`,
                  inscriptionNumber: obj.inscriptionNumber,
                })
              }
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
              width={70}
              height={70}
            />
          )}
          #{obj.inscriptionNumber}
        </Flex>
      ),
    },
    {
      key: "Floor price",
      title: "Floor price",
      align: "center",
      dataIndex: "Floor price",
      render: (_, obj) => {
        const floorPrice = Number(obj.floorAsset?.collection?.floorPrice);
        return (
          <Flex vertical>
            <span className="text-color-one font-small letter-spacing-small">
              {floorPrice ? floorPrice / BTC_ZERO : (10 / btcValue).toFixed(6)}
            </span>
            <span className="text-color-two font-xsmall letter-spacing-small">
              ${" "}
              {floorPrice
                ? ((floorPrice / BTC_ZERO) * btcValue).toFixed(2)
                : 10}
            </span>
          </Flex>
        );
      },
    },
    {
      key: "Debt",
      title: "Debt",
      align: "center",
      dataIndex: "Debt",
      render: (_, obj) => {
        return (
          <Flex vertical>
            <span className="text-color-one font-small letter-spacing-small">
              {Number(obj.repaymentAmount).toFixed(6)}
            </span>
            <span className="text-color-two font-xsmall letter-spacing-small">
              $ {Number(obj.repaymentAmount * btcValue).toFixed(2)}
            </span>
          </Flex>
        );
      },
    },
    {
      key: "Action Buttons",
      title: " ",
      align: "center",
      render: (_, obj) => {
        return (
          <Flex gap={5}>
            <>
              <CustomButton
                className={"click-btn font-weight-600 letter-spacing-small"}
                block
                title="Details"
                size="middle"
                onClick={() => {
                  setCardDetails({
                    ...obj,
                  });
                  setIsLendModalOpen(true);
                }}
              />
            </>{" "}
          </Flex>
        );
      },
    },
  ];
  //   Collapse Items
  // C1
  const YourSuppliesItems = [
    {
      key: "supply-2",
      label: (
        <>
          <Text className="text-color-one letter-spacing-small iconalignment font-weight-600 font-small">
            Your Supplies
            <Tooltip
              arrow
              color="purple"
              title={
                <span className="text-color-one">
                  Your supplied asset is displayed here & you can withdraw back!
                </span>
              }
              trigger={"hover"}
              placement="top"
            >
              <BiInfoSquare size={20} color="gray" className="mt-3" />
            </Tooltip>
          </Text>
        </>
      ),
      children: (
        <>
          <TableComponent
            loading={{
              spinning: loadingState.isAssetSupplies,
              indicator: <Bars />,
            }}
            locale={{
              emptyText: (
                <Flex align="center" justify="center" gap={5}>
                  {(!xverseAddress || !unisatAddress || !magicEdenAddress) &&
                  !plugAddress ? (
                    <>
                      <FaRegSmileWink size={25} />
                      <span className="font-medium">
                        Connect any BTC Wallet & Plug wallet !
                      </span>
                    </>
                  ) : (
                    <>
                      <ImSad size={25} />
                      <span className="font-medium">
                        Seems you have no supplies!
                      </span>
                    </>
                  )}
                </Flex>
              ),
            }}
            pagination={false}
            rowKey={(e) => `asset-supplies-${e?.id}-${e?.timestamp}`}
            tableColumns={AssetSupplyTableColumns}
            tableData={
              (xverseAddress || unisatAddress || magicEdenAddress) &&
              plugAddress
                ? assetSupplies
                : []
            }
          />
        </>
      ),
    },
  ];

  const assetsToSupplyItems = [
    {
      key: "asset-to-supply-1",
      label: (
        <Text className="text-color-one letter-spacing-small iconalignment font-weight-600 font-small">
          Your Assets
          <Tooltip
            arrow
            color="purple"
            title={
              <span className="text-color-one">
                We only display your assets from our approved collections!
              </span>
            }
            trigger={"hover"}
            placement="top"
          >
            <BiInfoSquare size={20} color="gray" className="mt-3" />
          </Tooltip>
        </Text>
      ),
      children: (
        <>
          <TableComponent
            locale={{
              emptyText: (
                <Flex align="center" justify="center" gap={5}>
                  {!xverseAddress && !unisatAddress && !magicEdenAddress ? (
                    <>
                      <FaRegSmileWink size={25} />
                      <span className="font-medium">
                        Connect any BTC Wallet !
                      </span>
                    </>
                  ) : (
                    <>
                      <ImSad size={25} />
                      <span className="font-medium">
                        Seems you have no assets!
                      </span>
                    </>
                  )}
                </Flex>
              ),
            }}
            loading={{
              spinning: loadingState.isBorrowData,
              indicator: <Bars />,
            }}
            pagination={{ pageSize: 5 }}
            rowKey={(e) => `${e?.id}-${e?.number}`}
            tableColumns={AssetsToSupplyTableColumns}
            tableData={borrowData}
          />
        </>
      ),
    },
  ];

  const yourLendsItems = [
    {
      key: "lend-1",
      label: (
        <>
          <Text className="text-color-one letter-spacing-small iconalignment font-weight-600 font-small">
            Your Lendings
            <Tooltip
              arrow
              color="purple"
              title={
                <span className="text-color-one">
                  Your borrowed asset using ckBTC is displayed here & you can
                  withdraw back after repayment!
                </span>
              }
              trigger={"hover"}
              placement="top"
            >
              <BiInfoSquare size={20} color="gray" className="mt-3" />
            </Tooltip>
          </Text>
        </>
      ),
      children: (
        <TableComponent
          locale={{
            emptyText: (
              <Flex align="center" justify="center" gap={5}>
                {(!xverseAddress || !unisatAddress || !magicEdenAddress) &&
                !plugAddress ? (
                  <>
                    <FaRegSmileWink size={25} />
                    <span className="font-medium">
                      Connect any BTC Wallet & Plug wallet !
                    </span>
                  </>
                ) : (
                  <>
                    <ImSad size={25} />
                    <span className="font-medium">
                      Seems you have no active lendings!
                    </span>
                  </>
                )}
              </Flex>
            ),
          }}
          loading={{ spinning: loadingState.isLendData, indicator: <Bars /> }}
          tableColumns={yourLendTableColumns}
          tableData={
            (xverseAddress || unisatAddress || magicEdenAddress) && plugAddress
              ? userActiveLendData
              : []
          }
          pagination={false}
        />
      ),
    },
  ];

  const assetsToLendItems = [
    {
      key: "asset-to-lend-1",
      label: (
        <Text className="text-color-one letter-spacing-small iconalignment font-weight-600 font-small">
          Your Asked Assets
          <Tooltip
            arrow
            color="purple"
            title={
              <span className="text-color-one">
                Available lends are displayed here & you can get it by giving
                ckBTC!
              </span>
            }
            trigger={"hover"}
            placement="top"
          >
            <BiInfoSquare size={20} color="gray" className="mt-3" />
          </Tooltip>
        </Text>
      ),
      children: (
        <TableComponent
          locale={{
            emptyText: (
              <Flex align="center" justify="center" gap={5}>
                {(!xverseAddress || !unisatAddress || !magicEdenAddress) &&
                !plugAddress ? (
                  <>
                    <FaRegSmileWink size={25} />
                    <span className="font-medium">
                      Connect any BTC Wallet & Plug wallet !
                    </span>
                  </>
                ) : (
                  <>
                    <ImSad size={25} />
                    <span className="font-medium">
                      Seems, no assets to lend!
                    </span>
                  </>
                )}
              </Flex>
            ),
          }}
          loading={{ spinning: loadingState.isLendData, indicator: <Bars /> }}
          rowKey={(e) => `${e?.inscriptionid}-${e?.mime_type}`}
          tableColumns={assetsToLendTableColumns}
          tableData={
            (xverseAddress || unisatAddress || magicEdenAddress) && plugAddress
              ? lendData
              : []
          }
          pagination={{ pageSize: 5 }}
        />
      ),
    },
  ];

  return (
    <>
      <Row justify={"space-between"} align={"middle"}>
        <Col>
          <h1 className="font-xlarge gradient-text-one">Dashboard</h1>
        </Col>
      </Row>
      {walletState.active?.length > 0 && !isPlugError ? (
        <Row justify={"space-between"} className="mt-7" gutter={32}>
          <Col xl={12}>
            <Row>
              <Col xl={24}>
                <span className="collapse-antd">
                  <Collapse
                    size="large"
                    bordered={false}
                    defaultActiveKey={["supply-1", "supply-2"]}
                    expandIcon={({ isActive }) => (
                      <FaCaretDown
                        color={isActive ? "white" : "#c572ef"}
                        size={25}
                        style={{
                          transform: isActive ? "" : "rotate(-90deg)",
                          transition: "0.5s ease",
                        }}
                      />
                    )}
                    items={YourSuppliesItems}
                  />
                </span>
              </Col>
            </Row>

            <Row className="mt-30 m-bottom">
              <Col xl={24}>
                <span className="collapse-antd">
                  <Collapse
                    size="large"
                    bordered={false}
                    defaultActiveKey={[
                      "asset-to-supply-1",
                      "asset-to-supply-2",
                    ]}
                    expandIcon={({ isActive }) => (
                      <FaCaretDown
                        color={isActive ? "white" : "#c572ef"}
                        size={25}
                        style={{
                          transform: isActive ? "" : "rotate(-90deg)",
                          transition: "0.5s ease",
                        }}
                      />
                    )}
                    items={assetsToSupplyItems}
                  />
                </span>
              </Col>
            </Row>
          </Col>

          <Col xl={12}>
            <Row>
              <Col xl={24}>
                <span className="collapse-antd">
                  <Collapse
                    size="large"
                    bordered={false}
                    defaultActiveKey={["lend-1"]}
                    expandIcon={({ isActive }) => (
                      <FaCaretDown
                        color={isActive ? "white" : "#c572ef"}
                        size={25}
                        style={{
                          transform: isActive ? "" : "rotate(-90deg)",
                          transition: "0.5s ease",
                        }}
                      />
                    )}
                    items={yourLendsItems}
                  />
                </span>
              </Col>
            </Row>

            <Row className="mt-30 m-bottom">
              <Col xl={24}>
                <span className="collapse-antd">
                  <Collapse
                    size="large"
                    bordered={false}
                    defaultActiveKey={["asset-to-lend-1"]}
                    expandIcon={({ isActive }) => (
                      <FaCaretDown
                        color={isActive ? "white" : "#c572ef"}
                        size={25}
                        style={{
                          transform: isActive ? "" : "rotate(-90deg)",
                          transition: "0.5s ease",
                        }}
                      />
                    )}
                    items={assetsToLendItems}
                  />
                </span>
              </Col>
            </Row>
          </Col>
        </Row>
      ) : (
        <WalletConnectDisplay isPlugError={isPlugError} />
      )}

      {/* MODAL START */}
      {/* Lend Modal Display */}
      <ModalDisplay
        width={
          screenDimensions.width >= 768
            ? "50%"
            : screenDimensions.width >= 375 && screenDimensions.width < 768
            ? "80%"
            : "90%"
        }
        open={isLendModalOpen}
        onOk={handleLendModalOk}
        onCancel={handleLendModalCancel}
        footer={""}
      >
        <Row justify={"space-between"}>
          <Col className="m-top-bottom" xs={24} md={24} lg={24} xl={7}>
            <Row
              justify={{
                xs: "center",
                md: "center",
                xl: "center",
                sm: "center",
              }}
            >
              <Col className="mt-20">
                {lendCardDetails?.mimeType &&
                  (lendCardDetails?.mimeType === "text/html" ? (
                    <iframe
                      title="lend_image"
                      height={300}
                      src={`${CONTENT_API}/content/${lendCardDetails?.id}`}
                    />
                  ) : (
                    <Col className="mt-20">
                      <img
                        src={`${CONTENT_API}/content/${lendCardDetails?.id}`}
                        alt={`modal_lend_image`}
                        width={
                          screenDimensions.width >= 1200 ||
                          screenDimensions.width < 425
                            ? 225
                            : 300
                        }
                        className="cardrelative border-radius-30"
                      />
                    </Col>
                  ))}
              </Col>
            </Row>
          </Col>

          <Col
            className=" mt-30 details-bg card"
            xs={24}
            md={24}
            lg={24}
            xl={14}
            style={{ padding: "10px 0px" }}
          >
            <Row justify={"space-around"}>
              <Col>
                <Row className="font-size-20 text-color-two ">Inscription</Row>
                <Row className="font-size-20 text-color-two mt">
                  Loan Amount
                </Row>
                <Row className="font-size-20 text-color-two mt">Loan Due</Row>
                <Row className="font-size-20 text-color-two mt">
                  Interest Rate
                </Row>
                <Row className="font-size-20 text-color-two mt">
                  Lender Profit
                </Row>
                <Row className="font-size-20 text-color-two mt">
                  Platform fee
                </Row>
                <Row className="font-size-20 text-color-two mt">Repayment</Row>
              </Col>
              <Col>
                <Row className="font-size-20 text-color-one ">
                  #{lendCardDetails.inscriptionNumber}
                </Row>
                <Row className="font-size-20 text-color-one mt iconalignment">
                  {lendCardDetails.loanAmount}
                  <img src={Bitcoin} alt="noimage" width="30px" />
                </Row>
                <Row className="font-size-20 text-color-one mt">
                  {daysCalculator().date_time}
                </Row>
                <Row className="font-size-20 text-color-one mt">5% APR</Row>
                <Row className="font-size-20 text-color-one mt iconalignment">
                  {lendCardDetails.interestAmount}
                  <img src={Bitcoin} alt="noimage" width="30px" />
                </Row>
                <Row className="font-size-20 text-color-one mt iconalignment">
                  1 %
                  <img src={Bitcoin} alt="noimage" width="30px" />
                </Row>
                <Row className="font-size-20 text-color-one mt iconalignment">
                  {lendCardDetails.repaymentAmount}
                  <img src={Bitcoin} alt="noimage" width="30px" />
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>

        <Row className="m-top-bottom" justify={"space-between"}>
          <Col
            xs={24}
            className="text-align text-color-one m-top-bottom font-medium "
          >
            <GoInfo /> IF THE BORROWER DOES NOT REPAY, YOU'LL GET THEIR
            COLLATERAL.
          </Col>
          <Col className="lend-button text-color-one m-top-bottom pointer font-size-20 iconalignment">
            Magic Eden <PiMagicWandFill color="violet" />
          </Col>
        </Row>

        <Row className="m-top-bottom" justify={"end"}>
          <Col>
            <CustomButton
              onClick={handleLendModalCancel}
              className="button-css font-size-20 cancelButton "
              title={"Close"}
            />
          </Col>
        </Row>
      </ModalDisplay>

      {/* Asset Details Modal */}
      <ModalDisplay
        width={"50%"}
        title={
          <Row className="black-bg white-color font-large letter-spacing-small">
            Details
          </Row>
        }
        footer={null}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Row className="mt-30">
          <Col md={6}>
            <Text className="gradient-text-one font-small font-weight-600">
              Asset Info
            </Text>
          </Col>
          <Col md={18}>
            <Row>
              <Col md={12}>
                {supplyItems &&
                  (supplyItems?.mimeType === "text/html" ? (
                    <iframe
                      className="border-radius-30"
                      title={`${supplyItems?.id}-borrow_image`}
                      height={300}
                      width={300}
                      src={`${CONTENT_API}/content/${supplyItems?.id}`}
                    />
                  ) : (
                    <>
                      <img
                        src={`${CONTENT_API}/content/${supplyItems?.id}`}
                        alt={`${supplyItems?.id}-borrow_image`}
                        className="border-radius-30"
                        width={125}
                      />
                      <Row>
                        <Text className="text-color-one ml">
                          <span className="font-weight-600 font-small ">
                            ${" "}
                          </span>
                          {(
                            (Number(supplyItems?.floorPrice) / BTC_ZERO) *
                            btcValue
                          ).toFixed(2)}
                        </Text>
                      </Row>
                    </>
                  ))}
              </Col>

              <Col md={12}>
                <Row>
                  {" "}
                  <Flex vertical>
                    <Text className="text-color-two font-small">
                      Inscription Number
                    </Text>
                    <Text className="text-color-one font-small font-weight-600">
                      #{supplyItems?.inscriptionNumber}
                    </Text>
                  </Flex>
                </Row>
                <Row>
                  {" "}
                  <Flex vertical>
                    <Text className="text-color-two font-small">
                      Inscription Id
                    </Text>

                    <Text className="text-color-one font-small font-weight-600 iconalignment">
                      {sliceAddress(supplyItems?.id, 7)}
                      <Tooltip
                        arrow
                        title={copy}
                        trigger={"hover"}
                        placement="top"
                      >
                        <MdContentCopy
                          className="pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(supplyItems?.id);
                            setCopy("Copied");
                            setTimeout(() => {
                              setCopy("Copy");
                            }, 2000);
                          }}
                          size={20}
                          color="#764ba2"
                        />
                      </Tooltip>
                    </Text>
                  </Flex>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>

        <Divider />
        <Row className="mt-15">
          <Col md={6}>
            <Text className="gradient-text-one font-small font-weight-600">
              Collection Info
            </Text>
          </Col>
          <Col md={18}>
            <Row justify={"center"}>
              <Text className="gradient-text-two font-xslarge font-weight-600 ">
                {Capitalaize(supplyItems?.data?.collectionName)}
              </Text>
            </Row>

            <Row className="mt-30" justify={"space-between"}>
              <Flex vertical className="borrowDataStyle">
                <Text className="text-color-two font-small">Floor Price</Text>

                <Text className="text-color-one font-small font-weight-600">
                  {supplyItems?.floorPrice / BTC_ZERO}
                </Text>
              </Flex>
              <Flex vertical className="borrowDataStyle">
                <Text className="text-color-two font-small">Total Listed</Text>

                <Text className="text-color-one font-small font-weight-600">
                  {supplyItems?.totalListed}
                </Text>
              </Flex>
              <Flex vertical className="borrowDataStyle">
                <Text className="text-color-two font-small">Total Volume</Text>

                <Text className="text-color-one font-small font-weight-600">
                  {supplyItems?.totalVolume}
                </Text>
              </Flex>
            </Row>

            <Row justify={"space-between"} className="m-25">
              <Flex vertical>
                <Text className="text-color-two font-small">Owners</Text>

                <Row justify={"center"}>
                  <Text className="text-color-one font-small font-weight-600">
                    {supplyItems?.owners}
                  </Text>
                </Row>
              </Flex>
              <Flex vertical>
                <Text className="text-color-two font-small ">
                  Pending Transactions
                </Text>
                <Row justify={"center"}>
                  <Text className="text-color-one font-small font-weight-600">
                    {supplyItems?.pendingTransactions}
                  </Text>
                </Row>
              </Flex>
              <Flex vertical>
                <Text className="text-color-two font-small">Supply</Text>
                <Row justify={"center"}>
                  <Text className="text-color-one font-small font-weight-600">
                    {supplyItems?.supply}
                  </Text>
                </Row>
              </Flex>
            </Row>
          </Col>
        </Row>
      </ModalDisplay>

      <ModalDisplay
        width={"25%"}
        open={handleSupplyModal}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={null}
      >
        <Row justify={"center"}>
          <IoWarningSharp size={50} color="#f46d6d" />
        </Row>
        <Row justify={"center"}>
          <Text className="text-color-one font-xlarge font-weight-600 m-25">
            Reserved Address
          </Text>
        </Row>
        <Row>
          <span className="text-color-two mt-15">
            This is the token reserved contract address, please do not transfer
            directly through the CEX, you will not be able to confirm the source
            of funds, and you will not be responsible for lost funds.
          </span>
        </Row>
        <Row
          justify={"space-around"}
          align={"middle"}
          className="mt-30  border "
        >
          <Col md={18}>
            <span className="text-color-two">
              bc1p3s9nmllhlslppp6520gzfmnwa5hfmppns2zjrd5s6w06406gdg3snenzn7
            </span>
          </Col>
          <Col md={3}>
            <Row justify={"end"}>
              <Tooltip arrow title={copy} trigger={"hover"} placement="top">
                <MdContentCopy
                  className="pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "bc1pjj4uzw3svyhezxqq7cvqdxzf48kfhklxuahyx8v8u69uqfmt0udqlhwhwz"
                    );
                    setCopy("Copied");
                    setTimeout(() => {
                      setCopy("Copy");
                    }, 2000);
                  }}
                  size={20}
                  color="#764ba2"
                />
              </Tooltip>
            </Row>
          </Col>
        </Row>
        <Row>
          <CustomButton
            onClick={handleCancel}
            title="I Know"
            className={"m-25 width background text-color-one "}
          />
        </Row>
      </ModalDisplay>

      {/* Asset Withdraw Modal */}
      <ModalDisplay
        width={"50%"}
        open={assetWithdrawModal}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={null}
        title={
          <Row className="black-bg white-color font-large">Withdraw Asset</Row>
        }
      >
        {assetWithdrawModalData?.inscriptionNumber ? (
          <Row justify={"space-between"} gutter={24}>
            <Col md={12}>
              <Row className="mt-15" justify={"center"}>
                <Text className="text-color-one font-medium">
                  Review Transaction
                </Text>
              </Row>
              <Row justify={"center"} className="mt-15">
                {assetWithdrawModalData?.mimeType?.includes("text/html") ? (
                  <iframe
                    className="border-radius-30 pointer"
                    title={`Iframe`}
                    height={70}
                    width={70}
                    src={`${CONTENT_API}/content/${assetWithdrawModalData?.id}`}
                  />
                ) : (
                  <img
                    alt="withdraw_img"
                    width={80}
                    height={80}
                    className="border-radius-30"
                    src={`${process.env.REACT_APP_ORDINALS_CONTENT_API}/content/${assetWithdrawModalData?.id}`}
                  />
                )}
              </Row>
              <Flex vertical className="border-color mt-15">
                <Row justify={"space-between"}>
                  <Col>
                    <Text className="text-color-one font-small">Asset</Text>
                  </Col>
                  <Col>
                    <Text className="text-color-two font-small">
                      #{assetWithdrawModalData?.inscriptionNumber}
                    </Text>
                  </Col>
                </Row>
                <Row justify={"space-between"}>
                  <Col>
                    <Text className="text-color-one font-small">Id</Text>
                  </Col>
                  <Col>
                    <Flex vertical align="end">
                      <Text className="font-small text-color-two">
                        {sliceAddress(assetWithdrawModalData?.id, 7)}{" "}
                        <Tooltip
                          arrow
                          title={copy}
                          trigger={"hover"}
                          placement="top"
                        >
                          <MdContentCopy
                            className="pointer"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                assetWithdrawModalData?.id
                              );
                              setCopy("Copied");
                              setTimeout(() => {
                                setCopy("Copy");
                              }, 2000);
                            }}
                            size={20}
                            color="#1cc2e4"
                          />
                        </Tooltip>
                      </Text>
                    </Flex>
                  </Col>
                </Row>
                <Row justify={"space-between"}>
                  <Col>
                    <Text className="text-color-one font-small">Recipient</Text>
                  </Col>
                  <Col>
                    <Text className="font-small text-color-two">
                      {sliceAddress(assetWithdrawModalData?.recipient, 7)}{" "}
                      <Tooltip
                        arrow
                        title={copy}
                        trigger={"hover"}
                        placement="top"
                      >
                        <MdContentCopy
                          className="pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              assetWithdrawModalData?.genesis_address
                            );
                            setCopy("Copied");
                            setTimeout(() => {
                              setCopy("Copy");
                            }, 2000);
                          }}
                          size={20}
                          color="#1cc2e4"
                        />
                      </Tooltip>
                    </Text>
                  </Col>
                </Row>
                <Row justify={"space-between"}>
                  <Col>
                    <Text className="text-color-one font-small iconalignment">
                      ckBTC{" "}
                      <img
                        src={Bitcoin}
                        alt="noimage"
                        style={{ justifyContent: "center" }}
                        width="25dvw"
                      />
                    </Text>
                  </Col>
                  <Col>
                    <Text className="font-small text-color-two">
                      <Tag
                        color={
                          activeFee === "High"
                            ? "lime-inverse"
                            : activeFee === "Medium"
                            ? "orange-inverse"
                            : "purple-inverse"
                        }
                        style={{ fontWeight: 600, letterSpacing: "1px" }}
                      >
                        {calculateFee(
                          assetWithdrawModalData?.contentLength,
                          activeFee === "High"
                            ? assetWithdrawModalData?.fastestFee
                            : activeFee === "Medium"
                            ? assetWithdrawModalData?.halfHourFee
                            : value
                            ? value
                            : 1
                        ) / BTC_ZERO}
                      </Tag>
                    </Text>
                  </Col>
                </Row>
                <Row justify={"space-between"}>
                  <Col>
                    <Text className="text-color-one font-small">Fee</Text>
                  </Col>
                  <Col>
                    <Text className="font-small text-color-two">
                      <Tag
                        color={
                          activeFee === "High"
                            ? "lime-inverse"
                            : activeFee === "Medium"
                            ? "orange-inverse"
                            : "purple-inverse"
                        }
                        style={{ fontWeight: 600, letterSpacing: "1px" }}
                      >
                        {(
                          (calculateFee(
                            assetWithdrawModalData?.contentLength,
                            activeFee === "High"
                              ? assetWithdrawModalData?.fastestFee
                              : activeFee === "Medium"
                              ? assetWithdrawModalData?.halfHourFee
                              : value
                              ? value
                              : 1
                          ) /
                            BTC_ZERO) *
                          btcValue
                        ).toFixed(2)}
                      </Tag>
                    </Text>
                  </Col>
                </Row>
              </Flex>
            </Col>
            <Col md={12}>
              <Flex vertical>
                <Badge.Ribbon
                  text={"~10 mins"}
                  style={{ color: "black" }}
                  className="color-black"
                  color="#a0d911"
                >
                  <Flex
                    className={`${
                      activeFee === "High" && "border-blue"
                    } mt-15 pad-15 pointer border-color`}
                    align="center"
                    justify="space-between"
                    onClick={() => setActiveFee("High")}
                  >
                    <div>
                      <FaJetFighterUp color="#a0d911" size={30} />
                    </div>
                    <Flex vertical>
                      <span className="text-color-one font-small">
                        High priority
                      </span>
                      <span className="text-color-two">
                        {assetWithdrawModalData?.fastestFee} Sats/vByte
                      </span>
                    </Flex>
                    <Flex vertical justify="end">
                      <span className="text-color-one font-small">
                        {calculateFee(
                          assetWithdrawModalData?.contentLength,
                          assetWithdrawModalData?.fastestFee
                        )}
                      </span>
                      <span className="text-color-two">
                        ~$
                        {(
                          (calculateFee(
                            assetWithdrawModalData?.contentLength,
                            assetWithdrawModalData?.fastestFee
                          ) /
                            BTC_ZERO) *
                          btcValue
                        ).toFixed(2)}
                      </span>
                    </Flex>
                  </Flex>
                </Badge.Ribbon>
                {/* Medium */}

                <Badge.Ribbon
                  text={"~30 mins"}
                  className="color-black"
                  color="orange"
                >
                  <Flex
                    className={`${
                      activeFee === "Medium" && "border-blue"
                    } mt-15 pad-15 pointer border-color`}
                    align="center"
                    justify="space-between"
                    onClick={() => setActiveFee("Medium")}
                  >
                    <div>
                      <FaTruck color="orange" size={30} />
                    </div>
                    <Flex vertical>
                      <span className="text-color-one font-small">
                        Medium priority
                      </span>
                      <span className="text-color-two">
                        {assetWithdrawModalData?.halfHourFee} Sats/vByte
                      </span>
                    </Flex>
                    <Flex vertical justify="end">
                      <span className="text-color-one font-small">
                        {calculateFee(
                          assetWithdrawModalData?.contentLength,
                          assetWithdrawModalData?.halfHourFee
                        )}
                      </span>
                      <span className="text-color-two">
                        ~$
                        {(
                          (calculateFee(
                            assetWithdrawModalData?.contentLength,
                            assetWithdrawModalData?.halfHourFee
                          ) /
                            BTC_ZERO) *
                          btcValue
                        ).toFixed(2)}
                      </span>
                    </Flex>
                  </Flex>
                </Badge.Ribbon>

                {/* Custom */}
                <Flex
                  className={`${
                    activeFee === "Custom" && "border-blue"
                  } mt-15 pad-15 pointer border-color`}
                  align="center"
                  justify="space-between"
                  onClick={() => setActiveFee("Custom")}
                >
                  <div>
                    <MdDashboardCustomize color="purple" size={30} />
                  </div>
                  <Flex vertical>
                    <span className="text-color-one font-small">Custom</span>
                    <span className="text-color-two">{value} Sats/vByte</span>
                  </Flex>
                  <Flex vertical justify="end">
                    <span className="text-color-one font-small">
                      {calculateFee(
                        assetWithdrawModalData?.contentLength,
                        value ? value : 1
                      )}
                    </span>
                    <span className="text-color-two">
                      ~$
                      {(
                        (calculateFee(
                          assetWithdrawModalData?.contentLength,
                          value ? value : 1
                        ) /
                          BTC_ZERO) *
                        btcValue
                      ).toFixed(2)}
                    </span>
                  </Flex>
                </Flex>

                {activeFee === "Custom" && (
                  <>
                    <Text className="text-color-one font-small iconalignment mt-15">
                      Edit fees <HiOutlineInformationCircle />
                    </Text>
                    <span className="text-color-two">
                      Apply a higher fee to help your transaction confirm
                      quickly, especially when the network is congested
                    </span>
                    <div className="mt-15">
                      <NumericInput
                        data={withdrawModalData}
                        value={value}
                        onChange={setValue}
                        placeholder={"0"}
                        suffix={
                          <Flex vertical align="end">
                            <span className="text-color-two">Sats/vByte</span>
                          </Flex>
                        }
                      />
                    </div>
                  </>
                )}
              </Flex>

              <>
                <CustomButton
                  loading={loadingState.isAssetWithdraw}
                  className={
                    "font-weight-600  m-25 width  letter-spacing-small d-flex-all-center"
                  }
                  title={
                    <Flex align="center" justify="center" gap={5}>
                      <span>Pay</span>
                      <img
                        src={Bitcoin}
                        alt="noimage"
                        style={{ justifyContent: "center" }}
                        width="25dvw"
                      />{" "}
                      & Withdraw
                    </Flex>
                  }
                  onClick={() => handleSupplyAssetWithdraw()}
                />
              </>
            </Col>
          </Row>
        ) : (
          <Row justify={"center"} align={"middle"} style={{ height: "400px" }}>
            <Loading
              spin={true}
              indicator={
                <ThreeDots stroke="#6a85f1" alignmentBaseline="central" />
              }
            />
          </Row>
        )}
      </ModalDisplay>

      {/* Lend ckBTC Transfer Modal */}
      <ModalDisplay
        title={
          <Row className="black-bg white-color font-large">Repay ckBTC</Row>
        }
        open={repayCanisterModal}
        onCancel={handleCancel}
        onOk={handleOk}
        footer={null}
        width={"25%"}
      >
        <Flex vertical>
          <Text className="text-color-two font-small iconalignment">
            Amount <HiOutlineInformationCircle />
          </Text>
          <Input
            readOnly
            style={{ fontSize: "20px" }}
            value={Number(repayCanisterData.repayment_amount) / BTC_ZERO}
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

        <span className="text-color-two font-small letter-spacing-small">
          $
          {(
            (Number(repayCanisterData.repayment_amount) / BTC_ZERO) *
            btcValue
          ).toFixed(2)}
        </span>

        <Row className="mt-15">
          <Text className="text-color-two font-small">
            Transaction overview
          </Text>
        </Row>

        <Flex vertical className="border-color">
          <Row justify={"space-between"}>
            <Col>
              <Text className="text-color-one font-small">Due at</Text>
            </Col>
            <Col>
              <Text className="text-color-one font-small">
                {repayCanisterData.due_at}
              </Text>
            </Col>
          </Row>
          <Row justify={"space-between"}>
            <Col>
              <Text className="text-color-one font-small">
                Collateralization
              </Text>
            </Col>
            <Col>
              <Text style={{ color: "green" }} className="font-small">
                Enabled
              </Text>
            </Col>
          </Row>
          <Row justify={"space-between"}>
            <Col>
              <Text className="text-color-one font-small">Health factor</Text>
            </Col>
            <Col>
              <Flex vertical align="end">
                <Text style={{ color: "green" }} className="font-small">
                  7.79 - 8.24
                </Text>
              </Flex>
            </Col>
          </Row>
        </Flex>

        <Flex
          vertical
          className={`${
            Date.now() >
            daysCalculator(Number(repayCanisterData.lendData.timestamp))
              .timestamp
              ? "modalBoxRedShadow"
              : "modalBoxGreenShadow"
          } mt`}
        >
          <Row justify={"space-between"}>
            <Col className="iconalignment">
              <HiOutlineInformationCircle />
              <span>
                {Date.now() >
                daysCalculator(Number(repayCanisterData.lendData.timestamp))
                  .timestamp
                  ? "The due date exceeded, You should repay the amount. If not, the asset will be send to the borrower."
                  : "You are paying the amount before due date!"}
              </span>
            </Col>
          </Row>
        </Flex>

        <>
          <CustomButton
            loading={loadingState.isRepayBtn}
            className={
              "font-weight-600 m-25 width  letter-spacing-small d-flex-all-center"
            }
            title={
              <Flex align="center" justify="center" gap={5}>
                <span>Repay ckBTC</span>
                <img
                  src={Bitcoin}
                  alt="noimage"
                  style={{ justifyContent: "center" }}
                  width="25dvw"
                />
              </Flex>
            }
            onClick={handleRepayToCanister}
          />
        </>
      </ModalDisplay>

      {/* To Display the Iframes */}
      <ModalDisplay
        width={"35%"}
        open={showIframe.isDisplay}
        onCancel={handleCancel}
        footer={null}
        title={
          <Row className="black-bg text-color-two font-large">
            #{showIframe.inscriptionNumber}
          </Row>
        }
      >
        <iframe
          className="border-radius-30"
          title={`Iframe`}
          height={500}
          width={500}
          src={showIframe.src}
        />
      </ModalDisplay>

      {/* Ask Modal */}
      <ModalDisplay
        width={"35%"}
        open={askModal}
        footer={null}
        onCancel={handleCancel}
        title={
          <Row>
            <Text style={{ color: "white", fontSize: "25px" }}>Loan Info</Text>
          </Row>
        }
      >
        <Row className="mt-20">
          <Text className="font-small iconalignment modalBoxYellowShadow">
            <RiInformationFill /> After the repayment, you will get the
            inscription
          </Text>
        </Row>
        <Row justify={"space-between"}>
          <Tooltip
            color="purple"
            open={
              askModalData.isApprovedCollection &&
              askModalData.loanAmount >
                (askModalData.floorPrice / BTC_ZERO).toFixed(8)
            }
            title={"Amount higher than floor price!"}
          >
            <Col className="mt-30 modalBoxBlackShadow">
              <Row>
                <Text className="color-white font-small">
                  Enter loan amount
                </Text>
              </Row>
              <Row>
                <Input
                  className="mt"
                  style={{
                    border: "none",
                    backgroundColor: "#2a2a29 !important",
                    fontSize: "18px",
                  }}
                  placeholder={
                    askModalData.isApprovedCollection
                      ? (askModalData.floorPrice / BTC_ZERO).toFixed(8)
                      : (10 / aptosvalue).toFixed(8)
                  }
                  value={askModalData.loanAmount}
                  maxLength={8}
                  onChange={(e) => {
                    if (e.target.value.match(/^[0-9.]+$/)) {
                      handleAskModalInput(e);
                    } else if (e.target.value === "") {
                      handleAskModalInput(e);
                    }
                  }}
                  prefix={
                    <img src={Aptos} alt="noimage" width={15} height={15} />
                  }
                />
              </Row>
            </Col>
          </Tooltip>
          <Col className="mt-30 modalBoxBlackShadow">
            <Row>
              <Text className="color-white font-small">
                Total Interest Amount
              </Text>
            </Row>
            <Row>
              <Input
                readOnly
                value={askModalData.interestAmount}
                className="mt"
                style={{ border: "none", fontSize: "18px" }}
                placeholder="0"
                prefix={
                  <img src={Aptos} alt="noimage" width={15} height={15} />
                }
              />
            </Row>
          </Col>
        </Row>
        <Row className="mt">
          <Col>
            <Text className="color-white font-small">
              Repayment Amount: {askModalData.repaymentAmount}
            </Text>
          </Col>
        </Row>
        <Row className="mt-20">
          <Col sm={24}>
            <CustomButton
              loading={loadingState.isAskBtn}
              className={"width font-weight-600"}
              onClick={handleAskRequest}
              title={"Ask Loan"}
            />
          </Col>
        </Row>
      </ModalDisplay>
    </>
  );
};

export default propsContainer(Dashboard);
