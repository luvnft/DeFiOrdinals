import { Col, Collapse, Divider, Flex, Grid, Row, Typography } from "antd";
import { useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { TbInfoSquareRounded } from "react-icons/tb";
import { useSelector } from "react-redux";
import Aptos from "../../assets/wallet-logo/aptos_logo.png";
import CustomButton from "../Button";
import ModalDisplay from "../modal";

const LendModal = ({
  modalState,
  btcvalue,
  aptosvalue,
  lendModalData,
  toggleLendModal,
  setLendModalData,
  collapseActiveKey,
  setCollapseActiveKey,
}) => {
  const { Text } = Typography;
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const reduxState = useSelector((state) => state);
  const activeWallet = reduxState.wallet.active;

  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;

  // console.log("lendModalData", lendModalData);
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
      width={screens.xl ? "35%" : screens.lg ? "50%" : "100%"}
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
            width={screens.xs ? 65 : 80}
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
              {lendModalData.floorPrice / BTC_ZERO}
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
              {lendModalData.LTV}%
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

      {/* Borrow Offer Summary */}
      <Row>
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
            defaultActiveKey={["1"]}
            activeKey={collapseActiveKey}
            onChange={() => {
              if (collapseActiveKey[0] === "1") {
                setCollapseActiveKey(["2"]);
              } else {
                setCollapseActiveKey(["1"]);
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
                            ${" "}
                            {(
                              (lendModalData.loan_amount / BTC_ZERO) *
                              aptosvalue
                            ).toFixed(2)}
                          </Text>

                          <Text
                            className={`font-size-16 text-color-one letter-spacing-small`}
                          >
                            ~ {lendModalData.loan_amount / BTC_ZERO}
                          </Text>
                          <img
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
        } border-radius-8 mt-15`}
      >
        <Col xs={24}>
          {activeWallet.length ? (
            <CustomButton
              block
              className="click-btn font-weight-600 letter-spacing-small"
              title={"Lend"}
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
