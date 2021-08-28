import React from "react";
import { Paper } from "@material-ui/core";
import useStyles from "../styles/homepageDesign.jsx";
import { Link } from "react-router-dom";
function Market(props) {
  const classes = useStyles();
  return (
    <div
      style={{
        cursor: "pointer",
      }}
    >
      <Link
        to={`/market/${props.marketDetails.id}`}
        style={{ textDecoration: "none" }}
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
      </Link>
    </div>
  );
}

export default Market;
