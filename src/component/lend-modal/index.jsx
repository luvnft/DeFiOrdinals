import {
  Col,
  Collapse,
  Divider,
  Flex,
  Grid,
  Row,
  Switch,
  Typography,
} from "antd";
import { useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { TbInfoSquareRounded } from "react-icons/tb";
import { TailSpin } from "react-loading-icons";
import { useSelector } from "react-redux";
import Aptos from "../../assets/wallet-logo/aptos_logo.png";
import {
  contractAddress,
  Function,
  initOrdinal,
  Module,
} from "../../utils/aptosService";
import CustomButton from "../Button";
import CardDisplay from "../card";
import Loading from "../loading-wrapper/secondary-loader";
import ModalDisplay from "../modal";
import Notify from "../notification";

const LendModal = ({
  modalState,
  btcvalue,
  aptosvalue,
  lendModalData,
  toggleLendModal,
  setLendModalData,
  collapseActiveKey,
  getAllBorrowRequest,
  setCollapseActiveKey,
}) => {
  const { Text } = Typography;
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const reduxState = useSelector((state) => state);
  const activeWallet = reduxState.wallet.active;

  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [input, setInput] = useState(false);

  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;

  const handleLoan = async () => {
    try {
      setIsBtnLoading(true);

      const payload = {
        type: "entry_function_payload",
        function: `${contractAddress}::${Module.LOAN_LEDGER}::${Function.CREATE.CREATE_LOAN_REQUEST}`,
        arguments: [
          lendModalData.borrower,
          Number(lendModalData.borrow_id),
          Number(lendModalData.loan_amount),
          lendModalData.ordinal_token,
          lendModalData.terms,
        ],
        type_arguments: [],
      };

      if (input) {
        await initOrdinal();
      }

      const loanResult = await window.aptos.signAndSubmitTransaction(payload);
      if (loanResult.success) {
        Notify("success", "Loan activated!");
        toggleLendModal();
        getAllBorrowRequest();
        setIsBtnLoading(false);
      }
    } catch (error) {
      setIsBtnLoading(false);
      console.log("Handle loan lend error", error);
    }
  };

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
      onCancel={() => {
        toggleLendModal();
      }}
      width={screens.xl ? "35%" : screens.lg ? "50%" : "100%"}
    >
      {/* Borrow Image Display */}
      <Row justify={"space-between"} className="mt-15">
        <Col md={4}>
          <img
            className="border-radius-8"
            alt={`lend_image`}
            src={lendModalData.thumbnailURI}
            onError={(e) =>
              (e.target.src = `${process.env.PUBLIC_URL}/collections/${lendModalData.collectionSymbol}.png`)
            }
            width={screens.xs ? 65 : 70}
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
              {(lendModalData.floorPrice / BTC_ZERO).toFixed(5)}
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

      <Row justify={"end"}>
        <Col>
          <Flex align="center">
            <Switch
              checked={input}
              checkedChildren="Undo Init"
              unCheckedChildren="Do Init"
              onChange={() => {
                setInput(!input);
              }}
            />
          </Flex>
        </Col>
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

      {/* Borrow collateral display */}
      <Row justify={"space-between"} className={`mt-20`}>
        {/* Borrow Offer Summary */}
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
                      {lendModalData?.id ? (
                        <Col md={6} className="border border-radius-8">
                          <CardDisplay
                            bordered={false}
                            className={`dark-card pointer`}
                            cover={
                              <img
                                src={lendModalData.contentURL}
                                onError={(e) =>
                                  (e.target.src = `${process.env.PUBLIC_URL}/collections/${lendModalData.collectionSymbol}.png`)
                                }
                                alt={`${lendModalData.id}-borrow_image`}
                                width={70}
                              />
                            }
                          >
                            <Flex vertical justify="center">
                              <span
                                className={`font-xmsmall text-color-one letter-spacing-small`}
                              >
                                Collateral
                              </span>
                              <span
                                className={`font-xsmall text-color-two letter-spacing-small`}
                              >
                                #{lendModalData.inscriptionNumber}{" "}
                              </span>
                            </Flex>
                          </CardDisplay>
                        </Col>
                      ) : (
                        <Loading spin={true} indicator={<TailSpin />} />
                      )}

                      <Col md={16}>
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
                                ~{" "}
                                {(lendModalData.loan_amount / BTC_ZERO).toFixed(
                                  2
                                )}
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
                                {(
                                  ((lendModalData.repayment_amount -
                                    lendModalData.loan_amount) /
                                    BTC_ZERO) *
                                  aptosvalue
                                ).toFixed(2)}{" "}
                              </Text>

                              <Text
                                className={`font-size-16 text-color-one letter-spacing-small`}
                              >
                                ~{" "}
                                {(
                                  (lendModalData.repayment_amount -
                                    lendModalData.loan_amount) /
                                  BTC_ZERO
                                ).toFixed(2)}
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
                                {(
                                  (lendModalData.platform_fee / BTC_ZERO) *
                                  aptosvalue
                                ).toFixed(2)}{" "}
                              </Text>

                              <Text
                                className={`font-size-16 text-color-one letter-spacing-small`}
                              >
                                ~{" "}
                                {(
                                  lendModalData.platform_fee / BTC_ZERO
                                ).toFixed(2)}
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
                      </Col>
                    </Row>

                    <Row className="mt-15">
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
        } border-radius-8 mt-20`}
      >
        <Col xs={24}>
          {activeWallet.length ? (
            <CustomButton
              block
              className="click-btn font-weight-600 letter-spacing-small"
              title={"Lend"}
              loading={isBtnLoading}
              onClick={handleLoan}
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
