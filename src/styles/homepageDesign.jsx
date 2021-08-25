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
    margin: "30px 0px 10px 0px",
  },
  markets:{
    padding:"15px",
    textAlign:"left",
    display:"flex",
    flexDirection:"column",
    backgroundColor:"transparent",
    color:"white",
    elevation:8,
    border: "2px solid #9282EC",
    height:"165px",
    justifyContent:"space-between"
  },
  marketRow:{
    display:"flex",
    flexDirection:"row",
    justifyContent:"start",
  },
  image:{
    borderRadius: "50%",
    width:"35px",
    height:"35px",
    objectFit: "cover",
    margin: "0px 10px 0px 0px",
  },
  marketBottomRow:{
    display:"flex",
    flexDirection:"row",
    justifyContent:"space-between",
  },
  marketBottomColumn:{
    display:"flex",
    flexDirection:"column",
  },
  price:{
    backgroundColor: "#483F5A",
    elevation:20,
    textAlign: "center",
    color: "#F48FB1",
    padding: "8px",
    margin: "8px 0px 0px 0px",
  }
}));

export default useStyles;