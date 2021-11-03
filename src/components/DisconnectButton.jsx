import { TezosToolkit } from "@taquito/taquito";
import useStyles from "../styles/homepageDesign";
import { Button } from "@material-ui/core";

function DisconnectButton({
  wallet,
  setUserAddress,
  setUserBalance,
  setWallet,
  setTezos,
  setBeaconConnection,
  userBalance,
  userAddress,
}) {
  const classes = useStyles();
  const disconnectWallet = async () => {
    //window.localStorage.clear();
    setUserAddress("");
    setUserBalance(0);
    setWallet(null);
    const tezosTK = new TezosToolkit("https://granadanet.smartpy.io");
    setTezos(tezosTK);
    setBeaconConnection(false);
    console.log("disconnecting wallet");
    if (wallet) {
      await wallet.client.removeAllAccounts();
      await wallet.client.removeAllPeers();
      await wallet.client.destroy();
    }
  };
  return (
    <div>
      <Button
        variant="outlined"
        className={classes.DisconnectWallet}
        onClick={disconnectWallet}
      >
        <div className={classes.buttonRow}>
          <div className={classes.balanceText}>
            {(userBalance / 1000000).toFixed(3)} Tez{" "}
          </div>
          |
          <div className={classes.addressText}>
            {userAddress.slice(0, 5)}...{userAddress.slice(-5)}
          </div>
        </div>
      </Button>
    </div>
  );
}

export default DisconnectButton;
