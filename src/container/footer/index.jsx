import { Col, Flex, Grid, Row, Typography } from "antd";
import gsap from "gsap";
import React, { useEffect } from "react";
import TailSpin from "react-loading-icons/dist/esm/components/tail-spin";
import claimed from "../../assets/airdrop/claimed.png";
import Bitcoin_Orange from "../../assets/coin_logo/Bitcoin.png";
import Aptos from "../../assets/wallet-logo/aptos_logo.png";
import Bitcoin from "../../assets/coin_logo/ckbtc.png";
import Eth from "../../assets/coin_logo/cketh.png";
import Loading from "../../component/loading-wrapper/secondary-loader";
import { propsContainer } from "../props-container";
import {
  MAGICEDEN_WALLET_KEY,
  UNISAT_WALLET_KEY,
  XVERSE_WALLET_KEY,
} from "../../utils/common";

const Footer = (props) => {
  const { Text } = Typography;
  const { useBreakpoint } = Grid;
  const breakpoints = useBreakpoint();
  const { reduxState } = props.redux;

  const walletState = reduxState.wallet;
  const constantState = reduxState.constant;

  let USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const xverseBtcBalance = walletState.xverse.btcBalance;
  const unisatAddress = walletState.unisat.address;
  const unisatBtcBalance = walletState.unisat.btcBalance;
  const airDropPoints = constantState.airPoints;
  const activeWallets = reduxState.wallet.active;

  const [screenDimensions, setScreenDimensions] = React.useState({
    width: window.screen.width,
    height: window.screen.height,
  });

  const getScreenDimensions = (e) => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    setScreenDimensions({ width, height });
  };

  useEffect(() => {
    window.addEventListener("resize", getScreenDimensions);
    return () => {
      window.removeEventListener("resize", getScreenDimensions);
    };
  });

  gsap.to(".round", {
    rotation: 360,
    duration: 4,
    repeat: -1,
    repeatDelay: 10,
    ease: "none",
  });

  return (
    <>
      <Row justify={"space-between"} align={"middle"}>
        <Col>
          <Loading
            spin={!constantState.aptosvalue}
            indicator={
              <TailSpin stroke="#6a85f1" alignmentBaseline="central" />
            }
          >
            {constantState.aptosvalue ? (
              <Flex gap={5} align="center">
                <img
                  className="round"
                  src={Aptos}
                  alt="noimage"
                  style={{ justifyContent: "center" }}
                  width={breakpoints.xs ? "25dvw" : "35dvw"}
                  height={breakpoints.xs && "25px"}
                />
                <Text
                  className={`gradient-text-one ${
                    breakpoints.xs ? "font-xmsmall" : "font-small"
                  } heading-one`}
                >
                  {USDollar.format(constantState.aptosvalue)}
                </Text>
              </Flex>
            ) : (
              ""
            )}
          </Loading>
        </Col>

        <Col>
          <Loading
            spin={!constantState.btcvalue}
            indicator={
              <TailSpin stroke="#6a85f1" alignmentBaseline="central" />
            }
          >
            {constantState.btcvalue ? (
              <Flex gap={5} align="center">
                <img
                  className="round"
                  src={Bitcoin}
                  alt="noimage"
                  style={{ justifyContent: "center" }}
                  width={breakpoints.xs ? "25dvw" : "35dvw"}
                  height={breakpoints.xs && "25px"}
                />
                <Text
                  className={`gradient-text-one ${
                    breakpoints.xs ? "font-xmsmall" : "font-small"
                  } heading-one`}
                >
                  {USDollar.format(constantState.btcvalue)}
                </Text>
              </Flex>
            ) : (
              ""
            )}
          </Loading>
        </Col>

        <Col>
          <Flex gap={5} align="center">
            <img
              className="round"
              src={Bitcoin_Orange}
              alt="noimage"
              style={{ justifyContent: "center" }}
              width={breakpoints.xs ? "25dvw" : "35dvw"}
              height={breakpoints.xs && "25px"}
            />
            <Text className="gradient-text-one font-size-20 heading-one">
              {unisatBtcBalance ? (
                <>{unisatBtcBalance} </>
              ) : xverseBtcBalance ? (
                <>{xverseBtcBalance} </>
              ) : (
                0
              )}
            </Text>
          </Flex>
        </Col>
      </Row>
    </>
  );
};

export default propsContainer(Footer);
