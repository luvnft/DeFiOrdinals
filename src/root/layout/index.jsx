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

  const businessName = `My Ordinals Loan`;
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
                  {/* <Row justify={"center"}>
                    <Text className="text-color-one dash-headings letter-spacing-medium font-xxlarge font-weight-600">
                      How it works ?
                    </Text>
                  </Row>

                  <Row justify={"center"}>
                    <Col xs={24} md={22}>
                      <Carousel autoplay autoplaySpeed={3000} className="mt-30">
                        <img src={Borrow} alt="borrow" className="flowChart" />
                        <img src={Lend} alt="lend" className="flowChart" />
                      </Carousel>
                    </Col>
                  </Row>

                  <Row justify={"center"}>
                    <Divider />
                  </Row>

                  <Row justify={"center"} className={screens.md && "mt-30"}>
                    <Text className="text-color-one dash-headings letter-spacing-medium font-xxlarge font-weight-600">
                      Backed By
                    </Text>
                  </Row>

                  <Row
                    justify={"center"}
                    className={screens.md ? "mt-30" : "mt-15"}
                  >
                    <Col xs={24} md={16}>
                      <Row
                        justify={{ xs: "center", md: "space-around" }}
                        align={"middle"}
                      >
                        <img
                          className="pointer bounceEffect"
                          alt="xverse-partner"
                          src={bitcoin_backed}
                          width={screens.md ? "300dv" : "200px"}
                        />

                        <img
                          alt="icp-partner"
                          className="pointer bounceEffect brandImages"
                          src={dfinity_backed}
                          width={screens.md ? "150dvw" : "100px"}
                        />

                        <img
                          alt="icp-partner"
                          className="pointer bounceEffect brandImages"
                          src={encode}
                          width={screens.md ? "170dvw" : "160px"}
                        />
                      </Row>
                    </Col>
                  </Row>

                  <Row justify={"center"}>
                    <Divider />
                  </Row>

                  <Row justify={"center"} className={screens.md && "mt-30"}>
                    <Text className="text-color-one dash-headings letter-spacing-medium font-xxlarge font-weight-600">
                      Partners
                    </Text>
                  </Row>

                  <Row
                    justify={"center"}
                    className={screens.md ? "mt-30" : "mt-15"}
                    align={"middle"}
                  >
                    <img
                      className="pointer bounceEffect brandImages"
                      alt="xverse-partner"
                      src={xverse_partner}
                      width={screens.md ? "210dvw" : "160px"}
                    />
                    <img
                      className="pointer bounceEffect brandImages"
                      alt="unisat_logo"
                      src={unisat}
                      width={screens.md ? "170dvw" : "120px"}
                    />

                    <img
                      alt="icp-partner"
                      className="pointer bounceEffect brandImages"
                      src={icp_partner}
                      width={screens.md ? "365dvw" : "320px"}
                    />

                    <img
                      alt="icp-partner"
                      className="pointer bounceEffect brandImages"
                      src={juno}
                      width={screens.md ? "265dvw" : "160px"}
                    />

                    <img
                      alt="icp-partner"
                      className="pointer bounceEffect brandImages"
                      src={motokoLogo}
                      width={screens.md ? "285dvw" : "200px"}
                    />
                  </Row>

                  <Row justify={"center"}>
                    <Divider />
                  </Row>

                  <Row justify={"center"} className={screens.md && "mt-30"}>
                    <Text className="text-color-one dash-headings letter-spacing-medium font-xxlarge font-weight-600">
                      Powered By
                    </Text>
                  </Row>

                  <Row
                    justify={"center"}
                    className={screens.md ? "mt-50" : "mt-15"}
                    align={"middle"}
                  >
                    <img
                      className="pointer bounceEffect brandImages"
                      alt="xverse-partner"
                      src={bitcoin_poweredBy}
                      width={screens.md ? "170dvw" : "150px"}
                    />

                    <img
                      className="pointer bounceEffect brandImages"
                      alt="xverse-partner"
                      src={etherium}
                      width={screens.md ? "170dvw" : "150px"}
                    />

                    <img
                      alt="icp-partner"
                      className="pointer bounceEffect brandImages"
                      src={on_chain_poweredBy}
                      width={screens.md ? "170dvw" : "150px"}
                    />

                    <img
                      alt="icp-partner"
                      className="pointer bounceEffect brandImages"
                      src={icrc_badge}
                      width={"230dvw"}
                    />
                  </Row>

                  <Row justify={"center"} style={{ margin: "20px 0" }}>
                    <Divider />
                  </Row>

                  <Row justify={"center"} className={screens.md && "mt-10"}>
                    <Text className="text-color-one dash-headings letter-spacing-medium font-xxlarge font-weight-600">
                      Do you know?
                    </Text>
                  </Row>

                  <Row justify={"center"}>
                    <Col xs={24} md={22}>
                      <Row
                        gutter={screens.md && 98}
                        justify={"center"}
                        className={screens.md ? "mt-50" : "mt-30"}
                      >
                        <Col>
                          <Link
                            className="iconalignment"
                            target="_blank"
                            to={CKBTC}
                          >
                            <Text className="gradient-text-two pointer font-large font-family-one letter-spacing-small">
                              1. What is ckBTC?
                            </Text>
                            <img
                              src={bitCoin}
                              alt="logo"
                              className="pointer round"
                              width="40px"
                              style={{ marginLeft: "10px" }}
                            />
                          </Link>
                        </Col>
                        <Col className={screens.xs && "mt-20"}>
                          <Link
                            className="iconalignment"
                            target="_blank"
                            to={CKETH}
                          >
                            <Text className="text-decor-line gradient-text-two pointer font-large font-family-one letter-spacing-small">
                              2. What is ckETH?
                            </Text>
                            <img
                              src={etherium}
                              alt="logo"
                              className="pointer round"
                              width="40px"
                              style={{ marginLeft: "10px" }}
                            />
                          </Link>
                        </Col>
                      </Row>
                    </Col>
                  </Row> */}

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
                      >
                        <Col xs={{ order: "2" }} md={{ order: "1" }}>
                          <Flex justify="center" vertical>
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
                            <Text className="gradient-text-one font-small font-family-one letter-spacing-small">
                              {footerText}
                            </Text>
                          </Flex>
                        </Col>

                        <Col
                          xs={{ span: 24, order: "1" }}
                          md={{ span: 16, order: "2" }}
                          sm={16}
                          lg={10}
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
                                        navigate("/myassets");
                                        window.scrollTo(0, 0);
                                      }}
                                      className="text-color-two headertitle title pointer font-small letter-spacing-small"
                                    >
                                      My Assets
                                    </Text>
                                    <Text
                                      onClick={() => {
                                        navigate("/faucet");
                                        window.scrollTo(0, 0);
                                      }}
                                      className="text-color-two headertitle title pointer font-small letter-spacing-small"
                                    >
                                      Faucet
                                    </Text>
                                    <Text
                                      onClick={() => {
                                        navigate("/portfolio");
                                        window.scrollTo(0, 0);
                                      }}
                                      className="text-color-two headertitle title pointer font-small letter-spacing-small"
                                    >
                                      Portfolio
                                    </Text>
                                  </Flex>
                                </Flex>
                              </Col>
                            )}

                            <Row justify={"center"}>
                              <Divider style={{ margin: 0 }} />
                            </Row>

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
                          </Flex>
                        </Col>

                        {screens.md && (
                          <Col
                            md={{ order: "3" }}
                            className={screens.xs && "mt-30"}
                          >
                            {isBroken ? (
                              <GiRawEgg
                                className="eggbroken pointer"
                                color="violet"
                                size={70}
                              />
                            ) : (
                              <GiEasterEgg
                                className={"egg  pointer"}
                                onClick={redirectToBorrow}
                                color="violet"
                                size={70}
                              />
                            )}
                          </Col>
                        )}
                      </Row>
                    </Col>
                  </Row>
                </Footer>
              </>
            ) : null}

            {/* <Footer
              className="black-bg"
              style={{ borderTop: "1px solid #434343" }}
            >
              <Row justify={"center"}>
                <Col xs={22}>
                  <Row justify={"center"}>

                    <Col>
                      <Text className="font-medium text-color-two">
                        {footerText}
                      </Text>
                    </Col>

                  </Row>
                </Col>
              </Row>
            </Footer> */}
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
