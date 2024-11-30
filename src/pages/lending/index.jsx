import { Col, Flex, Grid, Row, Skeleton, Tooltip, Typography } from "antd";
import React, { useState } from "react";
import { BiSolidOffer } from "react-icons/bi";
import { Bars } from "react-loading-icons";
import Aptos from "../../assets/wallet-logo/aptos_logo.png";
import CustomButton from "../../component/Button";
import LendModal from "../../component/lend-modal";
import OffersModal from "../../component/offers-modal";
import TableComponent from "../../component/table";
import { propsContainer } from "../../container/props-container";
import CardDisplay from "../../component/card";
import { MdOutlineTimer } from "react-icons/md";
import { setOffers } from "../../redux/slice/constant";
import Notify from "../../component/notification";

const Lending = (props) => {
  const { reduxState, dispatch } = props.redux;
  const { getAllBorrowRequest } = props.wallet;
  const approvedCollections = reduxState.constant.approvedCollections;
  // const borrowCollateral = reduxState.constant.borrowCollateral;
  // const activeWallet = reduxState.wallet.active;
  // const userAssets = reduxState.constant.userAssets;
  // const petraAddress = reduxState.wallet.petra.address;
  const aptosvalue = reduxState.constant.aptosvalue;
  const allBorrowRequest = reduxState.constant.allBorrowRequest;

  const btcvalue = reduxState.constant.btcvalue;

  const { Text } = Typography;
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  // USE STATE
  const [offerModalData, setOfferModalData] = useState({});
  const [isOffersModal, setIsOffersModal] = useState(false);
  const [isLendModal, setIsLendModal] = useState(false);
  const [lendModalData, setLendModalData] = useState({});
  const [collapseActiveKey, setCollapseActiveKey] = useState(["2"]);

  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;

  const approvedCollectionColumns = [
    {
      key: "Collections",
      title: "Collections",
      align: "center",
      dataIndex: "collectionName",
      filters: [
        {
          text: "Requests",
          value: "Requests",
        },
      ],
      onFilter: (_, record) => {
        const collectionBorrowRequests = allBorrowRequest.filter(
          (req) => req.collectionSymbol === record.collectionName
        );
        if (collectionBorrowRequests.length) {
          return record;
        }
      },
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
                  onClick={() => fetchRequests(obj)}
                  style={{
                    width: 120,
                  }}
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
      key: "bestloan",
      title: "Best Loan",
      align: "center",
      dataIndex: "bestLoan",
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
      render: (_, obj) => (
        <Text className={"text-color-one"}>{Math.round(obj.APY)}%</Text>
      ),
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
            title={"Lend"}
            size="medium"
            onClick={() => {
              toggleLendModal();
              let assets = {};
              setLendModalData({
                assets,
                collateral: "",
                symbol: obj.symbol,
                canisterId: obj.canister,
                collectionName: obj.name,
                thumbnailURI: obj.thumbnailURI,
              });
            }}
          />
        );
      },
    },
  ];

  const fetchRequests = async (obj) => {
    if (allBorrowRequest !== null) {
      const collectionBorrowRequests = allBorrowRequest.filter(
        (req) => req.collectionSymbol === obj.collectionName
      );
      dispatch(setOffers(collectionBorrowRequests));
      toggleOfferModal();
      setOfferModalData({
        ...obj,
        thumbnailURI: obj.thumbnailURI,
        collectionName: obj.name,
      });
    } else {
      Notify("info", "Please wait!");
    }
  };

  const toggleLendModal = () => {
    setIsLendModal(!isLendModal);
    setCollapseActiveKey(["1"]);
  };

  const toggleOfferModal = () => {
    if (isOffersModal) {
      // dispatch(setOffers(null));
    }
    setIsOffersModal(!isOffersModal);
  };
  // console.log("lendModalData", lendModalData);
  return (
    <>
      <Row justify={"space-between"} align={"middle"}>
        <Col>
          <h1 className="font-xlarge gradient-text-two">Lending</h1>
        </Col>
      </Row>

      <Row justify={"center"} className="m-bottom">
        <Col
          md={24}
          style={{
            marginBottom: "50px",
          }}
        >
          {screens.md ? (
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
          ) : (
            <Row
              justify={{ xs: "center", md: "start" }}
              className="pad-bottom-30"
              gutter={32}
            >
              {approvedCollections?.map((collection, index) => {
                const name = collection?.name;
                const nameSplitted = collection?.name?.split(" ");
                let modifiedName = "";
                nameSplitted?.forEach((word) => {
                  if ((modifiedName + word).length < 15) {
                    modifiedName = modifiedName + " " + word;
                  }
                });
                const floor = collection?.floorPrice
                  ? collection?.floorPrice
                  : 30000;

                return (
                  <Col
                    key={`${collection?.symbol}-${index}`}
                    lg={8}
                    md={12}
                    sm={8}
                    xs={20}
                  >
                    <Skeleton loading={!collection.symbol} active>
                      <CardDisplay
                        className={
                          "main-bg dashboard-card-padding m-top-bottom dashboard-cards pointer box collection-bg"
                        }
                      >
                        <Row justify={"center"}>
                          <Col>
                            <Flex justify="center">
                              {name?.length > 15 ? (
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
                          </Col>
                        </Row>
                        <Row
                          justify={{ xs: "space-between", md: "center" }}
                          align={"middle"}
                          className={screens.xs || screens.md ? "mt-5" : ""}
                          gutter={
                            screens.xs || screens.md || screens.sm
                              ? [0, 12]
                              : []
                          }
                        >
                          <Col xs={24} md={24} lg={5} xl={5}>
                            <Row justify={"space-between"}>
                              <Col>
                                <img
                                  className="border-radius-5 loan-cards"
                                  width={"62px"}
                                  height={"62px"}
                                  alt={name}
                                  src={collection?.imageURI}
                                  onError={(e) =>
                                    (e.target.src = `${process.env.PUBLIC_URL}/collections/${collection?.symbol}.png`)
                                  }
                                  // src={`${process.env.PUBLIC_URL}/collections/${collection?.symbol}.png`}
                                />
                              </Col>

                              <Col>
                                <Flex vertical>
                                  <Flex align="center" gap={5}>
                                    <img
                                      src={Aptos}
                                      alt="noimage"
                                      width="15px"
                                    />
                                    <Text className="font-small text-color-two">
                                      {(
                                        ((floor / BTC_ZERO) * btcvalue) /
                                        aptosvalue
                                      ).toFixed(2)}
                                    </Text>
                                  </Flex>

                                  <Flex align="center" gap={5}>
                                    <MdOutlineTimer color="#adadad" size={20} />
                                    <Text className="font-small text-color-two">
                                      {Number(collection.terms)} Days
                                    </Text>
                                  </Flex>
                                </Flex>
                              </Col>
                            </Row>
                          </Col>

                          <Col xs={24} sm={24} md={20} lg={18} xl={18}>
                            <CustomButton
                              block
                              className={
                                "click-btn font-weight-600 letter-spacing-small"
                              }
                              title={"Lend"}
                              size="medium"
                              onClick={() => {
                                toggleLendModal();
                                let assets = {};
                                setLendModalData({
                                  assets,
                                  collateral: "",
                                  symbol: collection.symbol,
                                  canisterId: collection.canister,
                                  collectionName: collection.name,
                                  thumbnailURI: collection.thumbnailURI,
                                });
                              }}
                            />
                          </Col>
                        </Row>
                      </CardDisplay>
                    </Skeleton>
                  </Col>
                );
              })}
            </Row>
          )}
        </Col>
      </Row>

      <LendModal
        btcvalue={btcvalue}
        aptosvalue={aptosvalue}
        modalState={isLendModal}
        lendModalData={lendModalData}
        toggleLendModal={toggleLendModal}
        setLendModalData={setLendModalData}
        collapseActiveKey={collapseActiveKey}
        getAllBorrowRequest={getAllBorrowRequest}
        setCollapseActiveKey={setCollapseActiveKey}
      />

      <OffersModal
        btcvalue={btcvalue}
        aptosvalue={aptosvalue}
        modalState={isOffersModal}
        offerModalData={offerModalData}
        toggleLendModal={toggleLendModal}
        toggleOfferModal={toggleOfferModal}
        setLendModalData={setLendModalData}
        setOfferModalData={setOfferModalData}
      />
    </>
  );
};
export default propsContainer(Lending);
