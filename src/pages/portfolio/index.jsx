import {
  Badge,
  Col,
  Descriptions,
  Divider,
  Flex,
  Grid,
  Radio,
  Row,
  Tooltip,
  Typography,
} from "antd";
import Title from "antd/es/typography/Title";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { BiSolidSpreadsheet } from "react-icons/bi";
import { FaHandHolding, FaMoneyBillAlt, FaRegSmileWink } from "react-icons/fa";
import { FcInfo } from "react-icons/fc";
import { FiArrowDownLeft } from "react-icons/fi";
import { HiMiniReceiptPercent } from "react-icons/hi2";
import { ImSad } from "react-icons/im";
import { LiaExternalLinkAltSolid } from "react-icons/lia";
import { MdDeleteForever, MdTour } from "react-icons/md";
import { TbEdit } from "react-icons/tb";
import { Bars } from "react-loading-icons";
import CardDisplay from "../../component/card";
import WalletUI from "../../component/download-wallets-UI";
import Loading from "../../component/loading-wrapper/secondary-loader";
import ModalDisplay from "../../component/modal";
import Aptos from "../../assets/wallet-logo/aptos_logo.png";
import Notify from "../../component/notification";
import { propsContainer } from "../../container/props-container";
import { setLoading } from "../../redux/slice/constant";
import {
  API_METHODS,
  BTCWallets,
  IS_USER,
  MAGICEDEN_WALLET_KEY,
  MARTIN_WALLET_KEY,
  NIGHTLY_WALLET_KEY,
  PETRA_WALLET_KEY,
  UNISAT_WALLET_KEY,
  XVERSE_WALLET_KEY,
  apiUrl,
} from "../../utils/common";

const Portfolio = (props) => {
  const { api_agent } = props.wallet;
  const { reduxState, dispatch } = props.redux;
  const activeWallet = reduxState.wallet.active;
  const xverseWallet = reduxState.wallet.xverse;
  const unisatWallet = reduxState.wallet.unisat;
  const magicEdenWallet = reduxState.wallet.magicEden;
  const walletState = reduxState.wallet;
  const xverseAddress = walletState.xverse.ordinals.address;
  const unisatAddress = walletState.unisat.address;
  const magicEdenAddress = walletState.magicEden.ordinals.address;
  const petraAddress = walletState.petra.address;
  const martinAddress = walletState.martin.address;
  const nightltAddress = walletState.nightly.address;
  const dashboardData = reduxState.constant.dashboardData;

  const { Text } = Typography;
  const { useBreakpoint } = Grid;
  const breakPoint = useBreakpoint();
  const [copy, setCopy] = useState("Copy");
  const [isIcon, setIcon] = useState(false);
  const [imageUrl, setImageUrl] = useState({});
  const [imageType, setImageType] = useState({});
  const [borrowData, setBorrowData] = useState(null);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [radioBtn, setRadioBtn] = useState("Assets");
  const [downloadWalletModal, setDownloadWalletModal] = useState(false);
  const [isDeleteIcon, setDeleteIcon] = useState(false);
  const [lendRequests, setLendRequests] = useState(null);
  const [enableTour, setEnableTour] = useState(false);

  const WAHEED_ADDRESS = process.env.REACT_APP_WAHEED_ADDRESS;
  const TOUR_SVG = process.env.REACT_APP_TOUR_SVG;
  const TOUR_ID = process.env.REACT_APP_TOUR_ID;
  const ASSET_SERVER = process.env.REACT_APP_ASSET_SERVER;

  const handleTour = () => {
    localStorage.setItem("isTourEnabled", true);
    setEnableTour(!enableTour);
  };

  const portfolioCards = [
    {
      title: "Active Lendings",
      icon: FaHandHolding,
      value: Number(dashboardData.activeLendings),
    },
    {
      title: "Active Borrowings",
      icon: FiArrowDownLeft,
      value: Number(dashboardData.activeBorrows),
    },
    {
      title: "Completed Loans",
      icon: BiSolidSpreadsheet,
      value: Number(dashboardData.completedLoans),
    },
    {
      title: "Lendings Value",
      icon: FaMoneyBillAlt,
      value: Number(dashboardData.lendingValue),
    },
    {
      title: "Borrowings Value",
      icon: FaMoneyBillAlt,
      value: Number(dashboardData.borrowValue),
    },
    {
      title: "Profit Earned",
      icon: HiMiniReceiptPercent,
      value: Number(dashboardData.profitEarned),
    },
  ];

  const deleteLoanRequest = async (inscriptionId) => {
    try {
      dispatch(setLoading(true));
      const deleteRequest = await api_agent.removeLoanRequest(inscriptionId);
      dispatch(setLoading(false));
      if (deleteRequest) {
        Notify("success", "Deleted loan request succcessfully");
        const remainingData = lendRequests.filter(
          (data) => data.inscriptionid !== inscriptionId
        );
        setLendRequests(remainingData);
      }
    } catch (error) {
      Notify("error", error.message);
    }
  };

  useEffect(() => {
    (async () => {
      if (
        api_agent &&
        (activeWallet.includes(XVERSE_WALLET_KEY) ||
          activeWallet.includes(UNISAT_WALLET_KEY) ||
          activeWallet.includes(MAGICEDEN_WALLET_KEY))
      ) {
        try {
          const result = await API_METHODS.get(
            `${apiUrl.Asset_server_base_url}/api/v1/fetch/assets/${
              IS_USER
                ? xverseAddress
                  ? xverseAddress
                  : unisatAddress
                  ? unisatAddress
                  : magicEdenAddress
                : WAHEED_ADDRESS
            }`
          );
          if (result.data.data.length) {
            const filteredData = result.data.data.filter(
              (asset) =>
                asset.mimeType === "text/html" ||
                asset.mimeType === "image/webp" ||
                asset.mimeType === "image/jpeg" ||
                asset.mimeType === "image/png"
            );
            const isFromApprovedAssets = filteredData.map(async (asset) => {
              return new Promise(async (resolve, _) => {
                const result = await axios.get(
                  `${ASSET_SERVER}/api/v1/fetch/asset/${asset.id}`
                );
                resolve({
                  ...result.data,
                  ...asset,
                });
              });
            });
            const revealedPromise = await Promise.all(isFromApprovedAssets);
            const finalAssets = revealedPromise.filter(
              (asset) => asset.success
            );
            const fetchCollectionDetails = finalAssets.map(async (asset) => {
              return new Promise(async (resolve, _) => {
                const result = await axios.get(
                  `${ASSET_SERVER}/api/v1/fetch/collection/${asset.data.collectionName}`
                );
                resolve({
                  ...result.data.data,
                  ...asset,
                });
              });
            });
            const finalPromise = await Promise.all(fetchCollectionDetails);
            finalPromise?.length
              ? setBorrowData(finalPromise)
              : setBorrowData([]);
            // setBorrowData(finalPromise);
          }
        } catch (error) {
          setBorrowData([]);
        }
      }
    })();
  }, [
    ASSET_SERVER,
    WAHEED_ADDRESS,
    activeWallet,
    api_agent,
    dispatch,
    magicEdenAddress,
    unisatAddress,
    xverseAddress,
  ]);

  useEffect(() => {
    if (activeWallet.length === 0) {
      setBorrowData(null);
    }
  }, [activeWallet]);

  const renderWalletAddress = (address) => (
    <>
      {address ? (
        <>
          <Tooltip arrow title={copy} trigger={"hover"} placement="top">
            <Text
              onClick={() => {
                navigator.clipboard.writeText(address);
                setCopy("Copied");
                setTimeout(() => {
                  setCopy("Copy");
                }, 2000);
              }}
              className="font-weight-600 letter-spacing-small font-medium text-color-two"
            >
              {address.slice(0, 9)}...
              {address.slice(address.length - 9, address.length)}
            </Text>
          </Tooltip>
        </>
      ) : (
        <Text className="font-weight-600 letter-spacing-small font-medium text-color-two">
          ---
        </Text>
      )}
    </>
  );

  const walletItems = (wallet) => {
    return [
      {
        label: (
          <>
            <Badge
              color={activeWallet.includes(wallet) ? "green" : "red"}
              status={activeWallet.includes(wallet) ? "processing" : "error"}
              text={
                <Text className="font-weight-600 letter-spacing-small font-medium text-color-one">
                  {wallet.toUpperCase()} WALLET
                </Text>
              }
            />
          </>
        ),
        key: wallet,
        children: (
          <Row justify={"center"}>
            <Col className="m-bottom">
              {wallet === XVERSE_WALLET_KEY ? (
                <>{renderWalletAddress(xverseAddress)}</>
              ) : wallet === UNISAT_WALLET_KEY ? (
                <>{renderWalletAddress(unisatAddress)}</>
              ) : wallet === MAGICEDEN_WALLET_KEY ? (
                <>{renderWalletAddress(magicEdenAddress)}</>
              ) : wallet === PETRA_WALLET_KEY ? (
                <>{renderWalletAddress(petraAddress)}</>
              ) : wallet === MARTIN_WALLET_KEY ? (
                <>{renderWalletAddress(martinAddress)}</>
              ) : wallet === NIGHTLY_WALLET_KEY ? (
                <>{renderWalletAddress(nightltAddress)}</>
              ) : (
                <>{renderWalletAddress(petraAddress)}</>
              )}
            </Col>
          </Row>
        ),
      },
    ];
  };

  const radioOptions = [
    {
      label: "Assets",
      value: "Assets",
    },
    {
      label: "Offers",
      value: "Offers",
    },
    {
      label: "Lendings",
      value: "Lendings",
      title: "Lendings",
    },
    {
      label: "Borrowings",
      value: "Borrowings",
    },
  ];

  return (
    <>
      <Row justify={"space-between"} align={"middle"}>
        <Col>
          <h1 className="font-xlarge gradient-text-one">Portfolio</h1>
        </Col>

        <Col>
          <Row justify={"end"} align={"middle"} gutter={32}>
            <Col
              style={{
                border: "1px solid grey",
                borderRadius: "10px",
              }}
            >
              <MdTour
                style={{ cursor: "pointer" }}
                onClick={() => setEnableTour(true)}
                color="violet"
                size={32}
              />
            </Col>
            {activeWallet.length && (
              <Col>
                <button
                  type="button"
                  onClick={() => setDownloadWalletModal(true)}
                  className="dwnld-button"
                >
                  <span className="button__text">Download Wallets</span>
                  <span className="button__icon">
                    <svg
                      className="svg"
                      data-name="Layer 2"
                      id={TOUR_ID}
                      viewBox="0 0 35 35"
                      xmlns={TOUR_SVG}
                    >
                      <path d="M17.5,22.131a1.249,1.249,0,0,1-1.25-1.25V2.187a1.25,1.25,0,0,1,2.5,0V20.881A1.25,1.25,0,0,1,17.5,22.131Z"></path>
                      <path d="M17.5,22.693a3.189,3.189,0,0,1-2.262-.936L8.487,15.006a1.249,1.249,0,0,1,1.767-1.767l6.751,6.751a.7.7,0,0,0,.99,0l6.751-6.751a1.25,1.25,0,0,1,1.768,1.767l-6.752,6.751A3.191,3.191,0,0,1,17.5,22.693Z"></path>
                      <path d="M31.436,34.063H3.564A3.318,3.318,0,0,1,.25,30.749V22.011a1.25,1.25,0,0,1,2.5,0v8.738a.815.815,0,0,0,.814.814H31.436a.815.815,0,0,0,.814-.814V22.011a1.25,1.25,0,1,1,2.5,0v8.738A3.318,3.318,0,0,1,31.436,34.063Z"></path>
                    </svg>
                  </span>
                </button>
              </Col>
            )}
          </Row>
        </Col>
      </Row>

      <Row align={"middle"} className={activeWallet.length && "mt-15"}>
        <Col>
          <Flex align="center" gap={5}>
            <FcInfo className="pointer" size={20} />
            <Text className="text-color-two font-small">
              Manage your offers, lending, and borrowing positions. Learn more.{" "}
            </Text>
          </Flex>
        </Col>
      </Row>

      {activeWallet.length ? (
        // && Object.keys(dashboardData).length
        <Row justify={"space-between"} gutter={12} className="mt-15">
          {portfolioCards.map((card, index) => {
            const { icon: Icon, title, value } = card;
            return (
              <Col md={4} key={`${title}-${index}`}>
                <Flex
                  vertical
                  className={`dash-cards-css pointer`}
                  justify="space-between"
                >
                  <Flex justify="space-between" align="center">
                    <Text
                      className={`gradient-text-one font-small letter-spacing-small`}
                    >
                      {title}
                    </Text>
                    <Icon
                      size={25}
                      color="grey"
                      style={{
                        marginTop: "-13px",
                      }}
                    />
                  </Flex>
                  <Flex
                    gap={5}
                    align="center"
                    className={`text-color-two font-small letter-spacing-small`}
                  >
                    {title.includes("Value") ? (
                      <img src={Aptos} alt="ckBtc" width={20} />
                    ) : (
                      ""
                    )}{" "}
                    {value ? value : 0}
                  </Flex>
                </Flex>
              </Col>
            );
          })}
        </Row>
      ) : (
        ""
      )}

      <Row align={"middle"} className={activeWallet.length && "mt-15"}>
        <Col xs={24} md={24}>
          <Divider className="m-top-bottom" />
        </Col>
      </Row>

      <Row align={"middle"} justify={"center"} className={"mt-15"}>
        <Radio.Group
          className="radio-css"
          options={radioOptions}
          onChange={({ target: { value } }) => {
            setRadioBtn(value);
          }}
          value={radioBtn}
          size="large"
          buttonStyle="solid"
          optionType="button"
        />
      </Row>

      <ModalDisplay
        open={enableTour}
        onOK={handleTour}
        onCancel={() => setEnableTour(false)}
        title={
          <Row className="black-bg white-color font-large letter-spacing-small iconalignment">
            <MdTour color="violet" /> Enable Tour
          </Row>
        }
      >
        <Text className="white-color font-medium">
          Are you sure you want to enable tour ?
        </Text>
      </ModalDisplay>

      <ModalDisplay
        open={downloadWalletModal}
        footer={null}
        onCancel={() => setDownloadWalletModal(false)}
        title={
          <Row className="black-bg white-color font-large letter-spacing-small iconalignment">
            Supported Wallets
          </Row>
        }
      >
        <WalletUI isAirdrop={false} />
      </ModalDisplay>
    </>
  );
};
export default propsContainer(Portfolio);
