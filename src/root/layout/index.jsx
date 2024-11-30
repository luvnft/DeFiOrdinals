import {
  Carousel,
  Col,
  Divider,
  Flex,
  Grid,
  Layout,
  Row,
  Tooltip,
  Typography,
} from "antd";
import { Content, Footer, Header } from "antd/es/layout/layout";
import gsap from "gsap";
import React, { Suspense, useState } from "react";
import { FaMedium, FaSquareXTwitter, FaTelegram } from "react-icons/fa6";
import { GiEasterEgg, GiRawEgg } from "react-icons/gi";
import { GrMail } from "react-icons/gr";
import { SiDiscord } from "react-icons/si";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Borrow from "../../assets/Borrow-Process.png";
import icp_partner from "../../assets/brands/INTERNET_COMPUTER_white.png";
import {
  default as bitCoin,
  default as bitcoin_poweredBy,
} from "../../assets/brands/bitcoin.png";
import bitcoin_backed from "../../assets/brands/bitcoin_startup.png";
import encode from "../../assets/brands/encode_black.png";
import dfinity_backed from "../../assets/brands/icp_logo.png";
import icrc_badge from "../../assets/brands/icrc_badge.png";
import juno from "../../assets/brands/juno.png";
import motokoLogo from "../../assets/brands/motoko.png";
import on_chain_poweredBy from "../../assets/brands/on_chain_host.png";
import xverse_partner from "../../assets/brands/xverse_logo_darkbg.png";
import etherium from "../../assets/coin_logo/cketh.png";
import Lend from "../../assets/lend-process.png";
import logo from "../../assets/logo/ordinalslogo.png";
import unisat from "../../assets/wallet-logo/unisatLogo.png";
import LoadingWrapper from "../../component/loading-wrapper";
import Mainheader from "../../container/footer";
import Nav from "../../container/nav";
import { publicRoutes } from "../../routes";

const MainLayout = () => {
  const { Text } = Typography;
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  const [isBroken, setBroken] = useState(false);

  const CKBTC = process.env.REACT_APP_CKBTC_DETAILS;
  const CKETH = process.env.REACT_APP_CKETH_DETAILS;
  const MAIL_TO = process.env.REACT_APP_MAILTO;
  const ORDINALS_MEDIUM = process.env.REACT_APP_ORDINALS_MEDIUM;
  const TWITTER_LINK = process.env.REACT_APP_TWITTER_LINK;

  const businessName = `ORdefi`;
  const footerText = `All rights reserved © Copyright ${new Date().getFullYear()}`;

  const redirectToBorrow = () => {
    setBroken(true);
    setTimeout(() => {
      navigate("/borrow");
      setBroken(false);
    }, 1000);
  };

  gsap.to(".round", {
    rotation: 360,
    duration: 4,
    repeat: -1,
    repeatDelay: 10,
    ease: "none",
  });
  gsap.fromTo(
    ".slide",
    { autoAlpha: 0, backgroundColor: "red" },
    { autoAlpha: 1, duration: 0.5, backgroundColor: "red" }
  );

  return (
    <React.Fragment>
      <Header className="header-sticky z-index">
        <Row justify={"center"}>
          <Col xs={23}>
            <Nav />
          </Col>
        </Row>
      </Header>
      <Layout>
        <Layout className="slide" style={{ backgroundColor: "black" }}>
          {/* Don't touch content minHeight */}
          <Content className="theme-bg" style={{ minHeight: "85.60vh" }}>
            <Row justify={"center"} className="blurEffect">
              <Col xs={23} md={21}>
                <Routes>
                  {publicRoutes.map((route, index) => {
                    let Component = route.component;
                    return (
                      <Route
                        key={`route-${index}`}
                        path={route.path}
                        element={
                          <Suspense
                            fallback={
                              <LoadingWrapper>Loading...</LoadingWrapper>
                            }
                          >
                            <Component />
                          </Suspense>
                        }
                      />
                    );
                  })}
                </Routes>
              </Col>
            </Row>
          </Content>

          <Flex vertical>
            {location.pathname === "/" ? (
              <>
                <Footer className="main-bg-b-to-t" style={{ padding: "20px" }}>
                  <Row justify={"center"} className="mt-30">
                    <Col xs={24} md={22}>
                      <Row justify={"space-between"} gutter={20}>
                        <Col md={7}>
                          <Flex vertical gap={10} wrap="wrap">
                            <Text
                              className={`text-color-one font-large font-weight-600 letter-spacing-small ${
                                screens.xs ? "text-decor-line" : ""
                              }`}
                            >
                              Lightning Payment
                            </Text>
                            <Text className="text-color-two font-small letter-spacing-small">
                              Ordinals payment are powered by Chain-key Bitcoin
                              (ckBTC) is an ICRC-2-compliant token that is
                              backed 1:1 by bitcoins held 100% on the IC
                              mainnet.
                            </Text>
                          </Flex>
                        </Col>

                        <Col md={7}>
                          <Flex vertical gap={10} wrap="wrap">
                            <Text
                              className={`text-color-one font-large font-weight-600 letter-spacing-small ${
                                screens.xs ? "mt text-decor-line" : ""
                              }`}
                            >
                              PSBTs and DLCs
                            </Text>
                            <Text className="text-color-two font-small letter-spacing-small">
                              Partially Signed Bitcoin Transactions (PSBTs) &
                              Discreet Log Contract (DLC) are used to facilitate
                              the transactions and securely escrow the Ordinal.
                            </Text>
                          </Flex>
                        </Col>

                        <Col md={7}>
                          <Flex vertical gap={10} wrap="wrap">
                            <Text
                              className={`text-color-one font-large font-weight-600 letter-spacing-small ${
                                screens.xs ? "mt text-decor-line" : ""
                              }`}
                            >
                              No Wrapping
                            </Text>
                            <Text className="text-color-two font-small letter-spacing-small">
                              You don't need to wrap your Ordinals or use
                              intermediaries because everything occurs on
                              Layer-1 Bitcoin.
                            </Text>
                          </Flex>
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                  <Row
                    justify={"center"}
                    className={screens.md ? "mt-50" : "mt-15"}
                    style={{ paddingBottom: "50px" }}
                  >
                    <Col md={22}>
                      <Row
                        justify={{ md: "space-between", xs: "center" }}
                        align={"middle"}
                        style={{
                          alignItems: "center",
                        }}
                      >
                        <Col
                          xs={{ order: "2", span: 24 }}
                          md={{ order: "1" }}
                          lg={{ span: 8 }}
                          className={
                            screens.md || screens.sm || screens.xs ? "mt-7" : ""
                          }
                        >
                          <Flex
                            justify="center"
                            align={
                              screens.md || screens.sm || screens.xs
                                ? "center"
                                : ""
                            }
                            vertical
                          >
                            <img
                              src={logo}
                              alt="logo"
                              className="pointer"
                              width="100px"
                              style={{ marginLeft: "-10px" }}
                            />
                            <Text className="gradient-text-two font-large font-family-one letter-spacing-large">
                              {businessName}
                            </Text>
                            <Text
                              className={`gradient-text-one ${
                                screens.xs ? "font-xssmall" : "font-small"
                              } font-family-one letter-spacing-small`}
                            >
                              {" "}
                              {footerText}
                            </Text>
                          </Flex>
                        </Col>

                        <Col
                          xs={{ span: 24, order: "1" }}
                          md={{ order: "2" }}
                          sm={24}
                          lg={{ span: 10 }}
                          className={
                            screens.md || screens.sm || screens.xs
                              ? "mt-15"
                              : ""
                          }
                        >
                          <Flex vertical gap={15}>
                            {screens.md && (
                              <Col>
                                <Flex vertical gap={15} wrap="wrap">
                                  <Flex justify="space-between" wrap="wrap">
                                    <Text
                                      onClick={() => {
                                        navigate("/lending");
                                        window.scrollTo(0, 0);
                                      }}
                                      className="text-color-two headertitle title pointer font-small letter-spacing-small"
                                    >
                                      Lending
                                    </Text>
                                    <Text
                                      onClick={() => {
                                        navigate("/borrowing");
                                        window.scrollTo(0, 0);
                                      }}
                                      className="text-color-two headertitle title pointer font-small letter-spacing-small"
                                    >
                                      Borrowing
                                    </Text>
                                    <Text
                                      onClick={() => {
                                        navigate("/bridge");
                                        window.scrollTo(0, 0);
                                      }}
                                      className="text-color-two headertitle title pointer font-small letter-spacing-small"
                                    >
                                      Bridge Ordinals
                                    </Text>
                                  </Flex>
                                </Flex>
                              </Col>
                            )}

                            {!screens.xs ? (
                              <Row justify={"center"}>
                                <Divider style={{ margin: 0 }} />
                              </Row>
                            ) : (
                              ""
                            )}

                            {screens.xs && (
                              <Row
                                justify={"center"}
                                style={{ marginTop: screens.xs && "-15px" }}
                              >
                                <Text className="text-color-one dash-headings letter-spacing-medium font-xxlarge font-weight-600">
                                  Follow us on
                                </Text>
                              </Row>
                            )}

                            <Flex
                              justify="space-between"
                              className={screens.xs && "mt-15"}
                            >
                              <Tooltip
                                arrow
                                title={"myordinalsloan@gmail.com"}
                                trigger={"hover"}
                              >
                                <Text className="font-xlarge">
                                  <a href={MAIL_TO}>
                                    {" "}
                                    <GrMail
                                      color="#7a4bc5"
                                      className="pointer homepageicon"
                                    />
                                  </a>
                                </Text>
                              </Tooltip>
                              <Link target={"_blank"} to={ORDINALS_MEDIUM}>
                                <Text className="font-xlarge pointer">
                                  <FaMedium
                                    color="#7a4bc5"
                                    className="homepageicon"
                                  />
                                </Text>
                              </Link>
                              <Link target={"_blank"} to={TWITTER_LINK}>
                                <Text className="font-xlarge pointer">
                                  <FaSquareXTwitter
                                    color="#7a4bc5"
                                    className="homepageicon"
                                  />
                                </Text>
                              </Link>
                              <Text className="font-xlarge pointer">
                                <FaTelegram
                                  color="#7a4bc5"
                                  className="homepageicon"
                                />
                              </Text>
                              <Text className="font-xlarge pointer">
                                <SiDiscord
                                  color="#7a4bc5"
                                  className="homepageicon"
                                />
                              </Text>
                            </Flex>
                            {screens.xs ? (
                              <Row justify={"center"}>
                                <Divider style={{ margin: 0 }} />
                              </Row>
                            ) : (
                              ""
                            )}
                          </Flex>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Footer>
              </>
            ) : null}
            <div className="value-header">
              <Header className="header z-index">
                <Row justify={"center"}>
                  <Col xs={21}>
                    <Mainheader />
                  </Col>
                </Row>
              </Header>
            </div>
          </Flex>
        </Layout>
      </Layout>
    </React.Fragment>
  );
};

export default MainLayout;
