import { Col, Collapse, Divider, Flex, Row, Typography } from "antd";
import { useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { TbInfoSquareRounded } from "react-icons/tb";
import { useSelector } from "react-redux";
import Aptos from "../../assets/wallet-logo/aptos_logo.png";
import CustomButton from "../Button";
import ModalDisplay from "../modal";

const LendModal = ({
  API,
  modalState,
  isLendEdit,
  ckBtcBalance,
  lendModalData,
  toggleLendModal,
  setLendModalData,
  collapseActiveKey,
  setCollapseActiveKey,
}) => {
  /* global BigInt */

  const { Text } = Typography;

  const reduxState = useSelector((state) => state);
  const btcvalue = reduxState.constant.btcvalue;
  const activeWallet = reduxState.wallet.active;

  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;

  const [isRequestBtnLoading, setIsRequestBtnLoading] = useState(false);

  const handleCreateRequest = async () => {
    try {
      setIsRequestBtnLoading(true);

      setIsRequestBtnLoading(false);
    } catch (error) {
      setIsRequestBtnLoading(false);
      console.log("create offer error", error);
    }
  };

  // const handleEditLend = async () => {
  //   Notify("info", "We'r on it!");
  // };

  return (
    <ModalDisplay
      footer={null}
      title={
        <Flex align="center" gap={5} justify="start">
          <Text className={`font-size-20 text-color-one letter-spacing-small`}>
            {lendModalData.collectionName}
          </Text>
        </Flex>
      }
      open={modalState}
      onCancel={toggleLendModal}
      width={"35%"}
    >
      {/* Borrow Image Display */}
      <Row justify={"space-between"} className="mt-30">
        <Col md={4}>
          <img
            className="border-radius-8"
            alt={`lend_image`}
            src={lendModalData.thumbnailURI}
            onError={(e) =>
              (e.target.src = `${process.env.PUBLIC_URL}/collections/${lendModalData.symbol}.png`)
            }
            width={90}
          />
        </Col>

        <Col md={5}>
          <Flex
            vertical
            justify="center"
            align="center"
            className={`border border-radius-8 pointer`}
          >
            <Text className={`font-small text-color-one letter-spacing-small`}>
              Floor
            </Text>
            <Text
              className={`font-size-16 text-color-two letter-spacing-small`}
            >
              {lendModalData.loanAmount}
            </Text>
          </Flex>
        </Col>

        <Col md={5}>
          <Flex
            vertical
            justify="center"
            align="center"
            className={`border border-radius-8 pointer`}
          >
            <Text className={`font-small text-color-one letter-spacing-small`}>
              Term
            </Text>
            <Text
              className={`font-size-16 text-color-two letter-spacing-small`}
            >
              {Number(lendModalData.terms)} Days
            </Text>
          </Flex>
        </Col>

        <Col md={5}>
          <Flex
            vertical
            justify="center"
            align="center"
            className={`border border-radius-8 pointer`}
          >
            <Text className={`font-small text-color-one letter-spacing-small`}>
              LTV
            </Text>
            <Text
              className={`font-size-16 text-color-two letter-spacing-small`}
            >
              {lendModalData.loanToValue}%
            </Text>
          </Flex>
        </Col>
      </Row>

      {/* Borrow Divider */}
      <Row justify={"center"}>
        <Divider />
      </Row>

      {/* Borrow Alerts */}
      {/* {activeWallet.length && 100 < lendModalData.amount ? (
      <Row>
        <Col md={24} className={`modalBoxRedShadow`}>
          <Flex align="center" gap={10}>
            <FaWallet
              size={20}
              //  color={true ? "#d7d73c" : "#e54b64"}
            />
            <span className={`font-small letter-spacing-small`}>
              Insufficient ckBTC !
            </span>
          </Flex>
        </Col>
      </Row>
    ) : (
      ""
    )} */}

      <Flex align={"center"} gap={5}>
        <Text className={`font-small text-color-one letter-spacing-small`}>
          Collateral{" "}
        </Text>
        <FaCaretDown color={"#742e4c"} size={25} />
      </Flex>

      {/* Borrow collateral display */}
      <Row
        className={`mt-15 border border-radius-8 scroll-themed border-padding-medium`}
        gutter={[0, 20]}
        style={{
          maxHeight: "210px",
          overflowY: lendModalData?.assets?.length > 3 && "scroll",
          columnGap: "50px",
        }}
        justify={"start"}
      >
        {lendModalData?.assets?.id ? (
          <>
            {/* <Col md={6} className="p-relative">
            <div className={`selection-css pointer`}></div>

            <CardDisplay
              bordered={false}
              className={`themed-card-dark pointer`}
              cover={
                lendModalData.asset.contentType.includes(
                  "image/webp" || "image/jpeg" || "image/png"
                ) ? (
                  <img
                    alt="asset_img"
                    src={`${CONTENT_API}/content/${lendModalData.asset.id}`}
                  />
                ) : lendModalData.asset.contentType.includes(
                    "image/svg"
                  ) ? (
                  <iframe
                    loading="lazy"
                    width={"50%"}
                    height={"80px"}
                    style={{ border: "none", borderRadius: "20%" }}
                    src={`${CONTENT_API}/content/${lendModalData.asset.id}`}
                    title="svg"
                    sandbox="allow-scripts"
                  >
                    <svg
                      viewBox="0 0 100 100"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <image
                        href={lendModalData.asset.contentURI}
                        width={"50%"}
                        height={"80px"}
                      />
                    </svg>
                  </iframe>
                ) : (
                  <img
                    src={`${
                      lendModalData.asset?.meta?.collection_page_img_url
                        ? lendModalData.asset?.meta?.collection_page_img_url
                        : `${process.env.PUBLIC_URL}/collections/${lendModalData.asset?.collectionSymbol}`
                    }`}
                    // NatBoys
                    // src={`https://ipfs.io/ipfs/QmdQboXbkTdwEa2xPkzLsCmXmgzzQg3WCxWFEnSvbnqKJr/1842.png`}
                    // src={`${process.env.PUBLIC_URL}/collections/${obj?.collectionSymbol}.png`}
                    onError={(e) =>
                      (e.target.src = `${process.env.PUBLIC_URL}/collections/${lendModalData.asset?.collectionSymbol}.png`)
                    }
                    alt={`${lendModalData.asset.id}-borrow_image`}
                    width={70}
                  />
                )
              }
            >
              <Flex justify="center">
                <span
                  className={`font-xsmall text-color-two letter-spacing-small`}
                >
                  #{lendModalData.asset.inscriptionNumber}{" "}
                </span>
              </Flex>
            </CardDisplay>
          </Col> */}
          </>
        ) : (
          <Text className={`text-color-two font-small letter-spacing-small`}>
            You don't have any collateral for this collection!.
          </Text>
        )}
      </Row>

      {/* Borrow Offer Summary */}
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
                    Request Summary
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
                            $ {(lendModalData.loanAmount * btcvalue).toFixed(2)}
                          </Text>

                          <Text
                            className={`font-size-16 text-color-one letter-spacing-small`}
                          >
                            ~ {lendModalData.loanAmount}
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
                            ${" "}
                            {(lendModalData.yieldAccured * btcvalue).toFixed(2)}
                          </Text>

                          <Text
                            className={`font-size-16 text-color-one letter-spacing-small`}
                          >
                            ~ {lendModalData.yieldAccured}
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
                            {(lendModalData.platformFee * btcvalue).toFixed(2)}
                          </Text>

                          <Text
                            className={`font-size-16 text-color-one letter-spacing-small`}
                          >
                            ~ {lendModalData.platformFee}
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
                            // color={true ? "#adadad" : "#333333"}
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

      {/* Borrow button */}
      <Row
        justify={activeWallet.length ? "end" : "center"}
        className={`${
          activeWallet.length ? "" : "border"
        } border-radius-8 mt-30`}
      >
        <Col md={24}>
          {activeWallet.length ? (
            <CustomButton
              block
              // loading={isOfferBtnLoading}
              className="click-btn font-weight-600 letter-spacing-small"
              title={"Borrow"}
              // onClick={handleBorrowOffer}
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
  );
};

export default LendModal;
