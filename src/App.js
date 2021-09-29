import { AppBar, Toolbar, Typography } from "@material-ui/core";
import React, { useState } from "react";
import "./App.css";
import useStyles from "./styles/homepageDesign.jsx";
import Markets from "./components/Markets";
import { Switch, Route, Link } from "react-router-dom";
import MarketDetails from "./components/MarketDetails";
import DisconnectButton from "./components/DisconnectButton";
import ConnectButton from "./components/ConnectButton";
import { TezosToolkit } from "@taquito/taquito";

function App() {
  const classes = useStyles();
  const [Tezos, setTezos] = useState(
    new TezosToolkit("https://florencenet.smartpy.io")
  );
  const [wallet, setWallet] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [userBalance, setUserBalance] = useState(0);
  const [beaconConnection, setBeaconConnection] = useState(false);
  return (
    <div>
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <Link
            to={"/"}
            style={{
              textDecoration: "none",
              color: "white",
            }}
          >
            <Typography variant="h5" style={{ cursor: "pointer" }}>
              <b>Predicto</b>
            </Typography>
          </Link>
          {userAddress === "" && !beaconConnection ? (
            <ConnectButton
              Tezos={Tezos}
              setWallet={setWallet}
              setUserAddress={setUserAddress}
              setUserBalance={setUserBalance}
              setBeaconConnection={setBeaconConnection}
              wallet={wallet}
            />
          ) : (
            <DisconnectButton
              wallet={wallet}
              setUserAddress={setUserAddress}
              setUserBalance={setUserBalance}
              setWallet={setWallet}
              setTezos={setTezos}
              setBeaconConnection={setBeaconConnection}
              userBalance={userBalance}
              userAddress={userAddress}
            />
          )}
        </Toolbar>
      </AppBar>
      <Switch>
        <Route exact path="/">
          <div className="App">
            <Markets />
          </div>
        </Route>
        <Route
          path="/market/:id"
          render={({ match }) => <MarketDetails address={match.params.id} />}
        ></Route>
      </Switch>
    </div>
  );
}

export default App;
