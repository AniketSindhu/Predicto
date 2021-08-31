import React from "react";
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
import { useState } from "react";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";

function MarketDetails(props) {
  const classes = useStyles2();
  const theme = createTheme({
    palette: {},
  });
  const [value, setValue] = useState(0);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <div className={classes.body}>
      <Paper className={classes.header} elevation={5}>
        <div className={classes.topRow}>
          <img className={classes.image} src={props.market.image} alt="logo" />
          <h4 className={classes.questionText}>{props.market.name}</h4>
        </div>
        <div className={classes.marketBottomRow}>
          <div className={classes.marketBottomColumn}>
            Ends on
            <Paper className={classes.price}>{`${props.market.date}`}</Paper>
          </div>
          <div className={classes.marketBottomColumn}>
            Volume
            <Paper className={classes.price}>{`${props.market.volume}`}</Paper>
          </div>
          <div className={classes.marketBottomColumn}>
            Liquidity
            <Paper
              className={classes.price}
            >{`${props.market.liquidity}`}</Paper>
          </div>
        </div>
      </Paper>
      <div className={classes.row}>
        <Paper className={classes.chart}>
          <Line data={props.market.data} options={props.market.options} />
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
                <Paper className={classes.yes}>Yes $0.64</Paper>
                <Paper className={classes.no}>No $0.36</Paper>
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
                  USDtz
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
                <Paper className={classes.yes}>Yes $0.64</Paper>
                <Paper className={classes.no}>No $0.36</Paper>
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
}

export default MarketDetails;
