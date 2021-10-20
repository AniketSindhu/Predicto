import React, { useState, useEffect } from "react";
import db from "../firebase";
import useStyles from "../styles/homepageDesign.jsx";
import Market from "./Market";
import { Typography, Grid, Paper, InputBase } from "@material-ui/core";
import BounceLoader from "react-spinners/BounceLoader";
import { Search } from "@material-ui/icons";
function Markets() {
  const classes = useStyles();
  const [markets, setMarkets] = useState([]);
  useEffect(() => {
    console.log("Hi");
    db.collection("markets")
    .onSnapshot((snapshot) =>
      setMarkets(snapshot.docs.map((doc) => doc.data()))
    );
  }, []);
  return (
    <div>
      {/*       <div className={classes.centerRow}>
        <Paper className={classes.dashBoard} variant="outlined" elevation={3}>
          <div className={classes.columnDashoard}>
            <Typography variant="h6">Portfolio Value</Typography>
            <Typography variant="h4">$0.00</Typography>
          </div>
          <div className={classes.columnDashoard}>
            <Typography variant="h6">Open Positions</Typography>
            <Typography variant="h4">$0.00</Typography>
          </div>
          <div className={classes.columnDashoard}>
            <Typography variant="h6">Cash</Typography>
            <Typography variant="h4">$0.00</Typography>
          </div>
        </Paper>
      </div> */}
      <div style={{ marginTop: "20px" }} />
      <div className={classes.centerRow}>
        <div className={classes.TextFieldWhole}>
          <Search style={{ color: "White" }} />
          <InputBase
            className={classes.TextField}
            placeholder="Search markets..."
            variant="filled"
          ></InputBase>
        </div>
      </div>

      <Typography variant="h6" className={classes.popularMarketText}>
        Live Markets
      </Typography>
      {markets.length !== 0 ? (
        <Grid container spacing={4}>
          {markets.map((market, index) => (
            <Grid item xs={12} sm={6} lg={4} xl={4} key={index}>
              <Market marketData={market} />
            </Grid>
          ))}
        </Grid>
      ) : (
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
      )}
    </div>
  );
}

export default Markets;
