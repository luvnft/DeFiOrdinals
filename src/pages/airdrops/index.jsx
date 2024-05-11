import { Principal } from "@dfinity/principal";
import { Col, Popconfirm, Row, Tooltip } from "antd";
import { useEffect, useState } from "react";
import claimed from "../../assets/airdrop/claimed.png";
import unclaimed from "../../assets/airdrop/uncliamed.png";
import CustomButton from "../../component/Button";
import { StatCard } from "../../component/card";
import WalletUI from "../../component/download-wallets-UI";
import Notify from "../../component/notification";
import { propsContainer } from "../../container/props-container";
import { setAirDropData, setAirPoints } from "../../redux/slice/constant";

const AirDrops = (props) => {
  const { reduxState, dispatch, isPlugError } = props.redux;
  const { location } = props.router;
  const affiliateCanister = reduxState.constant.affiliateCanister;
  const airDropData = reduxState.constant.airDropData;
  const airPoints = reduxState.constant.airPoints;
  const walletState = reduxState.wallet;
  const activeWallet = reduxState.wallet.active;
  const searchParams = new URLSearchParams(location.search);
  const referralCode = searchParams.get("referral");

  let plugAddress = walletState.plug.principalId;
  const xverseAddress = walletState.xverse.ordinals.address;
  const unisatAddress = walletState.unisat.address;
  const magicEdenAddress = walletState.magicEden.ordinals.address;

  const airdrop = process.env.REACT_APP_AIRDROP;

  const [unclaimedPoints, setUnclaimedPoints] = useState(0);

  const fetchAirDrop = async () => {
    try {
      const airDropData = await affiliateCanister.getAirDrops(
        Principal.fromText(plugAddress)
      );
      if (airDropData.ordinalAddress) {
        dispatch(setAirDropData(airDropData));
      }
    } catch (error) {
      console.log("Get Air Drop error", error);
    }
  };

  const handleRegister = async () => {
    try {
      await affiliateCanister.setAirdrops(
        xverseAddress
          ? xverseAddress
          : unisatAddress
          ? unisatAddress
          : magicEdenAddress,
        referralCode ? referralCode : "NONE"
      );
      await fetchAirDrop();
    } catch (error) {
      console.log("set Air Drop Error", error);
    }
  };

  const handleClaim = async () => {
    try {
      if (unclaimedPoints >= 10) {
        const claimRes = await affiliateCanister.claimPoints();
        if (claimRes) {
          await fetchUserPoints();
          await fetchUnclaimedPoints();
          Notify("success", `Successfully claimed ${claimRes}`);
        } else {
          Notify("error", `Something went wrong, try again later!`);
        }
      } else {
        Notify("warning", "You should have atleast 10 points to claim!");
      }
    } catch (error) {
      console.log("claim Error", error);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const claimedPoints = await affiliateCanister.getUserPoints(
        Principal.fromText(plugAddress)
      );
      dispatch(setAirPoints(Number(claimedPoints)));
    } catch (error) {
      console.log("Get Air Drop error", error);
    }
  };

  const fetchUnclaimedPoints = async () => {
    try {
      const unclaimedPoints = await affiliateCanister.getUnclaimPoints(
        Principal.fromText(plugAddress)
      );
      setUnclaimedPoints(Number(unclaimedPoints));
    } catch (error) {
      console.log("Get Air Drop error", error);
    }
  };

  useEffect(() => {
    (async () => {
      if (
        plugAddress &&
        affiliateCanister &&
        (xverseAddress || unisatAddress || magicEdenAddress)
      ) {
        await fetchUnclaimedPoints();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    affiliateCanister,
    plugAddress,
    unisatAddress,
    xverseAddress,
    magicEdenAddress,
  ]);

  useEffect(() => {
    if (activeWallet.length === 0) {
      dispatch(setAirPoints(0));
      dispatch(setAirDropData({}));
      setUnclaimedPoints(0);
    }
  }, [activeWallet, dispatch]);

  return (
    <>
      <Row>
        <Col>
          <h1 className="font-xlarge gradient-text-one">Airdrops</h1>
        </Col>
      </Row>

      <Row justify={"center"}>
        <Col>
          {activeWallet?.length === 2 && !isPlugError ? (
            <>
              <Row
                justify={"space-between"}
                align={"middle"}
                className="mt-30"
                gutter={32}
              >
                <Col>
                  <StatCard
                    icon={
                      <img
                        className="bg-transparent rocket"
                        src={claimed}
                        alt="noimage"
                        style={{
                          justifyContent: "center",
                          borderRadius: "25%",
                        }}
                        width="60dvw"
                      />
                    }
                    value={airPoints}
                    label="Claimed Points"
                  />
                </Col>

                <Col>
                  <StatCard
                    icon={
                      <img
                        className="bg-transparent rocket"
                        src={unclaimed}
                        alt="noimage"
                        style={{
                          justifyContent: "center",
                          borderRadius: "25%",
                        }}
                        width="60dvw"
                      />
                    }
                    value={unclaimedPoints}
                    label="Unclaimed Points"
                  />
                </Col>

                <Col>
                  <Popconfirm
                    className="z-index"
                    color="black"
                    placement="top"
                    style={{ color: "white" }}
                    title={
                      <span className="font-small heading-one  text-color-two">
                        {`Are you sure want to claim Air Drop points?`}
                      </span>
                    }
                    okText="Yes"
                    cancelText="No"
                    onConfirm={handleClaim}
                  >
                    <CustomButton
                      block
                      className={
                        "font-weight-600 letter-spacing-small font-medium btn-height click-btn"
                      }
                      title="Claim Points"
                      size="medium"
                    />
                  </Popconfirm>
                </Col>

                {!airDropData.ordinalAddress && (
                  <Col>
                    <Popconfirm
                      className="z-index"
                      color="black"
                      placement="top"
                      style={{ color: "white" }}
                      title={
                        <span className="font-small heading-one text-color-two">
                          {`Are you sure want to register in Air Drop?`}
                        </span>
                      }
                      okText="Yes"
                      cancelText="No"
                      onConfirm={handleRegister}
                    >
                      <CustomButton
                        block
                        className={
                          "font-weight-600 letter-spacing-small font-medium btn-height"
                        }
                        title="Register"
                        size="medium"
                      />
                    </Popconfirm>
                  </Col>
                )}
              </Row>

              {airDropData.referral && (
                <Row justify={"center"} className="mt-70 p-relative">
                  <div className="card1">
                    <Tooltip
                      title="Copied"
                      trigger={"click"}
                      destroyTooltipOnHide
                    >
                      <p
                        className="small pointer"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            `${airdrop}?referral=${airDropData.referral}`
                          )
                        }
                      >
                        {`${airdrop}?referral=${airDropData.referral}`}
                      </p>
                    </Tooltip>
                    <div className="go-corner">
                      <div className="go-arrow">Referral Link</div>
                    </div>
                  </div>
                </Row>
              )}
            </>
          ) : (
            <WalletUI isAirdrop={true} isPlugError={isPlugError} />
          )}
        </Col>
      </Row>
    </>
  );
};

export default propsContainer(AirDrops);
