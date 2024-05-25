import { Col, Row } from "antd";
import { propsContainer } from "../../container/props-container";
import {
  Account,
  Aptos,
  AptosConfig,
  parseTypeTag,
  NetworkToNetworkName,
  Network,
  AccountAddress,
  U64,
  Ed25519PrivateKey,
} from "@aptos-labs/ts-sdk";
import { useEffect } from "react";
import { Principal } from "@dfinity/principal";

const Faucet = (props) => {
  const { reduxState, dispatch, isPlugError } = props.redux;
  const walletState = reduxState.wallet;
  const devNet = process.env.REACT_APP_APTOS_DEVNET;
  const petraAddress = walletState.petra.address;

  const APTOS_COIN = "0x1::aptos_coin::AptosCoin";
  const COIN_STORE = `0x1::coin::CoinStore<${APTOS_COIN}>`;
  const ALICE_INITIAL_BALANCE = 100_000_000;
  const BOB_INITIAL_BALANCE = 100;
  const TRANSFER_AMOUNT = 100;
  const APTOS_NETWORK =
    NetworkToNetworkName[process.env.APTOS_NETWORK] || Network.DEVNET;

  const config = new AptosConfig({ network: APTOS_NETWORK });
  const aptos = new Aptos(config);

  const alice = Account.generate();
  const bob = Account.generate();

  const balance = async (sdk, name, address) => {
    let balance = await sdk.getAccountResource({
      accountAddress: address,
      resourceType: COIN_STORE,
    });

    let amount = Number(balance.coin.value);

    console.log(`${name}'s balance is: ${amount}`);
    return amount;
  };

  const initAliceAccount = async () => {
    await aptos.fundAccount({
      accountAddress: alice.accountAddress,
      amount: ALICE_INITIAL_BALANCE,
    });

    await aptos.fundAccount({
      accountAddress: bob.accountAddress,
      amount: BOB_INITIAL_BALANCE,
    });

    await balance(aptos, "Alice", alice.accountAddress);
    await balance(aptos, "Bob", bob.accountAddress);

    // Transfer between users
    // const txn = await aptos.transaction.build.simple({
    //   sender: alice.accountAddress,
    //   data: {
    //     function: "0x1::coin::transfer",
    //     typeArguments: [parseTypeTag(APTOS_COIN)],
    //     functionArguments: [
    //       AccountAddress.from(bob.accountAddress),
    //       new U64(TRANSFER_AMOUNT),
    //     ],
    //   },
    // });

    // console.log("\n=== Transfer transaction ===\n");
    // let committedTxn = await aptos.signAndSubmitTransaction({
    //   signer: alice,
    //   transaction: txn,
    // });
    // console.log(`Committed transaction: ${committedTxn.hash}`);
    // await aptos.waitForTransaction({ transactionHash: committedTxn.hash });

    // console.log("\n=== Balances after transfer ===\n");
    // await balance(aptos, "Alice", alice.accountAddress);
    // await balance(aptos, "Bob", bob.accountAddress);
  };

  // useEffect(() => {
  //   initAliceAccount();
  //   // to derive an account with a Single Sender Ed25519 key scheme
  //   const privateKey = new Ed25519PrivateKey(
  //     "0xbf0ca24ae7f35be68564b394678bd563ec1412168c86dd35ff3f302f41a0e165"
  //   );
  //   const accountAddress = AccountAddress.from(petraAddress);
  //   const account = Account.fromPrivateKey({
  //     privateKey,
  //     address: accountAddress,
  //     legacy: false,
  //   });
  //   console.log("account", account);
  // }, []);

  return (
    <>
      <Row>
        <Col>
          <h1 className="font-xlarge gradient-text-one">Faucet</h1>
        </Col>
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
