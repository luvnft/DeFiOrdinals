import { Spin } from "antd";
import { useSelector } from "react-redux";
import Aptos from "../../assets/wallet-logo/aptos_logo.png";

const LoadingWrapper = ({ children }) => {
  const loading = useSelector((state) => state.constant.isLoading);
  return (
    <Spin
      style={{ zIndex: 2 }}
      indicator={
        <img
          className="image"
          src={Aptos}
          alt=""
          width="60%"
          height="60%"
        ></img>
      }
      spinning={loading}
    >
      {children}
    </Spin>
  );
};

export default LoadingWrapper;
