import { Col, Grid, Row, Skeleton, Space, Tooltip, Typography } from "antd";
import gsap from "gsap";
import React, { useEffect, useState } from "react";
import BallTriangle from "react-loading-icons/dist/esm/components/ball-triangle";
import Bitcoin from "../../assets/coin_logo/ckbtc.png";
import Aptos from "../../assets/wallet-logo/aptos_logo.png";
import CardDisplay from "../../component/card";
import Loading from "../../component/loading-wrapper/secondary-loader";
import { propsContainer } from "../../container/props-container";
import { API_METHODS, apiUrl } from "../../utils/common";

const Home = (props) => {
  const { reduxState } = props.redux;
  const { api_agent } = props.wallet;
  const collections = reduxState.constant.approvedCollections;
  const btcvalue = reduxState.constant.btcvalue;
  const ethvalue = reduxState.constant.ethvalue;
  const aptosvalue = reduxState.constant.aptosvalue;

  const { Title, Text } = Typography;
  const { useBreakpoint } = Grid;
  const breakpoints = useBreakpoint();

  const BTC_ZERO = process.env.REACT_APP_BTC_ZERO;
  const ETH_ZERO = process.env.REACT_APP_ETH_ZERO;

  const [dashboards, setDashboards] = useState({
    activeCkBtcVol: null,
    activeCkEthVol: null,
    totalCkBtc: null,
    totalCkEth: null,
    totalVolInUSD: null,
    activeVolInUSD: null,
  });

  useEffect(() => {
    (async () => {
      if (api_agent) {
        const ckBtcBalance = await api_agent.ckBTCBalance();
        setDashboards((prev) => ({
          ...prev,
          activeCkBtcVol: Number(ckBtcBalance) / BTC_ZERO,
        }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api_agent]);

  useEffect(() => {
    (async () => {
      if (api_agent) {
        const ckEthBalance = await api_agent.ckEthBalance();
        setDashboards((prev) => ({
          ...prev,
          activeCkEthVol: Number(ckEthBalance) / ETH_ZERO,
        }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api_agent]);

  gsap.to(".box", {
    y: 10,
    stagger: {
      // wrap advanced options in an object
      each: 0.1,
      from: "center",
      grid: "auto",
      ease: "power2.inOut",
      repeat: 1, // Repeats immediately, not waiting for the other staggered animations to finish
    },
  });

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Title level={2} className="gradient-text-one ">
            Bitcoin Ordinal Collections
          </Title>
        </Col>
      </Row>

      <Row justify={"start"} gutter={32}>
        {collections.map((collection, index) => {
          const name = collection?.data?.name;
          const nameSplitted = collection?.data?.name?.split(" ");
          let modifiedName = "";
          nameSplitted?.forEach((word) => {
            if ((modifiedName + word).length < 25) {
              modifiedName = modifiedName + " " + word;
            }
          });

          return (
            <Col
              key={`${collection?.symbol}-${index}`}
              lg={8}
              md={12}
              sm={12}
              xs={24}
            >
              <Skeleton loading={!collection.symbol} active>
                <CardDisplay
                  className={
                    "main-bg dashboard-card-padding m-top-bottom dashboard-cards pointer box collection-bg"
                  }
                >
                  <Row justify={"center"}>
                    <Col>
                      <div style={{ display: "grid", placeContent: "center" }}>
                        {name?.length > 35 ? (
                          <Tooltip arrow title={name}>
                            <Text className="heading-one font-medium text-color-one">
                              {`${modifiedName}...`}
                            </Text>
                          </Tooltip>
                        ) : (
                          <Text className="heading-one font-medium text-color-one">
                            {modifiedName}
                          </Text>
                        )}
                      </div>
                    </Col>
                  </Row>
                  <Row
                    justify={{ xs: "space-between", md: "center" }}
                    align={"middle"}
                  >
                    <Col xs={4} md={5}>
                      <Row justify={"center"}>
                        <img
                          className="border-radius-5 loan-cards"
                          width={breakpoints.xs ? "90px" : "100%"}
                          height={"75dvw"}
                          alt={name}
                          src={collection?.data?.imageURI}
                          onError={(e) =>
                            (e.target.src = `${process.env.PUBLIC_URL}/collections/${collection?.data?.symbol}.png`)
                          }
                          // src={`${process.env.PUBLIC_URL}/collections/${collection?.data?.symbol}.png`}
                        />
                      </Row>
                    </Col>

                    <Col xs={17} md={16} lg={18} xl={16}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "auto auto",
                          gridColumnGap: "10px",
                          placeContent: "center",
                        }}
                      >
                        <div>
                          <Text className="font-medium text-color-two">
                            Floor
                          </Text>
                        </div>

                        <div>
                          <Text className="font-medium text-color-two">
                            <img src={Aptos} alt="noimage" width="20px" />{" "}
                            {/* {(collection.floorPrice / BTC_ZERO).toFixed(3)} */}
                            {(
                              ((collection.floorPrice / BTC_ZERO) * btcvalue) /
                              aptosvalue
                            ).toFixed(2)}
                          </Text>
                        </div>

                        <div>
                          <Text className="font-medium text-color-two">
                            Volume
                          </Text>
                        </div>

                        <div>
                          <Text className="font-medium text-color-two">
                            <img src={Aptos} alt="noimage" width="20px" />{" "}
                            {/* {(collection.totalVolume / BTC_ZERO).toFixed(2)} */}
                            {(
                              ((collection.totalVolume / BTC_ZERO) * btcvalue) /
                              aptosvalue
                            ).toFixed(2)}
                          </Text>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </CardDisplay>
              </Skeleton>
            </Col>
          );
        })}
      </Row>

      <Row>
        <Col>
          <h1
            style={{ margin: breakpoints.md && "10px 0" }}
            className="font-xlarge gradient-text-one"
          >
            Browse
          </h1>
        </Col>
      </Row>

      <Row className="" justify={"space-between"} gutter={32}>
        <Col lg={8} md={12} sm={12} xs={24}>
          <CardDisplay
            bordered={false}
            className={
              "main-bg dashboard-card-padding m-top-bottom dashboard-cards"
            }
          >
            <Space direction="vertical" className="flex-grow">
              <Text className="heading-one font-large text-color-two">
                Active ckBTC Vol
              </Text>

              <Text className="text-color-one font-medium value-one letter-spacing-small">
                {dashboards.activeCkBtcVol ? (
                  dashboards.activeCkBtcVol
                ) : (
                  <Loading
                    spin={!dashboards.activeCkBtcVol}
                    indicator={
                      <BallTriangle
                        stroke="#6a85f1"
                        alignmentBaseline="central"
                      />
                    }
                  />
                )}
              </Text>
            </Space>
          </CardDisplay>
        </Col>

        <Col lg={8} md={12} sm={12} xs={24}>
          <CardDisplay
            bordered={false}
            className={
              "main-bg dashboard-card-padding m-top-bottom dashboard-cards "
            }
          >
            <Space direction="vertical" className="flex-grow">
              <Text className="heading-one font-large text-color-two">
                Active ckETH Vol
              </Text>
              <Text className="text-color-one font-medium value-one letter-spacing-small">
                {dashboards.activeCkEthVol ? (
                  dashboards.activeCkEthVol
                ) : (
                  <Loading
                    spin={!dashboards.activeCkEthVol}
                    indicator={
                      <BallTriangle
                        stroke="#6a85f1"
                        alignmentBaseline="central"
                      />
                    }
                  />
                )}
              </Text>
            </Space>
          </CardDisplay>
        </Col>

        <Col lg={8} md={12} sm={12} xs={24}>
          <CardDisplay
            bordered={false}
            className={
              "main-bg dashboard-card-padding m-top-bottom dashboard-cards"
            }
          >
            <Space direction="vertical" className="flex-grow">
              <Text className="heading-one font-large text-color-two">
                Total vol in USD{" "}
              </Text>
              <Text className="text-color-one font-medium value-one letter-spacing-small">
                {dashboards.activeCkBtcVol &&
                btcvalue &&
                dashboards.activeCkEthVol &&
                ethvalue ? (
                  <>
                    <span className="font-weight-600 font-large ">$</span>
                    <span style={{ marginLeft: "5px" }}>
                      {(
                        dashboards.activeCkBtcVol * btcvalue +
                        dashboards.activeCkEthVol * ethvalue
                      ).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <Loading
                    spin={!(dashboards.activeCkBtcVol && btcvalue)}
                    indicator={
                      <BallTriangle
                        stroke="#6a85f1"
                        alignmentBaseline="central"
                      />
                    }
                  />
                )}
              </Text>
            </Space>
          </CardDisplay>
        </Col>

        <Col lg={8} md={12} sm={12} xs={24}>
          <CardDisplay
            bordered={false}
            className={
              "main-bg dashboard-card-padding m-top-bottom dashboard-cards"
            }
          >
            <Space direction="vertical" className="flex-grow">
              <Text className="heading-one font-large text-color-two">
                Total ckBTC{" "}
              </Text>
              <Text className="text-color-one font-medium value-one">
                {" "}
                {dashboards.activeCkBtcVol ? (
                  dashboards.activeCkBtcVol
                ) : (
                  <Loading
                    spin={!dashboards.activeCkBtcVol}
                    indicator={
                      <BallTriangle
                        stroke="#6a85f1"
                        alignmentBaseline="central"
                      />
                    }
                  />
                )}{" "}
              </Text>
            </Space>
          </CardDisplay>
        </Col>

        <Col lg={8} md={12} sm={12} xs={24}>
          <CardDisplay
            bordered={false}
            className={
              "main-bg dashboard-card-padding m-top-bottom dashboard-cards"
            }
          >
            <Space direction="vertical" className="flex-grow">
              <Text className="heading-one font-large text-color-two">
                Total ckETH{" "}
              </Text>
              <Text className="text-color-one font-medium value-one">
                {dashboards.activeCkEthVol ? (
                  dashboards.activeCkEthVol
                ) : (
                  <Loading
                    spin={!dashboards.activeCkEthVol}
                    indicator={
                      <BallTriangle
                        stroke="#6a85f1"
                        alignmentBaseline="central"
                      />
                    }
                  />
                )}{" "}
              </Text>
            </Space>
          </CardDisplay>
        </Col>

        <Col lg={8} md={12} sm={12} xs={24}>
          <CardDisplay
            bordered={false}
            className={
              "main-bg dashboard-card-padding m-top-bottom dashboard-cards"
            }
          >
            <Space direction="vertical" className="flex-grow">
              <Text className="heading-one font-large text-color-two">
                Active vol in USD{" "}
              </Text>
              <Text className="text-color-one font-medium value-one">
                {dashboards.activeCkBtcVol &&
                btcvalue &&
                dashboards.activeCkEthVol &&
                ethvalue ? (
                  <>
                    <span className="font-weight-600 font-large ">$</span>
                    <span style={{ marginLeft: "5px" }}>
                      {" "}
                      {(
                        dashboards.activeCkBtcVol * btcvalue +
                        dashboards.activeCkEthVol * ethvalue
                      ).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <Loading
                    spin={!(dashboards.activeCkBtcVol && btcvalue)}
                    indicator={
                      <BallTriangle
                        stroke="#6a85f1"
                        alignmentBaseline="central"
                      />
                    }
                  />
                )}{" "}
              </Text>
            </Space>
          </CardDisplay>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default propsContainer(Home);
