import { Col, Flex, Row, Typography } from "antd";
import Bars from "react-loading-icons/dist/esm/components/bars";
import { useSelector } from "react-redux";
import ckBtc from "../../assets/coin_logo/ckbtc.png";
import { getTimeAgo } from "../../utils/common";
import CustomButton from "../Button";
import ModalDisplay from "../modal";
import TableComponent from "../table";

const OffersModal = ({
  userAssets,
  modalState,
  offerModalData,
  toggleOfferModal,
  toggleLendModal,
  setBorrowModalData,
}) => {
  const { Text } = Typography;
  const state = useSelector((state) => state);
  const offers = state.constant.offers;
  const userOffers = state.constant.userOffers;

  const activeOffersColumns = [
    {
      key: "Principal",
      title: "Principal",
      align: "left",
      dataIndex: "loanAmount",
      render: (_, obj) => (
        <Flex
          gap={3}
          align="center"
          className={`text-color-one font-size-16 letter-spacing-small`}
        >
          <img src={ckBtc} alt="noimage" width="20px" /> {obj.loanAmount}
        </Flex>
      ),
    },
    {
      key: "LTV",
      title: "LTV",
      align: "center",
      dataIndex: "loanToValue",
      render: (_, obj) => {
        return (
          <Text className={`text-color-one font-size-16 letter-spacing-small`}>
            {obj.loanToValue}%
          </Text>
        );
      },
    },
    {
      key: "Date",
      title: "Date",
      align: "center",
      dataIndex: "loanTime",
      render: (_, obj) => (
        <Text className={`text-color-one font-size-16 letter-spacing-small`}>
          {getTimeAgo(Number(obj.loanTime) / 1000000)}
        </Text>
      ),
    },
  ];
  // console.log("offerModalData", offerModalData);
  return (
    <ModalDisplay
      width={"70%"}
      footer={null}
      open={modalState}
      onCancel={toggleOfferModal}
    >
      <Row justify={"center"}>
        <Text className={"gradient-text-one font-xlarge letter-spacing-small"}>
          Requests on {offerModalData.collectionName}
        </Text>
      </Row>

      <Row justify={"space-between"} className="mt-15">
        {/* Active Offers */}
        <Col md={12}>
          <Row className="pad-5">
            <Col md={24} className="border border-radius-8 card-box">
              <Row justify={"center"}>
                <Text
                  className={`text-color-two font-small letter-spacing-small`}
                >
                  Active Requests
                </Text>
              </Row>
            </Col>

            <Col
              className={`mt-15 scroll-themed`}
              md={24}
              style={{
                maxHeight: "600px",
                overflowY: offers?.length > 6 && "scroll",
                paddingRight: offers?.length > 6 && "5px",
              }}
            >
              <TableComponent
                rootClassName={"offer-table-theme"}
                loading={{
                  spinning: offers === null,
                  indicator: <Bars />,
                }}
                rowKey={(e) => `${e?.inscriptionid}-${e?.mime_type}`}
                tableColumns={[
                  ...activeOffersColumns,
                  {
                    key: "action",
                    title: " ",
                    align: "center",
                    dataIndex: "borrow",
                    render: (_, obj) => {
                      // const userOffer = userOffers?.find(
                      //   (predict) =>
                      //     predict.ckTransactionID === obj.ckTransactionID
                      // );
                      return (
                        <CustomButton
                          // disabled={userOffer}
                          className={
                            "click-btn font-weight-600 letter-spacing-small"
                          }
                          title={
                            <Flex align="center" justify="center" gap={10}>
                              <span
                                className={`text-color-one font-weight-600 pointer iconalignment font-size-16`}
                              >
                                Borrow
                              </span>
                            </Flex>
                          }
                          onClick={() => {
                            let assets = [];
                            if (userAssets) {
                              assets = userAssets.filter(
                                (asset) =>
                                  asset.collectionName ===
                                  offerModalData.collectionName
                              );
                            }
                            toggleOfferModal();
                            toggleLendModal();
                            setBorrowModalData({
                              ...obj,
                              assets,
                              collateral: "",
                              canisterId: obj.canister,
                              thumbnailURI: offerModalData.thumbnailURI,
                              collectionName: offerModalData.collectionName,
                            });
                          }}
                        />
                      );
                    },
                  },
                ]}
                tableData={offers}
                pagination={false}
              />
            </Col>
          </Row>
        </Col>

        {/* Active Loans */}
        <Col md={12}>
          <Row className="pad-5">
            <Col md={24} className="border border-radius-8 card-box">
              <Row justify={"center"} align={"middle"}>
                <Text
                  className={`text-color-two font-small letter-spacing-small`}
                >
                  Active Loans
                </Text>
              </Row>
            </Col>

            <Col
              md={24}
              style={{
                maxHeight: "600px",
                // minHeight: "600px",
                // overflowY: offers?.length > 6 && "scroll",
                // paddingRight: offers?.length > 6 && "5px",
              }}
              className="mt-15"
            >
              <TableComponent
                rootClassName={"offer-table-theme"}
                loading={{
                  spinning: false,
                  indicator: <Bars />,
                }}
                rowKey={(e) => `${e?.inscriptionid}-${e?.mime_type}`}
                tableColumns={activeOffersColumns}
                tableData={[]}
                pagination={false}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </ModalDisplay>
  );
};

export default OffersModal;
