import React from "react";
import { Paper } from "@material-ui/core";
import useStyles from "../styles/homepageDesign.jsx";
function Market(props) {
  const classes = useStyles();
  return (
    <div
      onClick={() => {
        console.log("ok");
      }}
      style={{
        cursor: "pointer",
      }}
    >
      <Paper className={classes.markets}>
        <div className={classes.marketRow}>
          <img
            src={props.marketDetails.image}
            alt="market"
            className={classes.image}
          />
          {props.marketDetails.name}
        </div>
        <div className={classes.marketBottomRow}>
          <div className={classes.marketBottomColumn}>
            Volume
            <Paper className={classes.price}>
              {`${props.marketDetails.volume}`}
            </Paper>
          </div>
          <div className={classes.marketBottomColumn}>
            Yes
            <Paper className={classes.price}>
              {`$${props.marketDetails.yes}`}
            </Paper>
          </div>
          <div className={classes.marketBottomColumn}>
            No
            <Paper className={classes.price}>
              {`$${props.marketDetails.no}`}
            </Paper>
          </div>
        </div>
      </Paper>
    </div>
  );
}

export default Market;
