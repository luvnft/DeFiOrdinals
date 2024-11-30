import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Col, Row } from "antd";
import { useEffect, useState } from "react";
import Notify from "../../component/notification";
import { propsContainer } from "../../container/props-container";
import { getAptosClient } from "../../utils/aptosClient";
import { client, contractAddress } from "../../utils/aptosService";

const Faucet = (props) => {
  const { reduxState } = props.redux;
  const { signAndSubmitTransaction, connected, connect, wallets, account } =
    useWallet();
  const walletState = reduxState.wallet;
  const petraAddress = walletState.petra.address;

  // console.log("connected", connected);
  // console.log("wallet", wallets[0].name);
  // const [account, setAccount] = useState(null);
  const [petraAccount, setAccount] = useState(null);
  const [transactionResult, setTransactionResult] = useState(null);
  const [gotchiName, setGotchiName] = useState("Abishek006");

  const config = new AptosConfig({
    network: Network.DEVNET,
  });
  const aptosClient = new Aptos(config);

  const connectWallet = async () => {
    try {
      const aptosClient = getAptosClient(Network.DEVNET);
      const payload = {
        type: "entry_function_payload",
        function:
          "0x7b8a71405e76e1a3cccc7e9f5f01d401b466f02d7731dc753afa8a2b9ac7bc68::borrow::get_all_borrow_requests",
        arguments: [petraAddress], // Add function arguments here
        type_arguments: [],
      };
      // console.log("payload", payload);
      // console.log("client", aptosClient);
      const response = await aptosClient.view(payload);
      // console.log("response", response);
    } catch (error) {
      console.log("Failed to fetch resource:", error);
    }
  };

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const payload = {
  //         type: "entry_function_payload",
  //         function: `${contractAddress}::main::get_aptogotchi`,
  //         arguments: [account.address], // Add function arguments here
  //         type_arguments: [],
  //       };
  //       const response = await aptosClient.view(payload);
  //       console.log("response", response);
  //     } catch (error) {
  //       console.log("Failed to fetch resource:", error);
  //     }
  //   })();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // console.log("account", account);
  // console.log("transactionResult", transactionResult);

  const handleCreateAptogotchi = async () => {
    if (connected) {
      try {
        const payload = {
          type: "entry_function_payload",
          function: `${contractAddress}::main::create_aptogotchi`,
          arguments: [
            "Abiii007",
            Math.floor(Math.random() * Number(5)),
            Math.floor(Math.random() * Number(6)),
            Math.floor(Math.random() * Number(4)),
          ], // Add function arguments here
          type_arguments: [],
        };

        const transaction = await window.aptos.signAndSubmitTransaction(
          payload
        );
        // console.log("transaction", transaction);
        await aptosClient.waitForTransaction(transaction.hash);
        setTransactionResult(transaction);
      } catch (error) {
        console.log("Create Aptogochi error", error);
        Notify("warning", error.message);
      }
    } else {
      Notify("warning", "Wallet not connected error");
    }
  };

  // useEffect(() => {
  //   if (!connected) {
  //     try {
  //       connect(wallets[0].name);
  //     } catch (error) {
  //       console.log("app connection error", error);
  //     } finally {
  //       // Notify("success", "Petra connected!");
  //     }
  //   }
  //   // const newAccount = await createAccount();
  //   // // newAccount.accountAddress.hexString = petraAddress;
  //   // setAccount(newAccount);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [petraAddress]);

  return (
    <>
      <Row>
        <Col>
          <h1 className="font-xlarge gradient-text-one">Faucet</h1>
        </Col>
      </Row>

      <Row>
        {/* <CustomButton
          className={
            "font-weight-600 letter-spacing-small font-medium btn-height click-btn"
          }
          title="Create gotchi"
          size="medium"
          // onClick={handleCreateAptogotchi}
          onClick={connectWallet}
        /> */}
      </Row>

      {/* <Row justify={"center"}>
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
      </Row> */}
    </>
  );
};

export default propsContainer(Faucet);
