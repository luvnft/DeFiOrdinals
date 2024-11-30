import {
  Col,
  Divider,
  Dropdown,
  Flex,
  Radio,
  Row,
  Statistic,
  Tooltip,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { BiSolidSpreadsheet } from "react-icons/bi";
import { FaHandHolding, FaMoneyBillAlt } from "react-icons/fa";
import { FcApproval, FcInfo } from "react-icons/fc";
import { FiArrowDownLeft } from "react-icons/fi";
import { HiMiniReceiptPercent } from "react-icons/hi2";
import { MdContentCopy, MdDeleteForever, MdTour } from "react-icons/md";
import { Bars } from "react-loading-icons";
import Aptos from "../../assets/wallet-logo/aptos_logo.png";
import CustomButton from "../../component/Button";
import WalletUI from "../../component/download-wallets-UI";
import ModalDisplay from "../../component/modal";
import TableComponent from "../../component/table";
import { propsContainer } from "../../container/props-container";
import {
  Capitalaize,
  DateTimeConverter,
  daysDifferenceFromNow,
  getTimeAgo,
  sliceAddress,
} from "../../utils/common";
import { IoWarningSharp } from "react-icons/io5";

const Portfolio = (props) => {
  const { reduxState } = props.redux;
  const activeWallet = reduxState.wallet.active;
  const userAssets = reduxState.constant.userAssets;
  // const xverseWallet = reduxState.wallet.xverse;
  // const unisatWallet = reduxState.wallet.unisat;
  // const magicEdenWallet = reduxState.wallet.magicEden;
  const walletState = reduxState.wallet;
  const btcValue = reduxState.constant.btcvalue;
  // const xverseAddress = walletState.xverse.ordinals.address;
  // const unisatAddress = walletState.unisat.address;
  // const magicEdenAddress = walletState.magicEden.ordinals.address;
  const petraAddress = walletState.petra.address;
  // const martinAddress = walletState.martin.address;
  // const nightltAddress = walletState.nightly.address;
  const dashboardData = reduxState.constant.dashboardData;
  const allBorrowRequest = reduxState.constant.allBorrowRequest;
  const allLendRequest = reduxState.constant.allLendRequest;

  const { Text } = Typography;
  const { Countdown } = Statistic;
  // const { useBreakpoint } = Grid;
  const [copy, setCopy] = useState("Copy");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [handleSupplyModal, setHandleSupplyModal] = useState(false);
  const [supplyModalItems, setSupplyModalItems] = useState(null);
  const [userOffers, setUserOffers] = useState(null);
  const [userBorrows, setUserBorrows] = useState(null);
  const [userLends, setUserLends] = useState(null);
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

  const handleOk = () => {
    setIsModalOpen(false);
    setHandleSupplyModal(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setHandleSupplyModal(false);
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

  const userRequestColumns = [
    {
      key: "ordinal",
      title: "Ordinal",
      align: "center",
      dataIndex: "ordinal",
      render: (_, obj) => (
        <Flex vertical justify="center" align="center">
          <img
            className="border-radius-8"
            alt={`lend_image`}
            src={obj.contentURL}
            onError={(e) =>
              (e.target.src = `${process.env.PUBLIC_URL}/collections/${obj.collectionSymbol}.png`)
            }
            width={70}
          />
          <span className={`font-xsmall text-color-two letter-spacing-small`}>
            #{obj.inscriptionNumber}{" "}
          </span>
        </Flex>
      ),
    },
    {
      key: "loanAmount",
      title: "Loan Amount",
      align: "center",
      dataIndex: "loanAmount",
      render: (_, obj) => (
        <Flex align="center" justify="center" gap={3}>
          <img src={Aptos} alt="noimage" width="20px" />{" "}
          <Text className="text-color-one">
            {(obj.loan_amount / BTC_ZERO).toFixed(2)}{" "}
          </Text>
        </Flex>
      ),
    },
    {
      key: "platformFee",
      title: "Platform Fee",
      align: "center",
      dataIndex: "platformFee",
      render: (_, obj) => (
        <Flex align="center" justify="center" gap={3}>
          <img src={Aptos} alt="noimage" width="20px" />{" "}
          <Text className="text-color-one">
            {(obj.platform_fee / BTC_ZERO).toFixed(2)}{" "}
          </Text>
        </Flex>
      ),
    },
    {
      key: "repayAmount",
      title: "Repay Amount",
      align: "center",
      dataIndex: "repayAmount",
      render: (_, obj) => (
        <Flex align="center" justify="center" gap={3}>
          <img src={Aptos} alt="noimage" width="20px" />{" "}
          <Text className="text-color-one">
            {((obj.repayment_amount - obj.loan_amount) / BTC_ZERO).toFixed(2)}{" "}
          </Text>
        </Flex>
      ),
    },
    {
      key: "Date",
      title: "Date",
      align: "center",
      dataIndex: "loanTime",
      render: (_, obj) => {
        const [date, time] = DateTimeConverter(Number(obj.timestamp) * 1000);
        return (
          <Flex vertical gap={3}>
            <Text
              className={`text-color-one font-size-16 letter-spacing-small`}
            >
              {date}, {time}
            </Text>
            <Text
              className={`text-color-one font-size-16 letter-spacing-small`}
            >
              {getTimeAgo(Number(obj.timestamp) * 1000)}
            </Text>
          </Flex>
        );
      },
    },
    {
      key: "action",
      title: " ",
      align: "center",
      dataIndex: "action",
      render: (_, obj) => <MdDeleteForever color="red" size={25} />,
    },
  ];

  const BorrowLendColumns = [
    {
      key: "ordinal",
      title: "Ordinal",
      align: "center",
      dataIndex: "ordinal",
      render: (_, obj) => (
        <Flex vertical justify="center" align="center">
          <img
            className="border-radius-8"
            alt={`lend_image`}
            src={obj.contentURL}
            onError={(e) =>
              (e.target.src = `${process.env.PUBLIC_URL}/collections/${obj.collectionSymbol}.png`)
            }
            width={70}
          />
          <span className={`font-xsmall text-color-two letter-spacing-small`}>
            #{obj.inscriptionNumber}{" "}
          </span>
        </Flex>
      ),
    },
    {
      key: "loanAmount",
      title: "Loan Amount",
      align: "center",
      dataIndex: "loanAmount",
      render: (_, obj) => (
        <Flex align="center" justify="center" gap={3}>
          <img src={Aptos} alt="noimage" width="20px" />{" "}
          <Text className="text-color-one">
            {(obj.loan_amount / BTC_ZERO).toFixed(2)}{" "}
          </Text>
        </Flex>
      ),
    },
    {
      key: "platformFee",
      title: "Platform Fee",
      align: "center",
      dataIndex: "platformFee",
      render: (_, obj) => (
        <Flex align="center" justify="center" gap={3}>
          <img src={Aptos} alt="noimage" width="20px" />{" "}
          <Text className="text-color-one">
            {(obj.platform_fee / BTC_ZERO).toFixed(2)}{" "}
          </Text>
        </Flex>
      ),
    },
    {
      key: "repayAmount",
      title: "Repay Amount",
      align: "center",
      dataIndex: "repayAmount",
      render: (_, obj) => (
        <Flex align="center" justify="center" gap={3}>
          <img src={Aptos} alt="noimage" width="20px" />{" "}
          <Text className="text-color-one">
            {((obj.repayment_amount - obj.loan_amount) / BTC_ZERO).toFixed(2)}{" "}
          </Text>
        </Flex>
      ),
    },
    {
      key: "Date",
      title: "Start Date / Time",
      align: "center",
      dataIndex: "loanTime",
      render: (_, obj) => {
        const [date, time] = DateTimeConverter(
          Number(obj.loanstart_time) * 1000
        );
        return (
          <Flex vertical gap={3}>
            <Text
              className={`text-color-one font-size-16 letter-spacing-small`}
            >
              {date}, {time}
            </Text>
            <Text
              className={`text-color-one font-size-16 letter-spacing-small`}
            >
              {getTimeAgo(Number(obj.loanstart_time) * 1000)}
            </Text>
          </Flex>
        );
      },
    },
    {
      key: "Date",
      title: "End Date / Time",
      align: "center",
      dataIndex: "loanTime",
      render: (_, obj) => {
        const [date, time] = DateTimeConverter(Number(obj.loanend_time) * 1000);
        return (
          <Flex vertical gap={3}>
            <Text
              className={`text-color-one font-size-16 letter-spacing-small`}
            >
              {date}, {time}
            </Text>
            <Text
              className={`text-color-one font-size-16 letter-spacing-small`}
            >
              <Countdown value={Number(obj.loanend_time) * 1000} />
              {parseInt(
                daysDifferenceFromNow(Number(obj.loanend_time) * 1000)
              )}{" "}
              days left
            </Text>
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

  useEffect(() => {
    if (activeWallet.length && allBorrowRequest?.length) {
      const userOfferReq = allBorrowRequest.filter(
        (predict) => predict.borrower === petraAddress
      );
      setUserOffers(userOfferReq);
    }
  }, [activeWallet, allBorrowRequest, petraAddress]);

  useEffect(() => {
    if (activeWallet.length && allLendRequest?.length) {
      const userLendReq = allLendRequest.filter(
        (predict) => predict.lender === petraAddress
      );

      const userBorrowReq = allLendRequest.filter(
        (predict) => predict.borrower === petraAddress
      );

      setUserLends(userLendReq);
      setUserBorrows(userBorrowReq);
    }
  }, [activeWallet, allLendRequest, petraAddress]);

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
                  className={`dash-cards-css box-shadow-white pointer`}
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
          ) : radioBtn === "Offers" ? (
            <Row className="mt-40 pad-bottom-30" gutter={32}>
              <Col xl={24}>
                <Row className="m-bottom">
                  <Col xl={24}>
                    <TableComponent
                      loading={{
                        spinning: userOffers === null,
                        indicator: <Bars />,
                      }}
                      pagination={{ pageSize: 5 }}
                      rowKey={(e) => `${e?.loanAmount}-${e?.requestId}`}
                      tableColumns={userRequestColumns}
                      tableData={userOffers}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          ) : radioBtn === "Lendings" ? (
            <Row className="mt-40 pad-bottom-30" gutter={32}>
              <Col xl={24}>
                <Row className="m-bottom">
                  <Col xl={24}>
                    <TableComponent
                      loading={{
                        spinning: userLends === null,
                        indicator: <Bars />,
                      }}
                      pagination={{ pageSize: 5 }}
                      rowKey={(e) => `${e?.loanAmount}-${e?.requestId}`}
                      tableColumns={[
                        ...BorrowLendColumns,
                        {
                          key: "action",
                          title: " ",
                          align: "center",
                          dataIndex: "action",
                          render: (_, obj) => (
                            <CustomButton
                              className={
                                "click-btn font-weight-600 letter-spacing-small"
                              }
                              title={
                                <Flex align="center" justify="center" gap={10}>
                                  <span
                                    className={`text-color-one font-weight-600 pointer iconalignment font-size-16`}
                                  >
                                    Repay
                                  </span>
                                </Flex>
                              }
                            />
                          ),
                        },
                      ]}
                      tableData={userLends}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          ) : radioBtn === "Borrowings" ? (
            <Row className="mt-40 pad-bottom-30" gutter={32}>
              <Col xl={24}>
                <Row className="m-bottom">
                  <Col xl={24}>
                    <TableComponent
                      loading={{
                        spinning: userBorrows === null,
                        indicator: <Bars />,
                      }}
                      pagination={{ pageSize: 5 }}
                      rowKey={(e) => `${e?.loanAmount}-${e?.requestId}`}
                      tableColumns={BorrowLendColumns}
                      tableData={userBorrows}
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
                {supplyModalItems &&
                  (supplyModalItems?.mimeType === "text/html" ? (
                    <iframe
                      className="border-radius-30"
                      title={`${supplyModalItems?.id}-borrow_image`}
                      height={300}
                      width={300}
                      src={`${CONTENT_API}/content/${supplyModalItems?.id}`}
                    />
                  ) : (
                    <>
                      <img
                        src={`${CONTENT_API}/content/${supplyModalItems?.id}`}
                        alt={`${supplyModalItems?.id}-borrow_image`}
                        className="border-radius-30"
                        width={125}
                      />
                      <Row>
                        <Text className="text-color-one ml">
                          <span className="font-weight-600 font-small ">
                            ${" "}
                          </span>
                          {(
                            (Number(supplyModalItems?.collection?.floorPrice) /
                              BTC_ZERO) *
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
                      #{supplyModalItems?.inscriptionNumber}
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
                      {sliceAddress(supplyModalItems?.id, 7)}
                      <Tooltip
                        arrow
                        title={copy}
                        trigger={"hover"}
                        placement="top"
                      >
                        <MdContentCopy
                          className="pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(supplyModalItems?.id);
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
                {Capitalaize(supplyModalItems?.collection?.symbol)}
              </Text>
            </Row>

            <Row className="mt-30" justify={"space-between"}>
              <Flex vertical className="borrowDataStyle">
                <Text className="text-color-two font-small">Floor Price</Text>

                <Text className="text-color-one font-small font-weight-600">
                  {supplyModalItems?.collection.floorPrice / BTC_ZERO}
                </Text>
              </Flex>
              <Flex vertical className="borrowDataStyle">
                <Text className="text-color-two font-small">Total Listed</Text>

                <Text className="text-color-one font-small font-weight-600">
                  {supplyModalItems?.collection.totalListed}
                </Text>
              </Flex>
              <Flex vertical className="borrowDataStyle">
                <Text className="text-color-two font-small">Total Volume</Text>

                <Text className="text-color-one font-small font-weight-600">
                  {supplyModalItems?.collection.totalVolume}
                </Text>
              </Flex>
            </Row>

            <Row justify={"space-between"} className="m-25">
              <Flex vertical>
                <Text className="text-color-two font-small">Owners</Text>

                <Row justify={"center"}>
                  <Text className="text-color-one font-small font-weight-600">
                    {supplyModalItems?.collection.owners}
                  </Text>
                </Row>
              </Flex>
              <Flex vertical>
                <Text className="text-color-two font-small ">
                  Pending Transactions
                </Text>
                <Row justify={"center"}>
                  <Text className="text-color-one font-small font-weight-600">
                    {supplyModalItems?.collection.pendingTransactions}
                  </Text>
                </Row>
              </Flex>
              <Flex vertical>
                <Text className="text-color-two font-small">Supply</Text>
                <Row justify={"center"}>
                  <Text className="text-color-one font-small font-weight-600">
                    {supplyModalItems?.collection.supply}
                  </Text>
                </Row>
              </Flex>
            </Row>
          </Col>
        </Row>
      </ModalDisplay>

      {/* Custody supply address display */}
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
    </>
  );
};
export default propsContainer(Portfolio);
