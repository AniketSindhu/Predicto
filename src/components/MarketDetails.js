import React from "react";
import { Paper } from "@material-ui/core";
import useStyles2 from "../styles/marketDetails.jsx";

function MarketDetails(props) {
  const classes = useStyles2();
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
    </div>
  );
}

export default MarketDetails;
