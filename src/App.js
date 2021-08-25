import {
  AppBar,
  Button,
  Toolbar,
  Typography,
  Paper,
  InputBase,
  Grid,
} from "@material-ui/core";
import { Search } from "@material-ui/icons";
import "./App.css";
import useStyles from "./styles/homepageDesign.jsx";
import markets from "./data/dummyMarketData";
import Market from "./components/Market";

function App() {
  const classes = useStyles();
  return (
    <div>
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <Typography variant="h5">
            <b>Predicto</b>
          </Typography>
          <Button variant="outlined" className={classes.ConnectWallet}>
            Connect Wallet
          </Button>
        </Toolbar>
      </AppBar>
      <div className="App">
        <div className={classes.centerRow}>
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
        </div>
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
          Popular Markets
        </Typography>
        <Grid container spacing={4}>
          {markets.map((market, index) => (
            <Grid item xs={12} sm={6} lg={4} xl={4} key={index}>
              <Market marketDetails={market} />
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
}

export default App;
