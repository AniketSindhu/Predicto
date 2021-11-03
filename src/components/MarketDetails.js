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
import { Doughnut } from "react-chartjs-2";
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";
import db from "../firebase";
import axios from "axios";
import BounceLoader from "react-spinners/BounceLoader";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * @param {{Tezos: TezosToolkit}}
 */
function MarketDetails({
  Tezos,
  address,
  balance,
  userAddress,
  updateBalance,
}) {
  const classes = useStyles2();
  const theme = createTheme({
    palette: {},
  });
  const [market, setMarket] = useState(null);
  const [outcomeBalance, setOutcomeBalance] = useState({
    yes: 0,
    no: 0,
  });
  const { quadSolver } = require("quadratic-solver");
  const [marketDataContract, setMarketDataContract] = useState(null);
  const [value, setValue] = useState(0);
  const [outcome, setOutcome] = useState(0);
  const [howMuch, setHowMuch] = useState("");
  const [estShare, setEstShare] = useState(0);
  const [potentialProfit, setPotentialProfit] = useState(0);
  const [loading, setLoading] = useState(false);
  const [buyingPrice, setBuyingPrice] = useState(0);
  const [loadingText, setLoadingText] = useState("Loading");
  const [liquidityBalance, setLiquidityBalance] = useState(0);
  const [noTokensGet, setNoTokensGet] = useState(0);
  const [yesTokensGet, setYesTokensGet] = useState(0);

  const getBalances = async () => {
    axios
      .get(
        `https://api.granadanet.tzkt.io/v1/contracts/${address}/bigmaps/balances/keys/${userAddress}`
      )
      .then((response) => {
        if (response.data) {
          setOutcomeBalance(response.data.value);
        } else {
          setOutcomeBalance({
            yes: 0,
            no: 0,
          });
        }
      })
      .catch((err) => {
        setOutcomeBalance({
          yes: 0,
          no: 0,
        });
      });
    axios
      .get(
        `https://api.granadanet.tzkt.io/v1/contracts/${address}/bigmaps/liquidityBalance/keys/${userAddress}`
      )
      .then((response) => {
        if (response.data) {
          setLiquidityBalance(response.data.value);
        } else {
          setLiquidityBalance(0);
        }
      })
      .catch((err) => {
        setLiquidityBalance(0);
      });
  };
  const handleChangeLiquidityRemove = (event) => {
    event.preventDefault();
    setHowMuch(parseFloat(event.target.value));
    var howMuchNow1 = parseFloat(event.target.value);
    var factor =
      parseFloat(marketDataContract.totalLiquidityShares * 1000) /
      (howMuchNow1 * 1000000);
    if (
      parseFloat(marketDataContract.yesPool) >
      parseFloat(marketDataContract.noPool)
    ) {
      var tezToSend = parseFloat(marketDataContract.noPool * 1000) / factor;
      var yesToSend =
        parseFloat(marketDataContract.yesPool * 1000) / factor - tezToSend;
      setYesTokensGet(yesToSend);
      setEstShare(tezToSend);
      setNoTokensGet(0);
    } else if (
      parseFloat(marketDataContract.noPool) >
      parseFloat(marketDataContract.yesPool)
    ) {
      var tezToSend1 = parseFloat(marketDataContract.yesPool * 1000) / factor;
      var noToSend =
        parseFloat(marketDataContract.noPool * 1000) / factor - tezToSend1;
      setYesTokensGet(0);
      setEstShare(tezToSend1);
      setNoTokensGet(noToSend);
    } else {
      setNoTokensGet(0);
      setYesTokensGet(0);
      setEstShare(howMuchNow1 * 1000000);
    }
  };

  const handleChangeLiquidityAdd = (event) => {
    event.preventDefault();
    setHowMuch(parseFloat(event.target.value));
    var howMuchNow1 = parseFloat(event.target.value);
    if (
      parseFloat(marketDataContract.yesPool) >
      parseFloat(marketDataContract.noPool)
    ) {
      var ratio =
        parseFloat(marketDataContract.yesPool) /
        parseFloat(marketDataContract.noPool);
      var noTokens = howMuchNow1 - howMuchNow1 / ratio;
      setNoTokensGet(noTokens * 1000000);
      setYesTokensGet(0);
      var yesPerShare =
        (parseFloat(marketDataContract.yesPool) * 1000) /
        parseFloat(marketDataContract.totalLiquidityShares);
      var sharePurchased = (howMuchNow1 * 1000 * 1000000) / yesPerShare;
      setEstShare(sharePurchased);
    } else if (
      parseFloat(marketDataContract.noPool) >
      parseFloat(marketDataContract.yesPool)
    ) {
      var ratio1 =
        parseFloat(marketDataContract.noPool) /
        parseFloat(marketDataContract.yesPool);
      var yesTokens = howMuchNow1 - howMuchNow1 / ratio1;
      setYesTokensGet(yesTokens * 1000000);
      setNoTokensGet(0);
      var noPerShare =
        (parseFloat(marketDataContract.noPool) * 1000) /
        parseFloat(marketDataContract.totalLiquidityShares);
      var sharePurchased1 = (howMuchNow1 * 1000 * 1000000) / noPerShare;
      setEstShare(sharePurchased1);
    } else {
      setNoTokensGet(0);
      setYesTokensGet(0);
      setEstShare(howMuchNow1 * 1000000);
    }
  };

  const handleChangeHowMuchBuy = (event) => {
    setHowMuch(event.target.value);
    if (outcome === 0) {
      setEstShare(howMuch);
      var howMuchNow = parseFloat(event.target.value);
      var noPool = marketDataContract.noPool / 1000000;
      var noPoolnew = noPool + howMuchNow;
      var yesPoolOld = marketDataContract.yesPool / 1000000;
      var yesPoolTemp = yesPoolOld + howMuchNow;
      var yesPool = marketDataContract.invariant / (1000000000000 * noPoolnew);
      /*       console.log(
        "noPoolnew",
        noPoolnew,
        "yesPoolTemp:",
        yesPoolTemp,
        "yesPool:",
        yesPool
      ); */
      setEstShare(yesPoolTemp - yesPool);
      setBuyingPrice(parseFloat(howMuchNow / (yesPoolTemp - yesPool)));
      var potential = yesPoolTemp - yesPool - howMuchNow;
      setPotentialProfit(potential);
      //console.log("estShare:", estShare);
    } else {
      setEstShare(howMuch);
      var howMuchNow1 = parseFloat(event.target.value);
      var yesPool1 = marketDataContract.yesPool / 1000000;
      var yesPoolnew = yesPool1 + howMuchNow1;
      var noPoolOld = marketDataContract.noPool / 1000000;
      var noPoolTemp = noPoolOld + howMuchNow1;
      var noPool1 = marketDataContract.invariant / (1000000000000 * yesPoolnew);
      setEstShare(noPoolTemp - noPool1);
      setBuyingPrice(parseFloat(howMuchNow1 / (noPoolTemp - noPool1)));
      var potential1 = noPoolTemp - noPool1 - howMuchNow1;
      setPotentialProfit(potential1);
    }
  };

  const handleChangeHowMuchSell = (event) => {
    setHowMuch(event.target.value);
    var howMuchNow = parseFloat(event.target.value) * 1000000;
    if (outcome === 0) {
      var c =
        parseFloat(marketDataContract.yesPool) *
          (parseFloat(marketDataContract.noPool) - howMuchNow) -
        parseFloat(marketDataContract.invariant);
      var b =
        parseFloat(marketDataContract.noPool) +
        parseFloat(marketDataContract.yesPool) -
        howMuchNow;
      const rootsArr = quadSolver(1, b, c);
      if (rootsArr[0] < 0 || rootsArr[0] > howMuchNow) {
        setEstShare(howMuchNow - rootsArr[1]);
      } else {
        setEstShare(howMuchNow - rootsArr[0]);
      }
    } else {
      var c1 =
        parseFloat(marketDataContract.noPool) *
          (parseFloat(marketDataContract.yesPool) - howMuchNow) -
        parseFloat(marketDataContract.invariant);
      var b1 =
        parseFloat(marketDataContract.yesPool) +
        parseFloat(marketDataContract.noPool) -
        howMuchNow;
      const rootsArr1 = quadSolver(1, b1, c1);
      if (rootsArr1[0] < 0 || rootsArr1[0] > howMuchNow) {
        setEstShare(howMuchNow - rootsArr1[1]);
      } else {
        setEstShare(howMuchNow - rootsArr1[0]);
      }
    }
  };

  const handleChangeTabs = (event, newValue) => {
    setValue(newValue);
    setHowMuch("");
    setBuyingPrice(0);
    setEstShare(0);
    setPotentialProfit(0);
  };

  const handleChangeOutcome = (event, outcome) => {
    if (outcome !== null) {
      setOutcome(outcome);
      setHowMuch("");
      setBuyingPrice(0);
      setEstShare(0);
      setPotentialProfit(0);
    }
  };

  const buy = (e) => {
    e.preventDefault();
    if (parseFloat(howMuch) > parseFloat(balance)) {
      toast.error("Insufficient balance", {
        position: "top-center",
        autoClose: 5000,
      });
      return;
    } else {
      setLoading(true);
      setLoadingText("Buying Now....");
      Tezos.wallet.at(address).then((contract) => {
        contract.methods
          .buy(outcome === 0)
          .send({ amount: parseFloat(howMuch), mutez: false })
          .then((op) => {
            console.log(`Hash: ${op.opHash}`);
            setLoadingText(`Waiting for confirmation`);
            return op.confirmation();
          })
          .then((result) => {
            console.log(result);
            if (result.completed) {
              setLoadingText(`Getting new Market Data`);
              axios
                .get(
                  `https://api.granadanet.tzkt.io/v1/contracts/${address}/storage/`
                )
                .then((response) => {
                  toast.success("🦄 Transaction successfull", {
                    position: "top-center",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
                  updateBalance();
                  getBalances();
                  setMarketDataContract(response.data);
                  setLoading(false);
                  setLoadingText("");
                  setHowMuch("");
                  setBuyingPrice(0);
                  setEstShare(0);
                  setPotentialProfit(0);
                });
            } else {
              console.log("An error has occurred");
              toast.error("Something went wrong", {
                position: "top-center",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
              setLoading(false);
              setLoadingText("");
            }
          })
          .catch((err) => {
            console.log(err);
            toast.error("Something went wrong", {
              position: "top-center",
              autoClose: 10000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            setLoading(false);
            setLoadingText("");
          });
      });
    }
  };

  const sell = (e) => {
    e.preventDefault();

    if (outcome === 0) {
      if (parseFloat(howMuch) > parseFloat(outcomeBalance.yes) / 1000000) {
        toast.error("Insufficient balance", {
          position: "top-center",
          autoClose: 5000,
        });
        return;
      }
    } else {
      if (parseFloat(howMuch) > parseFloat(outcomeBalance.no) / 1000000) {
        toast.error("Insufficient balance", {
          position: "top-center",
          autoClose: 5000,
        });
        return;
      }
    }
    setLoading(true);
    setLoadingText("Selling Now....");
    Tezos.wallet.at(address).then((contract) => {
      console.log(howMuch);
      contract.methods
        .sell(parseFloat(howMuch) * 1000000, outcome === 0)
        .send()
        .then((op) => {
          console.log(`Hash: ${op.opHash}`);
          setLoadingText(`Waiting for confirmation`);
          return op.confirmation();
        })
        .then((result) => {
          console.log(result);
          if (result.completed) {
            setLoadingText(`Getting new Market Data`);
            axios
              .get(
                `https://api.granadanet.tzkt.io/v1/contracts/${address}/storage/`
              )
              .then((response) => {
                toast.success("🦄 Transaction successfull", {
                  position: "top-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                });
                updateBalance();
                getBalances();
                setMarketDataContract(response.data);
                setLoading(false);
                setLoadingText("");
                setHowMuch("");
                setBuyingPrice(0);
                setEstShare(0);
                setPotentialProfit(0);
              });
          } else {
            console.log("An error has occurred");
            toast.error("Something went wrong", {
              position: "top-center",
              autoClose: 10000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            setLoading(false);
            setLoadingText("");
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error("Something went wrong", {
            position: "top-center",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          setLoading(false);
          setLoadingText("");
        });
    });
  };
  const claim = (e) => {
    e.preventDefault();
    if (market.result ? outcomeBalance.yes <= 0 : outcomeBalance.no <= 0) {
      toast.error("Nothing to claim", {
        position: "top-center",
        autoClose: 5000,
      });
      return;
    } else {
      setLoading(true);
      setLoadingText("Claiming Shares Now....");
      Tezos.wallet.at(address).then((contract) => {
        contract.methods
          .claimShares([["unit"]])
          .send()
          .then((op) => {
            console.log(`Hash: ${op.opHash}`);
            setLoadingText(`Waiting for confirmation`);
            return op.confirmation();
          })
          .then((result) => {
            console.log(result);
            if (result.completed) {
              setLoadingText(`Getting new Market Data`);
              axios
                .get(
                  `https://api.granadanet.tzkt.io/v1/contracts/${address}/storage/`
                )
                .then((response) => {
                  toast.success("🦄 Transaction successfull", {
                    position: "top-center",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
                  updateBalance();
                  getBalances();
                  setMarketDataContract(response.data);
                  setLoading(false);
                  setLoadingText("");
                  setHowMuch("");
                  setBuyingPrice(0);
                  setEstShare(0);
                  setPotentialProfit(0);
                });
            } else {
              console.log("An error has occurred");
              toast.error("Something went wrong", {
                position: "top-center",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
              setLoading(false);
              setLoadingText("");
            }
          })
          .catch((err) => {
            console.log(err);
            toast.error("Something went wrong", {
              position: "top-center",
              autoClose: 10000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            setLoading(false);
            setLoadingText("");
          });
      });
    }
  };
  const addLiquidity = (e) => {
    e.preventDefault();
    if (parseFloat(howMuch) > parseFloat(balance / 1000000)) {
      toast.error("Insufficient balance", {
        position: "top-center",
        autoClose: 5000,
      });
      return;
    } else {
      setLoading(true);
      setLoadingText("Adding Liquidity....");
      Tezos.wallet.at(address).then((contract) => {
        contract.methods
          .addLiquidity([["unit"]])
          .send({ amount: parseFloat(howMuch), mutez: false })
          .then((op) => {
            console.log(`Hash: ${op.opHash}`);
            setLoadingText(`Waiting for confirmation`);
            return op.confirmation();
          })
          .then((result) => {
            console.log(result);
            if (result.completed) {
              setLoadingText(`Getting new Market Data`);
              axios
                .get(
                  `https://api.granadanet.tzkt.io/v1/contracts/${address}/storage/`
                )
                .then((response) => {
                  toast.success("🦄 Transaction successfull", {
                    position: "top-center",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
                  updateBalance();
                  getBalances();
                  setMarketDataContract(response.data);
                  setLoading(false);
                  setLoadingText("");
                  setHowMuch(0);
                  setEstShare(0);
                  setNoTokensGet(0);
                  setYesTokensGet(0);
                });
            } else {
              console.log("An error has occurred");
              toast.error("Something went wrong", {
                position: "top-center",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
              setLoading(false);
              setLoadingText("");
            }
          })
          .catch((err) => {
            console.log(err);
            toast.error("Something went wrong", {
              position: "top-center",
              autoClose: 10000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            setLoading(false);
            setLoadingText("");
          });
      });
    }
  };

  const removeLiquidity = (e) => {
    e.preventDefault();
    if (parseFloat(howMuch) > parseFloat(liquidityBalance / 1000000)) {
      toast.error("Insufficient balance", {
        position: "top-center",
        autoClose: 5000,
      });
      return;
    } else {
      setLoading(true);
      setLoadingText("Removing Liquidity....");
      Tezos.wallet.at(address).then((contract) => {
        contract.methods
          .removeLiquidity(parseFloat(howMuch) * 1000000)
          .send()
          .then((op) => {
            console.log(`Hash: ${op.opHash}`);
            setLoadingText(`Waiting for confirmation`);
            return op.confirmation();
          })
          .then((result) => {
            console.log(result);
            if (result.completed) {
              setLoadingText(`Getting new Market Data`);
              axios
                .get(
                  `https://api.granadanet.tzkt.io/v1/contracts/${address}/storage/`
                )
                .then((response) => {
                  toast.success("🦄 Transaction successfull", {
                    position: "top-center",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
                  updateBalance();
                  getBalances();
                  setMarketDataContract(response.data);
                  setLoading(false);
                  setLoadingText("");
                  setHowMuch(0);
                  setEstShare(0);
                  setNoTokensGet(0);
                  setYesTokensGet(0);
                });
            } else {
              console.log("An error has occurred");
              toast.error("Something went wrong", {
                position: "top-center",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
              setLoading(false);
              setLoadingText("");
            }
          })
          .catch((err) => {
            console.log(err);
            toast.error("Something went wrong", {
              position: "top-center",
              autoClose: 10000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            setLoading(false);
            setLoadingText("");
          });
      });
    }
  };

  useEffect(() => {
    console.log(address);
    if (userAddress && userAddress !== "") {
      db.collection("markets")
        .doc(address)
        .get()
        .then((doc) => {
          setMarket(doc.data());
        });
      axios
        .get(`https://api.granadanet.tzkt.io/v1/contracts/${address}/storage/`)
        .then((response) => {
          setMarketDataContract(response.data);
        });
      axios
        .get(
          `https://api.granadanet.tzkt.io/v1/contracts/${address}/bigmaps/balances/keys/${userAddress}`
        )
        .then((response) => {
          if (response.data) {
            setOutcomeBalance(response.data.value);
          } else {
            setOutcomeBalance({
              yes: 0,
              no: 0,
            });
          }
        })
        .catch((err) => {
          setOutcomeBalance({
            yes: 0,
            no: 0,
          });
        });
      axios
        .get(
          `https://api.granadanet.tzkt.io/v1/contracts/${address}/bigmaps/liquidityBalance/keys/${userAddress}`
        )
        .then((response) => {
          if (response.data) {
            setLiquidityBalance(response.data.value);
          } else {
            setLiquidityBalance(0);
          }
        })
        .catch((err) => {
          setLiquidityBalance(0);
        });
    }
  }, [address, userAddress]);

  if (!userAddress || userAddress === "") {
    return (
      <h2
        style={{
          color: "white",
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%)`,
        }}
      >
        Connect your Wallet first
      </h2>
    );
  } else if (marketDataContract && market && loading === false) {
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
              Yes Balance
              <Paper className={classes.price}>
                {(parseFloat(outcomeBalance.yes) / 10 ** 6).toFixed(2)} Yes
              </Paper>
            </div>
            <div className={classes.marketBottomColumn}>
              No Balance
              <Paper className={classes.price}>
                {(parseFloat(outcomeBalance.no) / 10 ** 6).toFixed(2)} No
              </Paper>
            </div>
            <div className={classes.marketBottomColumn}>
              Liquidity Balance
              <Paper className={classes.price}>
                {(parseFloat(liquidityBalance) / 10 ** 6).toFixed(2)}
              </Paper>
            </div>
          </div>
        </Paper>
        <div className={classes.row}>
          <Paper className={classes.chart}>
            <Doughnut
              data={{
                hoverOffset: 4,

                labels: ["Yes", "No"],
                datasets: [
                  {
                    data: [
                      marketDataContract.yesPrice / 1000,
                      marketDataContract.noPrice / 1000,
                    ],
                    backgroundColor: ["#06D6A0", "#FF6978"],
                    hoverBackgroundColor: ["#05AC7F", "#D45D69"],
                    borderColor: "#fff",
                    borderWidth: 1,
                    hoverBorderWidth: 2,
                    hoverBorderColor: "#fff",
                  },
                ],
              }}
              options={{
                animation: {
                  animateRotate: false,
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    padding: 20,
                    position: "bottom",
                    fullSize: true,
                    maxWidth: true,
                    dispaly: false,
                    labels: {
                      color: "#fff",
                      padding: 20,
                    },
                  },
                  title: {
                    display: true,
                    text: "Market Probablity Chart",
                    color: "#fff",
                    font: {
                      weight: "bold",
                      size: 18,
                    },
                    padding: {
                      bottom: 30,
                    },
                    fontSize: "20px",
                    fullSize: true,
                  },
                },
              }}
            />
          </Paper>
          <Paper className={classes.rightSection}>
            <MuiThemeProvider theme={theme}>
              <Tabs
                value={value}
                onChange={handleChangeTabs}
                TabIndicatorProps={{
                  style: {
                    backgroundColor: "#F48FB1",
                    color: "white",
                  },
                }}
                className={classes.tabs}
                centered
              >
                {!market.resolved ? (
                  <Tab label="Buy" />
                ) : (
                  <Tab label="Claim Shares" />
                )}
                {!market.resolved && <Tab label="Sell" />}
                <Tab label="Liquidity" />
              </Tabs>
            </MuiThemeProvider>
            {value === 0 &&
              !market.resolved &&
              (marketDataContract.totalLiquidityShares > 0 ? (
                <form onSubmit={buy}>
                  <div className={classes.tabContent}>
                    <Typography variant={"body1"} className={classes.text}>
                      Pick outcome
                    </Typography>
                    <ToggleButtonGroup
                      color="secondary"
                      className={classes.outcomes}
                      value={outcome}
                      exclusive
                      onChange={handleChangeOutcome}
                      aria-label="text alignment"
                    >
                      <ToggleButton
                        value={0}
                        fullWidth
                        style={{
                          color: "white",
                          flex: 1,
                          backgroundColor: outcome === 0 && "#4BB84B",
                          border: "1px solid #4BB84B",
                        }}
                      >
                        Yes {marketDataContract.yesPrice / 10}%
                      </ToggleButton>
                      <div style={{ width: "8px" }}></div>
                      <ToggleButton
                        value={1}
                        fullWidth
                        style={{
                          flex: 1,
                          color: "white",
                          backgroundColor: outcome === 1 && "#B64444",
                          border: "1px solid #B64444",
                        }}
                      >
                        No {marketDataContract.noPrice / 10}%
                      </ToggleButton>
                    </ToggleButtonGroup>
                    {/*                   <Paper className={classes.yes}>
                    Yes ${marketDataContract.yesPrice / 1000}
                  </Paper>
                  <Paper className={classes.no}>
                    No ${marketDataContract.noPrice / 1000}
                  </Paper> */}
                    <Typography variant={"body1"} className={classes.text}>
                      How much?
                    </Typography>
                    <div
                      className={classes.rowInput}
                      style={{
                        marginBottom: howMuch
                          ? howMuch < 1
                            ? "2px"
                            : "20px"
                          : "20px",
                      }}
                    >
                      <InputBase
                        className={classes.input}
                        style={{
                          border: howMuch
                            ? howMuch < 1
                              ? "1px solid red"
                              : howMuch > balance / 10 ** 6
                              ? "1px solid red"
                              : "1px solid #9282EC"
                            : "1px solid #9282EC",
                        }}
                        placeholder="0"
                        variant="filled"
                        value={howMuch}
                        type="number"
                        onChange={handleChangeHowMuchBuy}
                        error={
                          howMuch
                            ? howMuch < 1
                              ? true
                              : howMuch > balance / 10 ** 6
                              ? true
                              : false
                            : false
                        }
                      ></InputBase>
                      <Typography variant={"body1"} className={classes.usdText}>
                        Tez
                      </Typography>
                    </div>
                    {howMuch ? (
                      howMuch < 1 ? (
                        <Typography
                          variant={"body1"}
                          style={{
                            color: "red",
                            fontSize: "12px",
                            marginLeft: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          Cant be less than 1 tez
                        </Typography>
                      ) : howMuch > balance / 10 ** 6 ? (
                        <Typography
                          variant={"body1"}
                          style={{
                            color: "red",
                            fontSize: "12px",
                            marginLeft: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          Cannot be more than your balance
                        </Typography>
                      ) : (
                        ""
                      )
                    ) : (
                      ""
                    )}
                    <div className={classes.rowBottom}>
                      <Typography
                        variant={"body1"}
                        className={classes.bottomtextLeft}
                      >
                        Base Cost
                      </Typography>
                      <Typography variant={"h6"} className={classes.bottomText}>
                        {howMuch ? howMuch : 0} tez
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
                        {estShare ? parseFloat(estShare).toFixed(3) : 0}{" "}
                        {outcome === 0 ? "Yes" : "No"}
                      </Typography>
                    </div>
                    <div className={classes.rowBottom}>
                      <Typography
                        variant={"body1"}
                        className={classes.bottomtextLeft}
                      >
                        Estimated Buying Price
                      </Typography>
                      <Typography variant={"h6"} className={classes.bottomText}>
                        {buyingPrice ? parseFloat(buyingPrice).toFixed(2) : 0}{" "}
                        tez/{outcome === 0 ? "yes" : "no"}
                      </Typography>
                    </div>
                    <div className={classes.rowBottom}>
                      <Typography
                        variant={"body1"}
                        className={classes.bottomtextLeft}
                      >
                        Potential Profit
                      </Typography>
                      <Typography variant={"h6"} className={classes.bottomText}>
                        {potentialProfit
                          ? parseFloat(potentialProfit).toFixed(3)
                          : 0}{" "}
                        tez
                      </Typography>
                    </div>
                    <div className={classes.buttonDiv}>
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        className={classes.button}
                        fullWidth={true}
                      >
                        Buy
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <Typography variant={"body1"} className={classes.text}>
                  Trading is disabled due to lack of liquidity.
                </Typography>
              ))}
            {value === 0 && market.resolved && (
              <form onSubmit={claim}>
                <div className={classes.tabContent}>
                  <Typography variant={"body1"} className={classes.text}>
                    Market is resolved claim your winnings
                  </Typography>
                  <Typography
                    variant={"body1"}
                    className={classes.text}
                    style={{
                      fontWeight: 700,
                      fontSize: "20px",
                      marginTop: "10px",
                      marginBottom: "0px",
                      color: "#F48FB1",
                    }}
                  >
                    You'll get:
                  </Typography>
                  <div className={classes.rowBottom}>
                    <Typography
                      variant={"body1"}
                      className={classes.bottomtextLeft}
                    >
                      Amount
                    </Typography>
                    <Typography variant={"h6"} className={classes.bottomText}>
                      {marketDataContract.result
                        ? (outcomeBalance.yes / 1000000).toFixed(2)
                        : (outcomeBalance.no / 1000000).toFixed(2)}{" "}
                      Tez
                    </Typography>
                  </div>
                  <div className={classes.buttonDiv}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      className={classes.button}
                      fullWidth={true}
                    >
                      Claim Shares
                    </Button>
                  </div>
                </div>
              </form>
            )}
            {value === 1 &&
              (marketDataContract.totalLiquidityShares > 0 &&
              !market.resolved ? (
                <form onSubmit={sell}>
                  <div className={classes.tabContent}>
                    <Typography variant={"body1"} className={classes.text}>
                      Pick outcome
                    </Typography>
                    <ToggleButtonGroup
                      color="secondary"
                      className={classes.outcomes}
                      value={outcome}
                      exclusive
                      onChange={handleChangeOutcome}
                      aria-label="text alignment"
                    >
                      <ToggleButton
                        value={0}
                        fullWidth
                        style={{
                          color: "white",
                          flex: 1,
                          backgroundColor: outcome === 0 && "#4BB84B",
                          border: "1px solid #4BB84B",
                        }}
                      >
                        Yes {marketDataContract.yesPrice / 10}%
                      </ToggleButton>
                      <div style={{ width: "8px" }}></div>
                      <ToggleButton
                        value={1}
                        fullWidth
                        style={{
                          flex: 1,
                          color: "white",
                          backgroundColor: outcome === 1 && "#B64444",
                          border: "1px solid #B64444",
                        }}
                      >
                        No {marketDataContract.noPrice / 10}%
                      </ToggleButton>
                    </ToggleButtonGroup>
                    <Typography variant={"body1"} className={classes.text}>
                      How much?
                    </Typography>
                    <div
                      className={classes.rowInput}
                      style={{
                        marginBottom: howMuch
                          ? howMuch > 0
                            ? outcome === 0
                              ? howMuch > outcomeBalance.yes / 10 ** 6
                                ? "2px"
                                : "20px"
                              : howMuch > outcomeBalance.no / 10 ** 6
                              ? "2px"
                              : "20px"
                            : "2px"
                          : "20px",
                      }}
                    >
                      <InputBase
                        className={classes.input}
                        style={{
                          border: howMuch
                            ? howMuch < 0
                              ? "1px solid red"
                              : outcome === 0
                              ? howMuch > outcomeBalance.yes / 10 ** 6
                                ? "1px solid red"
                                : "1px solid #9282EC"
                              : howMuch > outcomeBalance.no / 10 ** 6
                              ? "1px solid red"
                              : "1px solid #9282EC"
                            : "1px solid #9282EC",
                        }}
                        placeholder="0"
                        variant="filled"
                        value={howMuch}
                        type="number"
                        onChange={handleChangeHowMuchSell}
                        error={
                          howMuch
                            ? howMuch < 0
                              ? true
                              : outcome === 0
                              ? howMuch > outcomeBalance.yes / 10 ** 6
                                ? true
                                : false
                              : howMuch > outcomeBalance.no / 10 ** 6
                              ? true
                              : false
                            : false
                        }
                      ></InputBase>
                      <Typography variant={"body1"} className={classes.usdText}>
                        Shares
                      </Typography>
                    </div>
                    {howMuch ? (
                      howMuch < 0 ? (
                        <Typography
                          variant={"body1"}
                          style={{
                            color: "red",
                            fontSize: "12px",
                            marginLeft: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          Cant be less than 1 tez
                        </Typography>
                      ) : outcome === 0 ? (
                        howMuch > outcomeBalance.yes / 10 ** 6 ? (
                          <Typography
                            variant={"body1"}
                            style={{
                              color: "red",
                              fontSize: "12px",
                              marginLeft: "10px",
                              marginBottom: "10px",
                            }}
                          >
                            Cannot be more than your balance
                          </Typography>
                        ) : (
                          ""
                        )
                      ) : howMuch > outcomeBalance.no / 10 ** 6 ? (
                        <Typography
                          variant={"body1"}
                          style={{
                            color: "red",
                            fontSize: "12px",
                            marginLeft: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          Cannot be more than your balance
                        </Typography>
                      ) : (
                        ""
                      )
                    ) : (
                      ""
                    )}
                    <Typography
                      variant={"body1"}
                      className={classes.text}
                      style={{
                        fontWeight: 700,
                        fontSize: "20px",
                        marginTop: "10px",
                        marginBottom: "0px",
                        color: "#F48FB1",
                      }}
                    >
                      You'll get:
                    </Typography>
                    <div className={classes.rowBottom}>
                      <Typography
                        variant={"body1"}
                        className={classes.bottomtextLeft}
                      >
                        Amount
                      </Typography>
                      <Typography variant={"h6"} className={classes.bottomText}>
                        {estShare
                          ? parseFloat(estShare / 1000000).toFixed(2)
                          : 0}{" "}
                        Tez
                      </Typography>
                    </div>
                    <div className={classes.buttonDiv}>
                      <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        fullWidth
                        type="submit"
                      >
                        Sell
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <Typography variant={"body1"} className={classes.text}>
                  Trading is disabled due to lack of liquidity or market is
                  resolved.
                </Typography>
              ))}
            {value === 1 && market.resolved && (
              <form onSubmit={removeLiquidity}>
                <div className={classes.tabContent}>
                  <Typography variant={"body1"} className={classes.text}>
                    Remove Liquidity
                  </Typography>
                  <Typography variant={"body1"} className={classes.text}>
                    How much?
                  </Typography>
                  <div
                    className={classes.rowInput}
                    style={{
                      marginBottom: howMuch
                        ? howMuch > 0
                          ? outcome === 0
                            ? howMuch > balance / 10 ** 6
                              ? "2px"
                              : "20px"
                            : howMuch > liquidityBalance / 10 ** 6
                            ? "2px"
                            : "20px"
                          : "2px"
                        : "20px",
                    }}
                  >
                    <InputBase
                      className={classes.input}
                      style={{
                        border: howMuch
                          ? howMuch < 0
                            ? "1px solid red"
                            : outcome === 0
                            ? howMuch > balance / 10 ** 6
                              ? "1px solid red"
                              : "1px solid #9282EC"
                            : howMuch > liquidityBalance / 10 ** 6
                            ? "1px solid red"
                            : "1px solid #9282EC"
                          : "1px solid #9282EC",
                      }}
                      placeholder="0"
                      variant="filled"
                      value={howMuch}
                      type="number"
                      onChange={
                        outcome === 0
                          ? handleChangeLiquidityAdd
                          : handleChangeLiquidityRemove
                      }
                      error={
                        howMuch
                          ? howMuch < 0
                            ? true
                            : outcome === 0
                            ? howMuch > balance / 10 ** 6
                              ? true
                              : false
                            : howMuch > liquidityBalance / 10 ** 6
                            ? true
                            : false
                          : false
                      }
                    ></InputBase>
                    <Typography variant={"body1"} className={classes.usdText}>
                      {outcome === 0 ? "Tez" : "Shares"}
                    </Typography>
                  </div>
                  {howMuch ? (
                    howMuch < 0 ? (
                      <Typography
                        variant={"body1"}
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginLeft: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        Cant be less than 1 tez
                      </Typography>
                    ) : outcome === 0 ? (
                      howMuch > balance / 10 ** 6 ? (
                        <Typography
                          variant={"body1"}
                          style={{
                            color: "red",
                            fontSize: "12px",
                            marginLeft: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          Cannot be more than your balance
                        </Typography>
                      ) : (
                        ""
                      )
                    ) : howMuch > liquidityBalance / 10 ** 6 ? (
                      <Typography
                        variant={"body1"}
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginLeft: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        Cannot be more than your balance
                      </Typography>
                    ) : (
                      ""
                    )
                  ) : (
                    ""
                  )}
                  <Typography
                    variant={"body1"}
                    className={classes.text}
                    style={{
                      fontWeight: 700,
                      fontSize: "20px",
                      marginTop: "10px",
                      marginBottom: "0px",
                      color: "#F48FB1",
                    }}
                  >
                    You'll get:
                  </Typography>
                  <div className={classes.rowBottom}>
                    <Typography
                      variant={"body1"}
                      className={classes.bottomtextLeft}
                    >
                      {outcome === 0 ? "Liquidity Shares" : "Amount"}
                    </Typography>
                    <Typography variant={"h6"} className={classes.bottomText}>
                      {estShare ? parseFloat(estShare / 1000000).toFixed(2) : 0}{" "}
                      {outcome === 0 ? "Shares" : "Tez"}
                    </Typography>
                  </div>

                  <div className={classes.rowBottom}>
                    <Typography
                      variant={"body1"}
                      className={classes.bottomtextLeft}
                    >
                      Yes Shares
                    </Typography>
                    <Typography variant={"h6"} className={classes.bottomText}>
                      {yesTokensGet
                        ? (parseFloat(yesTokensGet) / 10 ** 6).toFixed(2)
                        : 0}{" "}
                      Yes
                    </Typography>
                  </div>
                  <div className={classes.rowBottom}>
                    <Typography
                      variant={"body1"}
                      className={classes.bottomtextLeft}
                    >
                      No Shares
                    </Typography>
                    <Typography variant={"h6"} className={classes.bottomText}>
                      {noTokensGet
                        ? (parseFloat(noTokensGet) / 10 ** 6).toFixed(2)
                        : 0}{" "}
                      No
                    </Typography>
                  </div>
                  <div className={classes.buttonDiv}>
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.button}
                      fullWidth
                      type="submit"
                    >
                      {outcome === 0 ? "Add Liquidity" : "Remove Liquidity"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
            {value === 2 && !market.resolved && (
              <form onSubmit={outcome === 0 ? addLiquidity : removeLiquidity}>
                <div className={classes.tabContent}>
                  <Typography variant={"body1"} className={classes.text}>
                    Select (Add/Remove)
                  </Typography>
                  <ToggleButtonGroup
                    color="secondary"
                    className={classes.outcomes}
                    value={outcome}
                    exclusive
                    onChange={handleChangeOutcome}
                    aria-label="text alignment"
                  >
                    <ToggleButton
                      value={0}
                      fullWidth
                      style={{
                        color: "white",
                        flex: 1,
                        backgroundColor: outcome === 0 && "#4BB84B",
                        border: "1px solid #4BB84B",
                      }}
                    >
                      Add Liquidity
                    </ToggleButton>
                    <div style={{ width: "8px" }}></div>
                    <ToggleButton
                      value={1}
                      fullWidth
                      style={{
                        flex: 1,
                        color: "white",
                        backgroundColor: outcome === 1 && "#B64444",
                        border: "1px solid #B64444",
                      }}
                    >
                      Remove Liquidity
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Typography variant={"body1"} className={classes.text}>
                    How much?
                  </Typography>
                  <div
                    className={classes.rowInput}
                    style={{
                      marginBottom: howMuch
                        ? howMuch > 0
                          ? outcome === 0
                            ? howMuch > balance / 10 ** 6
                              ? "2px"
                              : "20px"
                            : howMuch > liquidityBalance / 10 ** 6
                            ? "2px"
                            : "20px"
                          : "2px"
                        : "20px",
                    }}
                  >
                    <InputBase
                      className={classes.input}
                      style={{
                        border: howMuch
                          ? howMuch < 0
                            ? "1px solid red"
                            : outcome === 0
                            ? howMuch > balance / 10 ** 6
                              ? "1px solid red"
                              : "1px solid #9282EC"
                            : howMuch > liquidityBalance / 10 ** 6
                            ? "1px solid red"
                            : "1px solid #9282EC"
                          : "1px solid #9282EC",
                      }}
                      placeholder="0"
                      variant="filled"
                      value={howMuch}
                      type="number"
                      onChange={
                        outcome === 0
                          ? handleChangeLiquidityAdd
                          : handleChangeLiquidityRemove
                      }
                      error={
                        howMuch
                          ? howMuch < 0
                            ? true
                            : outcome === 0
                            ? howMuch > balance / 10 ** 6
                              ? true
                              : false
                            : howMuch > liquidityBalance / 10 ** 6
                            ? true
                            : false
                          : false
                      }
                    ></InputBase>
                    <Typography variant={"body1"} className={classes.usdText}>
                      {outcome === 0 ? "Tez" : "Shares"}
                    </Typography>
                  </div>
                  {howMuch ? (
                    howMuch < 0 ? (
                      <Typography
                        variant={"body1"}
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginLeft: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        Cant be less than 1 tez
                      </Typography>
                    ) : outcome === 0 ? (
                      howMuch > balance / 10 ** 6 ? (
                        <Typography
                          variant={"body1"}
                          style={{
                            color: "red",
                            fontSize: "12px",
                            marginLeft: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          Cannot be more than your balance
                        </Typography>
                      ) : (
                        ""
                      )
                    ) : howMuch > liquidityBalance / 10 ** 6 ? (
                      <Typography
                        variant={"body1"}
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginLeft: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        Cannot be more than your balance
                      </Typography>
                    ) : (
                      ""
                    )
                  ) : (
                    ""
                  )}
                  <Typography
                    variant={"body1"}
                    className={classes.text}
                    style={{
                      fontWeight: 700,
                      fontSize: "20px",
                      marginTop: "10px",
                      marginBottom: "0px",
                      color: "#F48FB1",
                    }}
                  >
                    You'll get:
                  </Typography>
                  <div className={classes.rowBottom}>
                    <Typography
                      variant={"body1"}
                      className={classes.bottomtextLeft}
                    >
                      {outcome === 0 ? "Liquidity Shares" : "Amount"}
                    </Typography>
                    <Typography variant={"h6"} className={classes.bottomText}>
                      {estShare ? parseFloat(estShare / 1000000).toFixed(2) : 0}{" "}
                      {outcome === 0 ? "Shares" : "Tez"}
                    </Typography>
                  </div>

                  <div className={classes.rowBottom}>
                    <Typography
                      variant={"body1"}
                      className={classes.bottomtextLeft}
                    >
                      Yes Shares
                    </Typography>
                    <Typography variant={"h6"} className={classes.bottomText}>
                      {yesTokensGet
                        ? (parseFloat(yesTokensGet) / 10 ** 6).toFixed(2)
                        : 0}{" "}
                      Yes
                    </Typography>
                  </div>
                  <div className={classes.rowBottom}>
                    <Typography
                      variant={"body1"}
                      className={classes.bottomtextLeft}
                    >
                      No Shares
                    </Typography>
                    <Typography variant={"h6"} className={classes.bottomText}>
                      {noTokensGet
                        ? (parseFloat(noTokensGet) / 10 ** 6).toFixed(2)
                        : 0}{" "}
                      No
                    </Typography>
                  </div>
                  <div className={classes.buttonDiv}>
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.button}
                      fullWidth
                      type="submit"
                    >
                      {outcome === 0 ? "Add Liquidity" : "Remove Liquidity"}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </Paper>
        </div>
        <h4 className={classes.questionText} style={{ bottom: "0px" }}>
          Description
        </h4>
        <h6 style={{ color: "white", fontSize: "13px" }}>
          {market.marketDescription}
        </h6>
      </div>
    );
  } else {
    return (
      <div className={classes.loadingBody}>
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
            {loadingText}
          </Typography>
        </div>
      </div>
    );
  }
}

export default MarketDetails;
