import { Col, Flex, Row, Tooltip, Typography } from "antd";
import React, { useState } from "react";
import { BiSolidOffer } from "react-icons/bi";
import { Bars } from "react-loading-icons";
import Aptos from "../../assets/wallet-logo/aptos_logo.png";
import CustomButton from "../../component/Button";
import LendModal from "../../component/lend-modal";
import OffersModal from "../../component/offers-modal";
import TableComponent from "../../component/table";
import { propsContainer } from "../../container/props-container";

const Lending = (props) => {
  const { reduxState } = props.redux;
  const approvedCollections = reduxState.constant.approvedCollections;
  const activeWallet = reduxState.wallet.active;
  const userAssets = reduxState.constant.userAssets;
  const petraAddress = reduxState.wallet.petra.address;
  const aptosvalue = reduxState.constant.aptosvalue;

  const btcvalue = reduxState.constant.btcvalue;

  const { Text } = Typography;
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
      key: "request",
      title: "Best Loan",
      align: "center",
      dataIndex: "request",
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
      render: (_, obj) => (
        <Flex align="center" vertical gap={5}>
          <Flex align="center" vertical gap={5} className={"text-color-one"}>
            <Flex align="center" gap={3}>
              <img src={Aptos} alt="noimage" width="20px" />{" "}
              {(((obj.floorPrice / BTC_ZERO) * btcvalue) / aptosvalue).toFixed(
                2
              )}{" "}
            </Flex>
            <div>${((obj.floorPrice / BTC_ZERO) * btcvalue).toFixed(2)} </div>
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
    // try {
    //   const contract = await contractGenerator();
    //   console.log("contract", contract, "obj.collectionID", obj.collectionID);
    //   const offers = await contract.methods
    //     .getRequestByCollectionID(Number(obj.collectionID))
    //     .call({ from: metaAddress });
    //   console.log("requests", offers);
    toggleOfferModal();
    //   // dispatch(setOffers(offers));
    setOfferModalData({
      ...obj,
      thumbnailURI: obj.thumbnailURI,
      collectionName: obj.name,
    });
    // } catch (error) {
    //   console.log("fetch offers modal error", error);
    // }
  };

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

  const toggleOfferModal = () => {
    if (isOffersModal) {
      // dispatch(setOffers(null));
    }
    setIsOffersModal(!isOffersModal);
  };
  console.log("lendModalData", lendModalData);
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
        userAssets={userAssets}
        modalState={isOffersModal}
        offerModalData={offerModalData}
        toggleOfferModal={toggleOfferModal}
        setOfferModalData={setOfferModalData}
        toggleLendModal={toggleLendModal}
        setLendModalData={setLendModalData}
      />
    </>
  );
};
export default propsContainer(Lending);
