import { Network } from "@aptos-labs/ts-sdk";
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
import React, { useEffect, useRef, useState } from "react";
import { BiSolidOffer } from "react-icons/bi";
import { FaCaretDown } from "react-icons/fa";
import { GoAlertFill } from "react-icons/go";
import { PiPlusSquareThin } from "react-icons/pi";
import { TbInfoSquareRounded } from "react-icons/tb";
import { Bars } from "react-loading-icons";
import Aptos from "../../assets/wallet-logo/aptos_logo.png";
import CustomButton from "../../component/Button";
import CardDisplay from "../../component/card";
import LendModal from "../../component/lend-modal";
import ModalDisplay from "../../component/modal";
import Notify from "../../component/notification";
import OffersModal from "../../component/offers-modal";
import TableComponent from "../../component/table";
import { propsContainer } from "../../container/props-container";
import { getAptosClient } from "../../utils/aptosClient";
import { Function, Module, contractAddress } from "../../utils/aptosService";
import {
  PETRA_WALLET_KEY,
  calculateDailyInterestRate,
} from "../../utils/common";

const Borrowing = (props) => {
  const { reduxState, dispatch } = props.redux;
  const approvedCollections = reduxState.constant.approvedCollections;
  const activeWallet = reduxState.wallet.active;
  const aptosvalue = reduxState.constant.aptosvalue;
  const offers = reduxState.constant.offers;
  const petraAddress = reduxState.wallet.petra.address;
  const borrowCollateral = reduxState.constant.borrowCollateral;
  // console.log("borrowCollateral", borrowCollateral);

  const btcvalue = reduxState.constant.btcvalue;

  const CONTENT_API = process.env.REACT_APP_ORDINALS_CONTENT_API;

  const { Text } = Typography;

  const amountRef = useRef(null);
  // USE STATE
  const [offerModalData, setOfferModalData] = useState({});
  const [isOffersModal, setIsOffersModal] = useState(false);

  const [isLendModal, setIsLendModal] = useState(false);
  const [lendModalData, setLendModalData] = useState({});

  const [isBorrowModal, setIsBorrowModal] = useState(false);
  const [borrowModalData, setBorrowModalData] = useState({});

  const [collapseActiveKey, setCollapseActiveKey] = useState(["2"]);
  const [isRequestBtnLoading, setIsRequestBtnLoading] = useState(false);
  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;

  const approvedCollectionColumns = [
    {
      key: "Collections",
      title: "Collections",
      align: "center",
      dataIndex: "collectionName",
      render: (_, obj) => {
        const name = obj?.name;
        const nameSplitted = obj?.name?.split(" ");
        let modifiedName = "";
        nameSplitted?.forEach((word) => {
          if ((modifiedName + word).length < 25) {
            modifiedName = modifiedName + " " + word;
          }
        });
        return (
          <Row gutter={10}>
            <Col>
              <img
                className="border-radius-5 loan-cards"
                width={"75px"}
                height={"75px"}
                alt={"collection_images"}
                src={obj?.imageURI}
                onError={(e) =>
                  (e.target.src = `${process.env.PUBLIC_URL}/collections/${obj?.symbol}.png`)
                }
              />
            </Col>
            <Col>
              <Flex vertical>
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

                <Text
                  style={{
                    width: 120,
                  }}
                  onClick={() => fetchRequests(obj)}
                  className={`text-color-one grey-bg-color border-radius-30 card-box pointer border-color-dark iconalignment shine font-size-16 letter-spacing-small`}
                >
                  <BiSolidOffer size={20} />
                  Requests
                </Text>
              </Flex>
            </Col>
          </Row>
        );
      },
    },
    {
      key: "best_loan",
      title: "Best Loan",
      align: "center",
      dataIndex: "best_loan",
      render: (_, obj) => {
        return (
          <Flex align="center" justify="center">
            <Text className="text-color-one">
              {obj?.loanAmount ? obj.loanAmount : 0}
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
      render: (_, obj) => <Text className={"text-color-one"}>{obj.APY}%</Text>,
    },
    {
      key: "Term",
      title: "Term",
      align: "center",
      dataIndex: "terms",
      render: (_, obj) => (
        <Text className={"text-color-one"}>{Number(obj.terms)} Days</Text>
      ),
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
      render: (_, obj) => {
        const floor = Number(obj.floorPrice) ? Number(obj.floorPrice) : 30000;
        return (
          <Flex align="center" vertical gap={5}>
            <Flex align="center" vertical gap={5} className={"text-color-one"}>
              <Flex align="center" gap={3}>
                <img src={Aptos} alt="noimage" width="20px" />{" "}
                {(((floor / BTC_ZERO) * btcvalue) / aptosvalue).toFixed(2)}{" "}
              </Flex>
              <div>${((floor / BTC_ZERO) * btcvalue).toFixed(2)} </div>
            </Flex>
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
        return (
          <CustomButton
            className={"click-btn font-weight-600 letter-spacing-small"}
            title={"Borrow"}
            size="medium"
            onClick={() => {
              // Assets
              let assets = borrowCollateral?.filter(
                (p) => p.collectionSymbol === obj.symbol
              );
              // Floor
              const floor = Number(obj.floorPrice)
                ? Number(obj.floorPrice)
                : 30000;
              // Terms
              const term = Number(obj.terms);
              // Converting ordinal asset price into dollar
              const ordinalPrice = (
                ((floor / BTC_ZERO) * btcvalue) /
                aptosvalue
              ).toFixed(2);
              // Max amount user can be avail for the ordinal
              const maxQuoted = ordinalPrice;
              // Cutoff the amount by 2 for initial display
              const amount = maxQuoted / 2;
              // Calc 85% to display close to floor price message
              const exceedRange = ((maxQuoted * 85) / 100).toFixed(6);
              // Calc interest per day
              const interestPerDay = calculateDailyInterestRate(obj.yield);
              // Calc interest for given no of days
              const interestTerm = Number(interestPerDay) * term;
              // Calc interest for n days
              const interest = (amount * interestTerm).toFixed(6);
              // Calc 15% of platformfee from interest
              const platformFee = ((interest * 15) / 100).toFixed(6);
              const sliderLTV = Math.round(
                ((amount * btcvalue) / (ordinalPrice * btcvalue)) * 100
              );
              setTimeout(() => {
                amountRef.current.focus();
              }, 300);
              toggleBorrowModal();
              setBorrowModalData({
                ...obj,
                assets,
                amount,
                interest,
                maxQuoted,
                platformFee,
                terms: term,
                exceedRange,
                ordinalPrice,
                APY: obj.APY,
                interestTerm,
                interestPerDay,
                sliderLTV: obj.LTV ? obj.LTV : sliderLTV,
              });
            }}
          />
        );
      },
    },
  ];

  const toggleBorrowModal = () => {
    setIsBorrowModal(!isBorrowModal);
  };

  const calcLendData = (amount) => {
    const interest = (amount * borrowModalData.interestTerm).toFixed(6);
    // Calc 15% of platform fee.
    const platformFee = ((interest * 15) / 100).toFixed(6);
    return {
      interest,
      platformFee,
    };
  };
  // console.log("borrowModalData", borrowModalData);
  const fetchRequests = async (obj) => {
    toggleOfferModal();
    setOfferModalData({
      ...obj,
      thumbnailURI: obj.thumbnailURI,
      collectionName: obj.name,
    });
  };

  useEffect(() => {
    // For setting user assets, after fetching user Assets when modal is open
    if (borrowCollateral?.length && borrowModalData?.symbol) {
      let assets = borrowCollateral?.filter(
        (p) => p.collectionSymbol === borrowModalData.symbol
      );
      setBorrowModalData({
        ...borrowModalData,
        assets,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [borrowCollateral]);

  const handleCreateRequest = async () => {
    const collateral = borrowModalData.collateral;
    if (collateral) {
      setIsRequestBtnLoading(true);
      try {
        const repayment =
          (Number(borrowModalData.interest) + borrowModalData.amount) *
          BTC_ZERO;
        const payload = {
          type: "entry_function_payload",
          function: `${contractAddress}::${Module.ORDINALS_LOAN}::${Function.CREATE.CREATE_BORROW_REQUEST}`,
          arguments: [
            collateral.collectionSymbol,
            collateral.inscriptionNumber,
            Math.round(borrowModalData.amount * BTC_ZERO),
            Math.round(repayment),
            borrowModalData.terms,
            collateral.inscriptionNumber,
            Number(borrowModalData.platformFee) * BTC_ZERO,
          ],
          type_arguments: [],
        };

        const transaction = await window.aptos.signAndSubmitTransaction(
          payload
        );
        // console.log("transaction", transaction);
        if (transaction.success) {
          toggleBorrowModal();
          Notify("success", "Request submitted!");
          setIsRequestBtnLoading(false);
        }
      } catch (error) {
        setIsRequestBtnLoading(false);
        console.log("Create borrow request error", error);
      }
    } else {
      Notify("warning", "Choose an collateral!");
    }
  };

  const toggleOfferModal = () => {
    if (isOffersModal) {
      // dispatch(setOffers(null));
    }
    setIsOffersModal(!isOffersModal);
  };

  const toggleLendModal = () => {
    setIsLendModal(!isLendModal);
  };

  return (
    <>
      <Row justify={"space-between"} align={"middle"}>
        <Col>
          <h1 className="font-xlarge gradient-text-two">Borrowing</h1>
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
            rowKey={(e) => `${Number(e?.collectionID)}-${e?.collectionName}`}
            tableData={approvedCollections[0] ? approvedCollections : []}
            tableColumns={approvedCollectionColumns}
          />
        </Col>
      </Row>

      {/* Borrow Modal */}
      <ModalDisplay
        footer={null}
        title={
          <Flex align="center" gap={5} justify="start">
            <Text
              className={`font-size-20 text-color-one letter-spacing-small`}
            >
              {borrowModalData.name}
            </Text>
          </Flex>
        }
        open={isBorrowModal}
        onCancel={toggleBorrowModal}
        width={"38%"}
      >
        {/* Lend Image Display */}
        <Row justify={"space-between"} className="mt-15">
          <Col md={3}>
            <img
              className="border-radius-5"
              alt={`lend_image`}
              src={borrowModalData.collectionURI}
              onError={(e) =>
                (e.target.src = `${process.env.PUBLIC_URL}/collections/${borrowModalData.symbol}.png`)
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
                className={`font-size-16 iconalignment text-color-two letter-spacing-small`}
              >
                <img
                  src={Aptos}
                  alt="noimage"
                  style={{ justifyContent: "center" }}
                  width={15}
                />{" "}
                {(
                  ((borrowModalData.floorPrice / BTC_ZERO) * btcvalue) /
                  aptosvalue
                ).toFixed(3)}
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
                {borrowModalData.terms} Days
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
                {borrowModalData.APY}%
              </Text>
            </Flex>
          </Col>
        </Row>

        {/* Lend Divider */}
        <Row justify={"center"}>
          <Divider />
        </Row>

        {/* Lend Alerts */}
        {/* {activeWallet.length ? (
          // && ckBtcBalance < borrowModalData.amount
          <Row>
            <Col md={24} className={`modalBoxRedShadow`}>
              <Flex align="center" gap={10}>
                <FaWallet
                  size={20}
                  //  color={theme ? "#d7d73c" : "#e54b64"}
                />
                <span className={`font-small letter-spacing-small`}>
                  Insufficient BTC !
                </span>
              </Flex>
            </Col>
          </Row>
        ) : (
          ""
        )} */}

        {borrowModalData.amount > borrowModalData.exceedRange && (
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
            borrowModalData.amount > borrowModalData.exceedRange
              ? // && ckBtcBalance < borrowModalData.amount
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
                value={borrowModalData.amount}
                onChange={(e) => {
                  const input = e.target.value;
                  const inputNumber = Number(e.target.value);

                  if (isNaN(input)) {
                    return;
                  }
                  if (inputNumber > borrowModalData.maxQuoted) {
                    return;
                  }

                  const { interest, platformFee } = calcLendData(inputNumber);

                  const LTV = Math.round(
                    ((inputNumber * btcvalue) /
                      (borrowModalData.ordinalPrice * btcvalue)) *
                      100
                  );

                  setBorrowModalData((ext) => ({
                    ...ext,
                    platformFee,
                    amount: input,
                    sliderLTV: LTV,
                    interest: interest ? interest : "0.00",
                  }));
                }}
                ref={amountRef}
                prefix={
                  <img
                    src={Aptos}
                    alt="noimage"
                    style={{ justifyContent: "center" }}
                    width={25}
                  />
                }
                placeholder={`Max ${borrowModalData.maxQuoted}`}
                size="large"
                suffix={
                  <Text className={`text-color-one font-xsmall`}>
                    $ {(borrowModalData.amount * aptosvalue).toFixed(2)}
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
                value={borrowModalData.interest}
                size="large"
                readOnly
                prefix={
                  <img
                    src={Aptos}
                    alt="noimage"
                    style={{ justifyContent: "center" }}
                    width={25}
                  />
                }
                suffix={
                  <Text className={`text-color-one font-xsmall`}>
                    $ {(borrowModalData.interest * aptosvalue).toFixed(2)}
                  </Text>
                }
              />
            </Flex>
          </Col>
        </Row>

        <Flex align={"center"} gap={5} className="mt-15">
          <Text className={`font-small text-color-one letter-spacing-small`}>
            Select Collateral{" "}
          </Text>
          <FaCaretDown color={"#742e4c"} size={25} />
        </Flex>

        {/* Borrow collateral display */}
        <Row
          className={`mt-15 border border-radius-8 scroll-themed border-padding-medium`}
          gutter={[0, 20]}
          style={{
            maxHeight: "210px",
            overflowY: borrowModalData?.assets?.length > 3 && "scroll",
            columnGap: "50px",
          }}
          justify={
            borrowCollateral === null || !borrowModalData?.assets
              ? "center"
              : "start"
          }
        >
          {borrowModalData?.assets?.length ? (
            <>
              {borrowModalData.assets?.map((asset) => {
                const { canisterId, tokenId, id } = asset;
                return (
                  <Col
                    md={6}
                    className="p-relative"
                    key={`${canisterId}-${tokenId}`}
                  >
                    <div
                      onClick={() =>
                        setBorrowModalData((ext) => ({
                          ...ext,
                          collateral: asset,
                        }))
                      }
                      className={`selection-css pointer ${
                        id === borrowModalData?.collateral?.id
                          ? true
                            ? "selected-dark card-selected"
                            : "selected-light card-selected light-color-primary"
                          : true
                          ? "card-unselected unselected-dark"
                          : "card-unselected light-color-primary"
                      }`}
                    >
                      {id === borrowModalData?.collateral?.id
                        ? "Selected"
                        : "Select"}
                    </div>

                    <CardDisplay
                      bordered={false}
                      onClick={() =>
                        setBorrowModalData((ext) => ({
                          ...ext,
                          collateral: asset,
                        }))
                      }
                      className={`themed-card-dark ${
                        id === borrowModalData?.collateral?.id
                          ? true
                            ? "card-box-shadow-dark"
                            : "card-box-shadow-light"
                          : ""
                      } pointer`}
                      cover={
                        asset.contentType === "image/webp" ||
                        "image/jpeg" ||
                        "image/png" ? (
                          <img
                            alt="asset_img"
                            src={`${CONTENT_API}/content/${asset.id}`}
                          />
                        ) : asset.contentType.includes("image/svg") ? (
                          <iframe
                            loading="lazy"
                            width={"50%"}
                            height={"80px"}
                            style={{ border: "none", borderRadius: "20%" }}
                            src={`${CONTENT_API}/content/${asset.id}`}
                            title="svg"
                            sandbox="allow-scripts"
                          >
                            <svg
                              viewBox="0 0 100 100"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <image
                                href={asset.contentURI}
                                width={"50%"}
                                height={"80px"}
                              />
                            </svg>
                          </iframe>
                        ) : (
                          <img
                            src={`${
                              asset?.meta?.collection_page_img_url
                                ? asset?.meta?.collection_page_img_url
                                : `${process.env.PUBLIC_URL}/collections/${asset?.symbol}`
                            }`}
                            // NatBoys
                            // src={`https://ipfs.io/ipfs/QmdQboXbkTdwEa2xPkzLsCmXmgzzQg3WCxWFEnSvbnqKJr/1842.png`}
                            // src={`${process.env.PUBLIC_URL}/collections/${obj?.symbol}.png`}
                            onError={(e) =>
                              (e.target.src = `${process.env.PUBLIC_URL}/collections/${asset?.symbol}.png`)
                            }
                            alt={`${asset.id}-borrow_image`}
                            width={70}
                          />
                        )
                      }
                    >
                      <Flex justify="center">
                        <span
                          className={`font-xsmall text-color-two letter-spacing-small`}
                        >
                          #{asset.inscriptionNumber}{" "}
                        </span>
                      </Flex>
                    </CardDisplay>
                  </Col>
                );
              })}
            </>
          ) : (
            <Text className={`text-color-two font-small letter-spacing-small`}>
              {borrowCollateral === null && activeWallet.length === 2
                ? "Please wait until fetching your assets!"
                : borrowCollateral === null
                ? "Connect BTC wallet to see your assets!."
                : "You don't have any collateral for this collection!."}
            </Text>
          )}
        </Row>

        {/* Lend Slider */}
        <Row justify={"space-between"} className="mt-30" align={"middle"}>
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
                {borrowModalData.sliderLTV}
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
                  borrowModalData.ordinalPrice
                ).toFixed(6);

                const { interest, platformFee } = calcLendData(amount);

                setBorrowModalData({
                  ...borrowModalData,
                  amount: Number(amount),
                  sliderLTV: LTV,
                  platformFee,
                  interest,
                });
              }}
              value={borrowModalData.sliderLTV}
            />
          </Col>
          <Col md={2}>
            <PiPlusSquareThin
              className="pointer ant-popconfirm-message-icon"
              size={30}
              color="grey"
              onClick={() => {
                const LTV = borrowModalData.sliderLTV + 1;
                if (LTV <= 100) {
                  const amount = (
                    (LTV / 100) *
                    Number(borrowModalData.ordinalPrice)
                  ).toFixed(6);

                  const interest = (
                    Number(amount) * borrowModalData.interestTerm
                  ).toFixed(6);

                  const platformFee = ((interest * 15) / 100).toFixed(6);

                  setBorrowModalData({
                    ...borrowModalData,
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
                  color={isActive ? "white" : "#742e4c"}
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
                      className={`font-small text-color-one letter-spacing-small`}
                    >
                      Request Overview
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
                              ${" "}
                              {(borrowModalData.amount * aptosvalue).toFixed(2)}
                            </Text>

                            <Text
                              className={`font-size-16 text-color-one letter-spacing-small`}
                            >
                              ~ {borrowModalData.amount}
                            </Text>
                            <img
                              className="round"
                              src={Aptos}
                              alt="noimage"
                              style={{ justifyContent: "center" }}
                              width={25}
                            />
                          </Flex>
                        </Col>
                      </Row>

                      <Row justify={"space-between"} className="mt-7">
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
                              ${" "}
                              {(borrowModalData.interest * aptosvalue).toFixed(
                                2
                              )}
                            </Text>

                            <Text
                              className={`font-size-16 text-color-one letter-spacing-small`}
                            >
                              ~ {borrowModalData.interest}
                            </Text>
                            <img
                              className="round"
                              src={Aptos}
                              alt="noimage"
                              style={{ justifyContent: "center" }}
                              width={25}
                            />
                          </Flex>
                        </Col>
                      </Row>

                      <Row justify={"space-between"} className="mt-7">
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
                              {(
                                borrowModalData.platformFee * aptosvalue
                              ).toFixed(2)}
                            </Text>

                            <Text
                              className={`font-size-16 text-color-one letter-spacing-small`}
                            >
                              ~ {borrowModalData.platformFee}
                            </Text>
                            <img
                              className="round"
                              src={Aptos}
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
                        started they will have ${borrowModalData.term} days to repay the loan. If
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
          justify={activeWallet.length ? "end" : "center"}
          className={`${
            activeWallet.length ? "" : "border"
          } mt-30 border-radius-8`}
        >
          <Col md={24}>
            {activeWallet.includes(PETRA_WALLET_KEY) ? (
              <CustomButton
                block
                loading={isRequestBtnLoading}
                className="click-btn font-weight-600 letter-spacing-small"
                title={"Create request"}
                onClick={handleCreateRequest}
              />
            ) : (
              <Flex justify="center">
                <Text
                  className={`font-small text-color-one border-padding-medium letter-spacing-small`}
                >
                  Connect
                </Text>
              </Flex>
            )}
          </Col>
        </Row>
      </ModalDisplay>

      <LendModal
        isLendEdit={"nope"}
        modalState={isLendModal}
        lendModalData={lendModalData}
        toggleLendModal={toggleLendModal}
        setLendModalData={setLendModalData}
        collapseActiveKey={collapseActiveKey}
        setCollapseActiveKey={setCollapseActiveKey}
      />

      <OffersModal
        userAssets={borrowCollateral}
        modalState={isOffersModal}
        offerModalData={offerModalData}
        toggleOfferModal={toggleOfferModal}
        toggleLendModal={toggleBorrowModal}
        setOfferModalData={setOfferModalData}
        setBorrowModalData={setBorrowModalData}
      />
    </>
  );
};
export default propsContainer(Borrowing);
