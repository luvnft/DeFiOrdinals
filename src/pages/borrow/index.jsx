import { Col, Flex, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { FaRegSmileWink } from "react-icons/fa";
import { ImSad } from "react-icons/im";
import { MdOutlineArrowBack } from "react-icons/md";
import { Bars } from "react-loading-icons";
import { useNavigate } from "react-router";
import CustomButton from "../../component/Button";
import CardDisplay from "../../component/card";
import Loading from "../../component/loading-wrapper/secondary-loader";
import { propsContainer } from "../../container/props-container";
import {
  API_METHODS,
  IS_USER,
  MAGICEDEN_WALLET_KEY,
  UNISAT_WALLET_KEY,
  XVERSE_WALLET_KEY,
  apiUrl,
} from "../../utils/common";

const Borrow = (props) => {
  const navigate = useNavigate();
  const { api_agent } = props.wallet;
  const { reduxState, dispatch } = props.redux;
  const activeWallet = reduxState.wallet.active;
  const walletState = reduxState.wallet;
  const { Text, Title } = Typography;
  const xverseAddress = walletState.xverse.ordinals.address;
  const unisatAddress = walletState.unisat.address;
  const magicEdenAddress = walletState.magicEden.ordinals.address;

  const [borrowData, setBorrowData] = useState(null);

  const waheedAddress = process.env.REACT_APP_WAHEED_ADDRESS;

  if (borrowData?.length !== 0) {
    borrowData?.sort((a, b) => {
      return a.inscriptionNumber - b.inscriptionNumber;
    });
  }

  const fetchWalletAssets = async (address) => {
    try {
      const result = await API_METHODS.get(
        `${apiUrl.Asset_server_base_url}/api/v1/fetch/assets/${address}`
      );

      if (result.data.data.length) {
        return result.data.data;
      }
    } catch (error) {
      console.log("fetchWalletAssets error", error);
    }
  };

  // Fetching User's All Assets
  useEffect(() => {
    (async () => {
      if (
        api_agent &&
        (activeWallet.includes(XVERSE_WALLET_KEY) ||
          activeWallet.includes(UNISAT_WALLET_KEY) ||
          activeWallet.includes(MAGICEDEN_WALLET_KEY))
      ) {
        const result = await fetchWalletAssets(
          IS_USER
            ? xverseAddress
              ? xverseAddress
              : unisatAddress
              ? unisatAddress
              : magicEdenAddress
            : waheedAddress
        );
        result?.length ? setBorrowData(result) : setBorrowData([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet, api_agent, dispatch]);

  useEffect(() => {
    if (activeWallet.length === 0) {
      setBorrowData(null);
    }
  }, [activeWallet]);
  return (
    <>
      <Row align={"middle"}>
        <Col md={2}>
          <CustomButton
            size="medium"
            onClick={() => navigate("/")}
            className="buttonStyle mt-15"
            title={<MdOutlineArrowBack size={20} color="white" />}
          />
        </Col>
        <Col>
          <Title level={2} className="gradient-text-one ">
            All Assets
          </Title>
        </Col>
      </Row>
      <Row
        className="m-top-bottom"
        justify={
          !borrowData ? "center" : borrowData.length === 0 ? "center" : "start"
        }
        gutter={18}
      >
        {(activeWallet.includes(XVERSE_WALLET_KEY) ||
          activeWallet.includes(UNISAT_WALLET_KEY) ||
          activeWallet.includes(MAGICEDEN_WALLET_KEY)) &&
        borrowData === null ? (
          <Loading className={"m-top-bottom"} indicator={<Bars />}></Loading>
        ) : borrowData === null ? (
          <Flex className="iconalignment">
            <FaRegSmileWink className="text-color-one" size={25} />
            <Text className="text-color-one font-large value-one letter-spacing-medium">
              Connect any BTC Wallet !
            </Text>
          </Flex>
        ) : borrowData.length === 0 ? (
          <Flex className="iconalignment">
            <ImSad className="text-color-one" size={25} />
            <Text className="text-color-one font-large value-one letter-spacing-medium">
              Seems you have no assets!
            </Text>
          </Flex>
        ) : (
          <>
            {borrowData?.map((card) => {
              const url = `${process.env.REACT_APP_ORDINALS_CONTENT_API}/content/${card.id}`;

              return (
                <>
                  <Col key={`${card.id}`} xs={24} sm={12} md={12} lg={8} xl={6}>
                    <CardDisplay
                      cover={
                        card.mimeType === "text/html" ? (
                          <iframe
                            title={`${card.id}-borrow_image`}
                            height={300}
                            src={url}
                          />
                        ) : (
                          <img
                            src={url}
                            alt={`${card.id}-borrow_image`}
                            width={300}
                            height={300}
                          />
                        )
                      }
                      hoverable={true}
                      bordered={false}
                      className={
                        "card-bg dashboard-card-padding m-top-bottom cardrelative loan-cards dashboard-cards borrowCards"
                      }
                    >
                      <Row className="assetId" justify={"space-between"}>
                        <Col>
                          <Text className="heading-one font-large text-color-two">
                            ID
                          </Text>
                        </Col>
                        <Col>
                          <Text className="text-color-one font-large value-one">
                            {card.inscriptionNumber}
                          </Text>
                        </Col>
                      </Row>

                      <Row className="borrowButton">
                        <CustomButton
                          block
                          onClick={() => navigate("/dashboard")}
                          title={
                            <Row align={"middle"} justify={"center"} gutter={6}>
                              <Col className="font-medium">Supply </Col>
                            </Row>
                          }
                          className="btn-bg-gradient-one btn-common btn-height"
                        />
                      </Row>
                    </CardDisplay>
                  </Col>
                </>
              );
            })}
          </>
        )}
      </Row>
    </>
  );
};
export default propsContainer(Borrow);
