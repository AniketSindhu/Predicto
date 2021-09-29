import React, { useState, useEffect } from "react";
import { Paper } from "@material-ui/core";
import useStyles from "../styles/homepageDesign.jsx";
import { Link } from "react-router-dom";
import axios from "axios";
function Market({ marketData }) {
  const classes = useStyles();
  const [marketDataContract, setMarketDataContract] = useState(null);

  useEffect(() => {
    axios
      .get(
        `https://api.florencenet.tzkt.io/v1/contracts/${marketData.contractAddress}/storage/`
      )
      .then((response) => {
        setMarketDataContract(response.data);
      });
  }, [marketData.contractAddress]);
  return (
    <div
      style={{
        cursor: "pointer",
      }}
    >
      <Link
        to={`/market/${marketData.contractAddress}`}
        style={{ textDecoration: "none" }}
      >
        <Paper className={classes.markets}>
          <div className={classes.marketRow}>
            <img
              src={
                "https://www.statnews.com/wp-content/uploads/2020/02/Coronavirus-CDC-645x645.jpg"
              }
              alt="market"
              className={classes.image}
            />
            {marketData.question}
          </div>
          <div className={classes.marketBottomRow}>
            <div className={classes.marketBottomColumn}>
              Ends on
              <Paper className={classes.price}>{`${marketData.startDate
                .toDate()
                .toDateString()
                .slice(4)}`}</Paper>
            </div>
            {marketDataContract ? (
              <>
                <div className={classes.marketBottomColumn}>
                  Yes
                  <Paper className={classes.price}>{`${
                    marketDataContract.yesPrice / 1000
                  } Tez`}</Paper>
                </div>
                <div className={classes.marketBottomColumn}>
                  No
                  <Paper className={classes.price}>{`${
                    marketDataContract.noPrice / 1000
                  } Tez`}</Paper>
                </div>
              </>
            ) : (
              <div>Getting Price....</div>
            )}
          </div>
        </Paper>
      </Link>
    </div>
  );
}

export default Market;
