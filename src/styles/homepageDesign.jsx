import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  toolbar: {
    height: 70,
    backgroundColor: "#27262C",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ConnectWallet: {
    color: "#F48FB1",
    borderColor: "#F48FB1"
  },
  dashBoard: {
    margin: "20px 0px 20px 0px",
    padding: "0px 40px 0px 40px",
    backgroundColor: "#F48FB1",
    height: 120,
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  centerRow: {
    display: "flex",
    justifyContent: "center",
  },
  columnDashoard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "start"
  },
  TextFieldWhole: {
    backgroundColor: "#483F5A",
    width: "100%",
    display: "flex",
    alignItems: 'center',
    padding: '8px 8px',
    borderRadius: "4px",
  },

  TextField: {
    color: "grey",
    marginLeft: theme.spacing(1),
    flex: 1
  },
  popularMarketText: {
    color: "white",
    textAlign: "left",
    margin: "15px 0px 10px 0px",
  }
}));

export default useStyles;