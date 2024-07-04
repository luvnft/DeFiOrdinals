import {
  Col,
  Divider,
  Dropdown,
  Flex,
  Grid,
  Radio,
  Row,
  Typography,
} from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { BiSolidSpreadsheet } from "react-icons/bi";
import { FaHandHolding, FaMoneyBillAlt } from "react-icons/fa";
import { FcApproval, FcInfo } from "react-icons/fc";
import { FiArrowDownLeft } from "react-icons/fi";
import { HiMiniReceiptPercent } from "react-icons/hi2";
import { MdTour } from "react-icons/md";
import Aptos from "../../assets/wallet-logo/aptos_logo.png";
import WalletUI from "../../component/download-wallets-UI";
import ModalDisplay from "../../component/modal";
import { propsContainer } from "../../container/props-container";
import {
  API_METHODS,
  IS_USER,
  MAGICEDEN_WALLET_KEY,
  UNISAT_WALLET_KEY,
  XVERSE_WALLET_KEY,
  apiUrl,
} from "../../utils/common";
import TableComponent from "../../component/table";
import { Bars } from "react-loading-icons";
import CustomButton from "../../component/Button";

const Portfolio = (props) => {
  const { api_agent } = props.wallet;
  const { reduxState, dispatch } = props.redux;
  const activeWallet = reduxState.wallet.active;
  const userAssets = reduxState.constant.userAssets;
  // const xverseWallet = reduxState.wallet.xverse;
  // const unisatWallet = reduxState.wallet.unisat;
  // const magicEdenWallet = reduxState.wallet.magicEden;
  const walletState = reduxState.wallet;
  const btcValue = reduxState.constant.btcvalue;
  const xverseAddress = walletState.xverse.ordinals.address;
  const unisatAddress = walletState.unisat.address;
  const magicEdenAddress = walletState.magicEden.ordinals.address;
  // const petraAddress = walletState.petra.address;
  // const martinAddress = walletState.martin.address;
  // const nightltAddress = walletState.nightly.address;
  const dashboardData = reduxState.constant.dashboardData;

  const { Text } = Typography;
  const { useBreakpoint } = Grid;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [handleSupplyModal, setHandleSupplyModal] = useState(false);
  const [supplyModalItems, setSupplyModalItems] = useState(null);
  const [radioBtn, setRadioBtn] = useState("Assets");
  const [downloadWalletModal, setDownloadWalletModal] = useState(false);
  const [enableTour, setEnableTour] = useState(false);

  const TOUR_SVG = process.env.REACT_APP_TOUR_SVG;
  const TOUR_ID = process.env.REACT_APP_TOUR_ID;
  const CONTENT_API = process.env.REACT_APP_ORDINALS_CONTENT_API;
  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;

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

  const assetTableColumns = [
    {
      key: "Asset",
      title: "Asset",
      align: "center",
      dataIndex: "asset",
      render: (_, obj) => (
        <>
          <Flex gap={5} vertical align="center">
            {obj.contentType === "image/webp" ||
            obj.contentType === "image/jpeg" ||
            obj.contentType === "image/png" ? (
              <img
                src={`${CONTENT_API}/content/${obj.id}`}
                alt={`${obj.id}-borrow_image`}
                className="border-radius-30"
                width={70}
                height={70}
              />
            ) : obj.contentType === "image/svg" ||
              obj.contentType === "text/html;charset=utf-8" ||
              obj.contentType === "text/html" ||
              obj.contentType === "image/svg+xml" ? (
              <iframe
                loading="lazy"
                width={"80px"}
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
                  className="text-color-one font-small letter-spacing-small"
                >
                  <img src={Aptos} alt="noimage" width={20} height={20} />
                  {(obj.collection.floorPrice / BTC_ZERO).toFixed(2)}
                </Flex>
                <span className="text-color-two font-xsmall letter-spacing-small">
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
                onClick: () => setSupplyModalItems(obj),
              }}
            >
              Supply
            </Dropdown.Button>
          </Flex>
        );
      },
    },
  ];

  useEffect(() => {
    if (activeWallet.length === 0) {
      // setBorrowData(null);
    }
  }, [activeWallet]);

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
        <Col md={24}>
          <Flex className="page-box" align="center" gap={5}>
            <FcInfo className="pointer" size={20} />
            <Text className="text-color-two font-small">
              Manage your offers, lending, and borrowing positions. Learn more.{" "}
            </Text>
          </Flex>
        </Col>
      </Row>

      {activeWallet.length ? (
        // && Object.keys(dashboardData).length
        <Row justify={"space-between"} gutter={12} className="mt-20">
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
                        marginTop: index === 0 ? "-13px" : "",
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

      <Row
        className="mt-15"
        justify={!activeWallet.length ? "center" : "start"}
      >
        <Col md={!activeWallet.length ? "" : 24}>
          {!activeWallet.length ? (
            <Text className="text-color-one font-medium">Connect wallet!</Text>
          ) : radioBtn === "Assets" ? (
            <Row className="mt-20 pad-bottom-30" gutter={32}>
              <Col xl={24}>
                <Row className="m-bottom">
                  <Col xl={24}>
                    <TableComponent
                      loading={{
                        spinning: userAssets === null,
                        indicator: <Bars />,
                      }}
                      pagination={{ pageSize: 5 }}
                      rowKey={(e) => `${e?.id}-${e?.inscriptionNumber}`}
                      tableColumns={assetTableColumns}
                      tableData={userAssets}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          ) : (
            ""
          )}
        </Col>
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
