import {
  Col,
  Collapse,
  Divider,
  Flex,
  Input,
  Row,
  Slider,
  Tooltip,
  Typography,
} from "antd";
import React, { useState } from "react";
import { BiSolidOffer } from "react-icons/bi";
import { FaCaretDown, FaWallet } from "react-icons/fa";
import { GoAlertFill } from "react-icons/go";
import { PiPlusSquareThin } from "react-icons/pi";
import { TbInfoSquareRounded } from "react-icons/tb";
import { Bars } from "react-loading-icons";
import ckBtc from "../../assets/coin_logo/ckbtc.png";
import Aptos from "../../assets/wallet-logo/aptos_logo.png";
import CustomButton from "../../component/Button";
import ModalDisplay from "../../component/modal";
import TableComponent from "../../component/table";
import { propsContainer } from "../../container/props-container";

const Dashboard = (props) => {
  /* global BigInt */
  const { reduxState, isPlugError } = props.redux;
  const approvedCollections = reduxState.constant.approvedCollections;
  const activeWallet = reduxState.wallet.active;

  const btcvalue = reduxState.constant.btcvalue;
  const aptosvalue = reduxState.constant.aptosvalue;

  const { Text } = Typography;
  // USE STATE
  const [isLendModal, setIsLendModal] = useState(false);
  const [lendModalData, setLendModalData] = useState({});
  const [collapseActiveKey, setCollapseActiveKey] = useState(["2"]);
  const [isOfferBtnLoading, setIsOfferBtnLoading] = useState(false);
  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;

  const approvedCollectionColumns = [
    {
      key: "Collection",
      title: "Collection",
      align: "center",
      dataIndex: "collectionName",
      render: (_, obj) => {
        const name = obj?.data?.name;
        const nameSplitted = obj?.data?.name?.split(" ");
        let modifiedName = "";
        nameSplitted?.forEach((word) => {
          if ((modifiedName + word).length < 25) {
            modifiedName = modifiedName + " " + word;
          }
        });
        return (
          <Flex vertical justify="center" align="center">
            <img
              className="border-radius-5 loan-cards"
              width={"75px"}
              height={"75px"}
              alt={"collection_images"}
              src={obj?.data?.imageURI}
              onError={(e) =>
                (e.target.src = `${process.env.PUBLIC_URL}/collections/${obj?.data?.symbol}.png`)
              }
            />
            <Flex>
              {name?.length > 35 ? (
                <Tooltip arrow title={name}>
                  <Text className="heading-one font-small text-color-one">
                    {`${modifiedName}...`}
                  </Text>
                </Tooltip>
              ) : (
                <Text className="heading-one font-small text-color-one">
                  {modifiedName}
                </Text>
              )}
            </Flex>
          </Flex>
        );
      },
    },
    {
      key: "Offer",
      title: "Offer",
      align: "center",
      dataIndex: "Offer",
      render: (_, obj) => {
        return (
          <Flex align="center" vertical justify="center" gap={5}>
            <Text className="text-color-one">
              {obj?.loanAmount ? obj.loanAmount : 0}
            </Text>

            <Text
              className={`text-color-one border-radius-30 card-box pointer border-color-dark iconalignment shine font-size-16 letter-spacing-small`}
            >
              <BiSolidOffer />
              Offers
            </Text>
          </Flex>
        );
      },
    },
    {
      key: "APY",
      title: "APY",
      align: "center",
      dataIndex: "APY",
      render: (_, obj) => <Text className={"text-color-one"}>{520}%</Text>,
    },
    {
      key: "Term",
      title: "Term",
      align: "center",
      dataIndex: "terms",
      render: (_, obj) => <Text className={"text-color-one"}>{5} Days</Text>,
    },
    {
      key: "LTV",
      title: "LTV",
      align: "center",
      dataIndex: "ltv",
      render: (_, obj) => {
        return (
          <Text className={"text-color-one"}>
            {obj?.loanToValue ? obj.loanToValue : 0}%
          </Text>
        );
      },
    },
    {
      key: "Floor",
      title: "Floor",
      align: "center",
      dataIndex: "floor",
      render: (_, obj) => (
        <Flex align="center" vertical gap={5}>
          <Flex align="center" gap={5} className={"text-color-one"}>
            <img src={Aptos} alt="noimage" width="20px" />{" "}
            {(((obj.floorPrice / BTC_ZERO) * btcvalue) / aptosvalue).toFixed(2)}{" "}
          </Flex>
        </Flex>
      ),
    },
    {
      key: "ActionButtons",
      title: " ",
      width: "25%",
      align: "center",
      render: (_, obj) => {
        return (
          <CustomButton
            className={"click-btn font-weight-600 letter-spacing-small"}
            title={"Lend"}
            size="medium"
            onClick={() => {
              toggleLendModal();
              setLendModalData({
                ...lendModalData,
                collectionURI: obj?.data?.imageURI,
                collectionName: obj?.data?.name,
                symbol: obj?.data?.symbol,
                floorPrice: "0.24",
                amount: "0.00256",
                APY: "50",
                term: "7",
                sliderLTV: "50",
                interest: "0.003",
              });
            }}
          />
        );
      },
    },
  ];

  const toggleLendModal = () => {
    setIsLendModal(!isLendModal);
  };

  const calcLendData = (amount) => {
    const interest = (amount * lendModalData.interestTerm).toFixed(6);
    // Calc 15% of platform fee.
    const platformFee = ((interest * 15) / 100).toFixed(6);
    return {
      interest,
      platformFee,
    };
  };

  return (
    <>
      <Row justify={"space-between"} align={"middle"}>
        <Col>
          <h1 className="font-xlarge gradient-text-one">Lending</h1>
        </Col>
      </Row>

      <Row justify={"center"} className="m-bottom">
        <Col
          md={24}
          style={{
            marginBottom: "50px",
          }}
        >
          <TableComponent
            loading={{
              spinning: !approvedCollections[0],
              indicator: <Bars />,
            }}
            pagination={false}
            rowKey={(e) => `${e?.inscriptionid}-${e?.mime_type}`}
            tableData={approvedCollections[0] ? approvedCollections : []}
            tableColumns={approvedCollectionColumns}
          />
        </Col>
      </Row>

      <ModalDisplay
        footer={null}
        title={
          <Flex align="center" gap={5} justify="start">
            <Text
              className={`font-size-20 text-color-one letter-spacing-small`}
            >
              {lendModalData.collectionName}
            </Text>
          </Flex>
        }
        open={isLendModal}
        onCancel={toggleLendModal}
        width={"35%"}
      >
        {/* Lend Image Display */}
        <Row justify={"space-between"} className="mt-30">
          <Col md={3}>
            <img
              className="border-radius-5"
              alt={`lend_image`}
              src={lendModalData.collectionURI}
              onError={(e) =>
                (e.target.src = `${process.env.PUBLIC_URL}/collections/${lendModalData.symbol}.png`)
              }
              width={80}
            />
          </Col>

          <Col md={5}>
            <Flex
              vertical
              justify="center"
              align="center"
              className={`card-box border pointer`}
            >
              <Text
                className={`font-small text-color-one letter-spacing-small`}
              >
                Floor
              </Text>
              <Text
                className={`font-size-16 text-color-two letter-spacing-small`}
              >
                ∞ {lendModalData.floorPrice}
              </Text>
            </Flex>
          </Col>

          <Col md={5}>
            <Flex
              vertical
              justify="center"
              align="center"
              className={`card-box border pointer`}
            >
              <Text
                className={`font-small text-color-one letter-spacing-small`}
              >
                Term
              </Text>
              <Text
                className={`font-size-16 text-color-two letter-spacing-small`}
              >
                {lendModalData.term} Days
              </Text>
            </Flex>
          </Col>

          <Col md={5}>
            <Flex
              vertical
              justify="center"
              align="center"
              className={`card-box border pointer`}
            >
              <Text
                className={`font-small text-color-one letter-spacing-small`}
              >
                APY
              </Text>
              <Text
                className={`font-size-16 text-color-two letter-spacing-small`}
              >
                {lendModalData.APY}%
              </Text>
            </Flex>
          </Col>
        </Row>

        {/* Lend Divider */}
        <Row justify={"center"}>
          <Divider />
        </Row>

        {/* Lend Alerts */}
        {activeWallet.length ? (
          // && ckBtcBalance < lendModalData.amount
          <Row>
            <Col md={24} className={`modalBoxRedShadow`}>
              <Flex align="center" gap={10}>
                <FaWallet
                  size={20}
                  //  color={theme ? "#d7d73c" : "#e54b64"}
                />
                <span className={`font-small letter-spacing-small`}>
                  Insufficient ckBTC !
                </span>
              </Flex>
            </Col>
          </Row>
        ) : (
          ""
        )}

        {lendModalData.amount > lendModalData.exceedRange && (
          <Row className="mt-15">
            <Col md={24} className={`modalBoxRedShadow`}>
              <Flex align="center" gap={10}>
                <GoAlertFill
                  size={20}
                  //  color={theme ? "#d7d73c" : "#e54b64"}
                />
                <span className={`font-small letter-spacing-small`}>
                  Close to floor price !
                </span>
              </Flex>
            </Col>
          </Row>
        )}

        {/* Lend Inputs */}
        <Row
          justify={"space-between"}
          className={
            lendModalData.amount > lendModalData.exceedRange ||
            activeWallet.length
              ? // && ckBtcBalance < lendModalData.amount
                "mt-15"
              : ""
          }
        >
          <Col md={11}>
            <Flex
              vertical
              align="start"
              className={`input-themed amount-input`}
            >
              <Text
                className={`font-size-16 text-color-one letter-spacing-small`}
              >
                Amount
              </Text>
              <Input
                value={lendModalData.amount}
                onChange={(e) => {
                  const input = e.target.value;
                  const inputNumber = Number(e.target.value);

                  if (isNaN(input)) {
                    return;
                  }
                  if (inputNumber > lendModalData.maxQuoted) {
                    return;
                  }

                  const { interest, platformFee } = calcLendData(inputNumber);

                  const LTV = Math.round(
                    ((inputNumber * btcvalue) / lendModalData.nftUSD) * 100
                  );

                  setLendModalData((ext) => ({
                    ...ext,
                    platformFee,
                    amount: input,
                    sliderLTV: LTV,
                    interest: interest ? interest : "0.00",
                  }));
                }}
                // ref={amountRef}
                prefix={
                  <img
                    className="round"
                    src={ckBtc}
                    alt="noimage"
                    style={{ justifyContent: "center" }}
                    width={25}
                  />
                }
                placeholder={`Max ${lendModalData.maxQuoted}`}
                size="large"
                suffix={
                  <Text className={`text-color-one font-xsmall`}>
                    $ {(lendModalData.amount * btcvalue).toFixed(2)}
                  </Text>
                }
              />
            </Flex>
          </Col>

          <Col md={11}>
            <Flex vertical align="start" className={`input-themed`}>
              <Text
                className={`font-size-16 text-color-one letter-spacing-small`}
              >
                Interest
              </Text>
              <Input
                value={lendModalData.interest}
                size="large"
                readOnly
                prefix={
                  <img
                    className="round"
                    src={ckBtc}
                    alt="noimage"
                    style={{ justifyContent: "center" }}
                    width={25}
                  />
                }
                suffix={
                  <Text className={`text-color-one font-xsmall`}>
                    $ {(lendModalData.interest * btcvalue).toFixed(2)}
                  </Text>
                }
              />
            </Flex>
          </Col>
        </Row>

        {/* Lend Balance Display */}
        <Row justify={"space-between"} className="mt-3" align={"middle"}>
          <Col className="pointer">
            {/* {activeWallet.length && (
              <Flex justify="center" gap={10} align="center">
                <Text
                  className={`font-size-16 letter-spacing-small`}
                >
                  Balance =
                </Text>

                {ckBtcBalance ? (
                  <Text
                    className={`${
                      theme ? "text-color-one" : "light-color-primary"
                    } font-size-16 letter-spacing-small`}
                  >
                    {ckBtcBalance}
                  </Text>
                ) : (
                  <Loading
                    spin={!ckBtcBalance}
                    indicator={
                      <TailSpin stroke="#6a85f1" alignmentBaseline="central" />
                    }
                  />
                )}
                <img
                  className="round"
                  src={ckBtc}
                  alt="noimage"
                  style={{ justifyContent: "center" }}
                  width={20}
                />
              </Flex>
            )} */}
          </Col>

          <Col className="pointer">
            <Flex justify="center" gap={5} align="center">
              <Text className={`font-size-16 letter-spacing-small`}>
                {lendModalData.interestPerDay}%
              </Text>

              <Text className={`font-size-16 letter-spacing-small`}>/ day</Text>
            </Flex>
          </Col>
        </Row>

        {/* Lend Slider */}
        <Row justify={"space-between"} className="mt-15" align={"middle"}>
          <Col md={5} className={`card-box border pointer`}>
            <Flex justify="center" gap={5} align="center">
              <Text
                className={`font-size-16 text-color-one letter-spacing-small`}
              >
                LTV -
              </Text>

              <Text
                className={`font-size-16 text-color-one letter-spacing-small`}
              >
                {lendModalData.sliderLTV}
              </Text>
            </Flex>
          </Col>
          <Col md={16}>
            <Slider
              min={1}
              className={"slider-themed"}
              max={100}
              onChange={(LTV) => {
                const amount = (
                  (LTV / 100) *
                  Number(lendModalData.nftUSD) *
                  lendModalData.oneckBtc
                ).toFixed(6);

                const { interest, platformFee } = calcLendData(amount);

                setLendModalData({
                  ...lendModalData,
                  amount: Number(amount),
                  sliderLTV: LTV,
                  platformFee,
                  interest,
                });
              }}
              value={lendModalData.sliderLTV}
            />
          </Col>
          <Col md={2}>
            <PiPlusSquareThin
              className="pointer ant-popconfirm-message-icon"
              size={30}
              color="grey"
              onClick={() => {
                const LTV = lendModalData.sliderLTV + 1;
                if (LTV <= 100) {
                  const amount = (
                    (LTV / 100) *
                    Number(lendModalData.nftUSD) *
                    lendModalData.oneckBtc
                  ).toFixed(6);

                  const interest = (
                    Number(amount) * lendModalData.interestTerm
                  ).toFixed(6);

                  const platformFee = ((interest * 15) / 100).toFixed(6);

                  setLendModalData({
                    ...lendModalData,
                    sliderLTV: LTV,
                    platformFee,
                    amount: Number(amount),
                    interest,
                  });
                }
              }}
            />
          </Col>
        </Row>

        {/* Lend Offer Summary */}
        <Row className="mt-30">
          <Col md={24} className="collapse-antd">
            <Collapse
              className="border"
              size="small"
              ghost
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
              defaultActiveKey={["2"]}
              activeKey={collapseActiveKey}
              onChange={() => {
                if (collapseActiveKey[0] === "2") {
                  setCollapseActiveKey(["1"]);
                } else {
                  setCollapseActiveKey(["2"]);
                }
              }}
              items={[
                {
                  key: "1",
                  label: (
                    <Text
                      className={`font-size-16 text-color-one letter-spacing-small`}
                    >
                      Offer Summary
                    </Text>
                  ),
                  children: (
                    <>
                      <Row justify={"space-between"}>
                        <Col>
                          <Text
                            className={`font-size-16 text-color-one letter-spacing-small`}
                          >
                            Loan amount
                          </Text>
                        </Col>
                        <Col>
                          <Flex align="center" gap={10}>
                            <Text
                              className={`card-box border text-color-two padding-small-box padding-small-box font-xsmall`}
                            >
                              $ {(lendModalData.amount * btcvalue).toFixed(2)}
                            </Text>

                            <Text
                              className={`font-size-16 text-color-one letter-spacing-small`}
                            >
                              ~ {lendModalData.amount}
                            </Text>
                            <img
                              className="round"
                              src={ckBtc}
                              alt="noimage"
                              style={{ justifyContent: "center" }}
                              width={25}
                            />
                          </Flex>
                        </Col>
                      </Row>

                      <Row justify={"space-between"} className="mt-5">
                        <Col>
                          <Text
                            className={`font-size-16 text-color-one letter-spacing-small`}
                          >
                            Interest
                          </Text>
                        </Col>
                        <Col>
                          <Flex align="center" gap={10}>
                            <Text
                              className={`card-box border text-color-two padding-small-box font-xsmall`}
                            >
                              $ {(lendModalData.interest * btcvalue).toFixed(2)}
                            </Text>

                            <Text
                              className={`font-size-16 text-color-one letter-spacing-small`}
                            >
                              ~ {lendModalData.interest}
                            </Text>
                            <img
                              className="round"
                              src={ckBtc}
                              alt="noimage"
                              style={{ justifyContent: "center" }}
                              width={25}
                            />
                          </Flex>
                        </Col>
                      </Row>

                      <Row justify={"space-between"} className="mt-5">
                        <Col>
                          <Text
                            className={`font-size-16 text-color-one letter-spacing-small`}
                          >
                            Platform fee
                          </Text>
                        </Col>
                        <Col>
                          <Flex align="center" gap={10}>
                            <Text
                              className={`card-box border text-color-two padding-small-box font-xsmall`}
                            >
                              ${" "}
                              {(lendModalData.platformFee * btcvalue).toFixed(
                                2
                              )}
                            </Text>

                            <Text
                              className={`font-size-16 text-color-one letter-spacing-small`}
                            >
                              ~ {lendModalData.platformFee}
                            </Text>
                            <img
                              className="round"
                              src={ckBtc}
                              alt="noimage"
                              style={{ justifyContent: "center" }}
                              width={25}
                            />
                          </Flex>
                        </Col>
                      </Row>

                      <Row className="mt-5">
                        <Col>
                          <span className={`font-xsmall text-color-two`}>
                            <TbInfoSquareRounded
                              size={12}
                              // color={theme ? "#adadad" : "#333333"}
                            />{" "}
                            {`Once a borrow accepts the offer and the loan is
                        started they will have ${lendModalData.term} days to repay the loan. If
                        the loan is not repaid you will receive the
                        collateral. Manage the loans in the portfolio page`}
                          </span>
                        </Col>
                      </Row>
                    </>
                  ),
                },
              ]}
            />
          </Col>
        </Row>

        {/* Lend button */}
        <Row
          justify={activeWallet.length && isPlugError ? "end" : "center"}
          className={`${
            activeWallet.length && isPlugError ? "" : "border"
          } mt-30`}
        >
          <Col md={24}>
            {isPlugError ? (
              <CustomButton
                block
                loading={isOfferBtnLoading}
                className="button-css lend-button"
                title={"Create offer"}
              />
            ) : (
              <Flex justify="center">
                <Text
                  className={`font-small text-color-one border-padding-medium letter-spacing-small`}
                >
                  {activeWallet.length && !isPlugError
                    ? "Reconnect wallet to continue"
                    : "Connect wallet to continue"}
                </Text>
              </Flex>
            )}
          </Col>
        </Row>
      </ModalDisplay>
    </>
  );
};
export default propsContainer(Dashboard);
