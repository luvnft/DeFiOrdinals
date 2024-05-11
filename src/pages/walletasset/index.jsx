import { Col, Grid, Row, Skeleton, Typography } from "antd";
import Title from "antd/es/typography/Title";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import CardDisplay from "../../component/card";
import { propsContainer } from "../../container/props-container";
import { setLoading } from "../../redux/slice/constant";

const WalletAddress = (props) => {
  const { dispatch } = props.redux;
  const { address } = props.router.params;
  const { Text } = Typography;
  const { useBreakpoint } = Grid;
  const breakPoint = useBreakpoint();
  const [assetData, setAssetData] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  if (assetData.length !== 0) {
    assetData.sort((a, b) => {
      return a.inscriptionNumber - b.inscriptionNumber;
    });
  }

  useEffect(() => {
    (async () => {
      try {
        if (address) {
          try {
            const result = await axios({
              url: `${process.env.REACT_APP_ASSET_SERVER}/api/v1/fetch/assets/${address}`,
            });

            if (result.data.data.length) {
              const filteredData = result.data.data.filter(
                (asset) =>
                  asset.mimeType === "text/html" ||
                  asset.mimeType === "image/webp" ||
                  asset.mimeType === "image/jpeg" ||
                  asset.mimeType === "image/png"
              );
              const isFromApprovedAssets = filteredData.map(async (asset) => {
                return new Promise(async (resolve, reject) => {
                  const result = await axios.get(
                    `${process.env.REACT_APP_ASSET_SERVER}/api/v1/fetch/asset/${asset.id}`
                  );
                  resolve({
                    ...result.data,
                    ...asset,
                  });
                });
              });
              const revealedPromise = await Promise.all(isFromApprovedAssets);
              const finalAssets = revealedPromise.filter(
                (asset) => asset.success
              );
              const fetchCollectionDetails = finalAssets.map(async (asset) => {
                return new Promise(async (resolve, reject) => {
                  const result = await axios.get(
                    `${process.env.REACT_APP_ASSET_SERVER}/api/v1/fetch/collection/${asset.data.collectionName}`
                  );

                  resolve({
                    ...result.data.data,
                    ...asset,
                  });
                });
              });
              const finalPromise = await Promise.all(fetchCollectionDetails);
              setAssetData(finalPromise);
            }
            dispatch(setLoading(false));
          } catch (error) {
            dispatch(setLoading(false));
          }
        }
      } catch (error) {
        console.log("error", error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Row justify={""} align={"middle"}>
        <Col>
          <Title level={2} className="gradient-text-one">
            Wallet Assets
          </Title>
        </Col>
      </Row>

      <Row className="m-top-bottom" justify={"start"} gutter={18}>
        {assetData?.length !== 0 ? (
          <>
            {assetData.map((card) => {
              const url = `${process.env.REACT_APP_ORDINALS_CONTENT_API}/content/${card.id}`;

              return (
                <>
                  <Col key={`${card.id}`} xs={24} sm={12} md={12} lg={8} xl={6}>
                    <Skeleton loading={!card.id} active>
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
                        onClick={() => {}}
                        hoverable={true}
                        bordered={false}
                        className={
                          "card-bg dashboard-card-padding m-top-bottom cardrelative dashboard-cards"
                        }
                      >
                        <Row justify={"space-between"}>
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
                      </CardDisplay>
                    </Skeleton>
                  </Col>
                </>
              );
            })}
          </>
        ) : (
          <Col>
            <Row justify={"center"}>
              <MdOutlineCancel color="#6a85f1" size={50} />
            </Row>
            <Row justify={"center"}>
              <Text
                className={`${
                  breakPoint.xs ? "font-medium" : "font-large"
                } text-color-one value-one letter-spacing-medium`}
              >
                No Assets Available
              </Text>
            </Row>
          </Col>
        )}
      </Row>
    </>
  );
};
export default propsContainer(WalletAddress);
