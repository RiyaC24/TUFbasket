import React from "react";
import { Carousel } from "antd";
import accountImg from "../assets/account.jpg"; // adjust path as needed
import banner1 from "../assets/banner-1.webp"; // adjust path as needed
import banner2 from "../assets/banner-2.webp"; // adjust path as needed

const contentStyle = {
  margin: 0,
  height: "80vh",
  width: "100%",
  objectFit: "cover",
  color: "#fff",
  lineHeight: "160px",
  textAlign: "center",
  background: "#364d79",
};
const App = () => {

  return (
    <Carousel autoplay>
      <div>
        <img
          style={contentStyle}
          src={accountImg}
          alt="Account"
          //   style={{ width: "100%", height: "50vh", objectFit: "cover" }}
        />
      </div>
      <div>
        <img
          style={contentStyle}
          src={banner1}
          alt="Account"
          //   style={{ width: "100%", height: "50vh", objectFit: "cover" }}
        />
      </div>
      <div>
        <img
          style={contentStyle}
          src={banner2}
          alt="Account"
            // style={{ width: "100%", height: "50vh", objectFit: "cover" }}
        />
      </div>
    </Carousel>
  );
};
export default App;
