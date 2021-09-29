import React, { useState, useEffect } from "react";
import {
  Paper,
  Tab,
  Tabs,
  Typography,
  InputBase,
  Button,
} from "@material-ui/core";
import useStyles2 from "../styles/marketDetails.jsx";
import { Line } from "react-chartjs-2";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";
import db from "../firebase";
import axios from "axios";
import BounceLoader from "react-spinners/BounceLoader";
import markets from "../data/dummyMarketData";

function MarketDetails({ address }) {
  const classes = useStyles2();
  const theme = createTheme({
    palette: {},
  });
  const [market, setMarket] = useState(null);
  const [marketDataContract, setMarketDataContract] = useState(null);
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  useEffect(() => {
    console.log(address);
    db.collection("markets")
      .doc(address)
      .get()
      .then((doc) => {
        setMarket(doc.data());
      });
    axios
      .get(`https://api.florencenet.tzkt.io/v1/contracts/${address}/storage/`)
      .then((response) => {
        setMarketDataContract(response.data);
      });
  }, [address]);
  if (marketDataContract && market) {
    return (
      <div className={classes.body}>
        <Paper className={classes.header} elevation={5}>
          <div className={classes.topRow}>
            <img
              className={classes.image}
              src={
                "https://www.statnews.com/wp-content/uploads/2020/02/Coronavirus-CDC-645x645.jpg"
              }
              alt="logo"
            />
            <h4 className={classes.questionText}>{market.question}</h4>
          </div>
          <div className={classes.marketBottomRow}>
            <div className={classes.marketBottomColumn}>
              Ends on
              <Paper className={classes.price}>{`${market.startDate
                .toDate()
                .toDateString()
                .slice(4)}`}</Paper>
            </div>
            <div className={classes.marketBottomColumn}>
              Volume
              <Paper className={classes.price}>{`500 Tez`}</Paper>
            </div>
            <div className={classes.marketBottomColumn}>
              Liquidity
              <Paper className={classes.price}>{`200 Tez`}</Paper>
            </div>
          </div>
        </Paper>
        <div className={classes.row}>
          <Paper className={classes.chart}>
            <Line data={markets[0].data} options={markets[0].options} />
          </Paper>
          <Paper className={classes.rightSection}>
            <MuiThemeProvider theme={theme}>
              <Tabs
                value={value}
                onChange={handleChange}
                TabIndicatorProps={{
                  style: {
                    backgroundColor: "#F48FB1",
                    color: "white",
                  },
                }}
                className={classes.tabs}
                centered
              >
                <Tab label="Buy" />
                <Tab label="Sell" />
              </Tabs>
            </MuiThemeProvider>
            {value === 0 && (
              <div className={classes.tabContent}>
                <Typography variant={"body1"} className={classes.text}>
                  Pick outcome
                </Typography>
                <div className={classes.outcomes}>
                  <Paper className={classes.yes}>
                    Yes ${marketDataContract.yesPrice / 1000}
                  </Paper>
                  <Paper className={classes.no}>
                    No ${marketDataContract.noPrice / 1000}
                  </Paper>
                </div>
                <Typography variant={"body1"} className={classes.text}>
                  How much?
                </Typography>
                <div className={classes.rowInput}>
                  <InputBase
                    className={classes.input}
                    placeholder="0"
                    variant="filled"
                  ></InputBase>
                  <Typography variant={"body1"} className={classes.usdText}>
                    Tez
                  </Typography>
                </div>
                <div className={classes.rowBottom}>
                  <Typography
                    variant={"body1"}
                    className={classes.bottomtextLeft}
                  >
                    LP Fee
                  </Typography>
                  <Typography variant={"h6"} className={classes.bottomText}>
                    3%
                  </Typography>
                </div>
                <div className={classes.rowBottom}>
                  <Typography
                    variant={"body1"}
                    className={classes.bottomtextLeft}
                  >
                    Your Avg. Price
                  </Typography>
                  <Typography variant={"h6"} className={classes.bottomText}>
                    $3.40
                  </Typography>
                </div>
                <div className={classes.rowBottom}>
                  <Typography
                    variant={"body1"}
                    className={classes.bottomtextLeft}
                  >
                    Estimated Shares Bought
                  </Typography>
                  <Typography variant={"h6"} className={classes.bottomText}>
                    14
                  </Typography>
                </div>
                <div className={classes.rowBottom}>
                  <Typography
                    variant={"body1"}
                    className={classes.bottomtextLeft}
                  >
                    Max Return
                  </Typography>
                  <Typography variant={"h6"} className={classes.bottomText}>
                    21%
                  </Typography>
                </div>
                <div className={classes.buttonDiv}>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    fullWidth={true}
                  >
                    Buy
                  </Button>
                </div>
              </div>
            )}
            {value === 1 && (
              <div className={classes.tabContent}>
                <Typography variant={"body1"} className={classes.text}>
                  Pick outcome
                </Typography>
                <div className={classes.outcomes}>
                  <Paper className={classes.yes}>
                    Yes ${marketDataContract.yesPrice / 1000}
                  </Paper>
                  <Paper className={classes.no}>
                    No ${marketDataContract.noPrice / 1000}
                  </Paper>
                </div>
                <Typography variant={"body1"} className={classes.text}>
                  How much?
                </Typography>
                <div className={classes.rowInput}>
                  <InputBase
                    className={classes.input}
                    placeholder="0"
                    variant="filled"
                  ></InputBase>
                  <Typography variant={"body1"} className={classes.usdText}>
                    Shares
                  </Typography>
                </div>
                <div className={classes.rowBottom}>
                  <Typography
                    variant={"body1"}
                    className={classes.bottomtextLeft}
                  >
                    Your Avg. Price
                  </Typography>
                  <Typography variant={"h6"} className={classes.bottomText}>
                    $3.40
                  </Typography>
                </div>
                <div className={classes.rowBottom}>
                  <Typography
                    variant={"body1"}
                    className={classes.bottomtextLeft}
                  >
                    Remaining Shares
                  </Typography>
                  <Typography variant={"h6"} className={classes.bottomText}>
                    14
                  </Typography>
                </div>
                <div className={classes.rowBottom}>
                  <Typography
                    variant={"body1"}
                    className={classes.bottomtextLeft}
                  >
                    You'll recieve
                  </Typography>
                  <Typography variant={"h6"} className={classes.bottomText}>
                    $25.00
                  </Typography>
                </div>
                <div className={classes.buttonDiv}>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    fullWidth={true}
                  >
                    Sell
                  </Button>
                </div>
              </div>
            )}
          </Paper>
        </div>
      </div>
    );
  } else {
    return (
      <div>
        <div className={classes.loading}>
          <BounceLoader color="#9282EC" loading={true} size={100} />
          <div style={{ height: "15px" }}></div>
          <Typography
            variant="subtitle2"
            style={{
              margin: "10px 40px 10px 40px",
              cursor: "pointer",
              color: "white",
              fontWeight: "600",
            }}
          >
            Loading.....
          </Typography>
        </div>
      </div>
    );
  }
}

export default MarketDetails;
