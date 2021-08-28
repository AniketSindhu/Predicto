import React from "react";
import { Paper, Tab, Tabs, Typography } from "@material-ui/core";
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
              textColor=""
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
            <div className={classes.tabContent1}>
              <Typography variant={"h7"} className={classes.pickOutcome}>
                Pick outcome
              </Typography>
              <div className={classes.outcomes}>
                <Paper className={classes.yes}>Yes $0.64</Paper>
                <Paper className={classes.no}>No $0.36</Paper>
              </div>
            </div>
          )}
          {value === 1 && (
            <div className={classes.tabContent1}>
              <Typography>HI 2</Typography>
            </div>
          )}
        </Paper>
      </div>
    </div>
  );
}

export default MarketDetails;
