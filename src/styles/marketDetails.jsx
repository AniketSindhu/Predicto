import { makeStyles } from "@material-ui/core";

const useStyles2 = makeStyles((theme) => ({
    body:{
        width:"80%",
        margin: "0 auto"
    },
    header:{
        height:150,
        backgroundColor: "#100C18",
        border: "1px solid #9282EC",
        borderRadius: "4px",
        margin:"20px 0 20px 0",
        padding:"18px",
        color:"white",
        display:"flex",
        flexDirection:"column",
    },
    image:{
        borderRadius:"50%",
        width:"45px",
        height:"45px",
        objectFit:"cover",
        margin:"0px 10px 0px 0px"
    },
    topRow:{
        display:"flex",
        flexDirection:"row",
        alignItems:"center",
    },
    questionText:{
        color:"white",
        fontSize:"20px",
        margin:"0px",
        alignContent:"center",
    },
    marketBottomRow:{
        flex:1,
        display:"flex",
        flexDirection:"row",
        alignItems:"flex-end",
        justifyContent:"space-evenly",
      },
      marketBottomColumn:{
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
      },
      price:{
        backgroundColor: "#483F5A",
        elevation:20,
        textAlign: "center",
        color: "#F48FB1",
        padding: "8px 25px 8px 25px",
        margin: "8px 0px 0px 0px",
      },
      row:{
        display:"flex",
        flexDirection:"row",
        margin: "40px 0px 40px 0px"
      },
      chart:{
        flex:2,
        height:"350px",
        backgroundColor:"#100C18",
        border: "1px solid #9282EC",
        padding:"20px",
        margin:"0px 20px 0px 0px",
      },
      rightSection:{
          flex:1,
          color:"white",
          backgroundColor:"#100C18",
          border: "1px solid #9282EC",
      },
      tabs:{
          backgroundColor:"#9282EC",
          margin:"0px 0px 10px 0px",
      },
      pickOutcome:{
        margin:"10px",
      },
      outcomes:{
        display:"flex",
        flexDirection:"row",
        justifyContent:"space-evenly",
      },
      yes:{
        backgroundColor:"#06D6A0",
        padding:"15px 10px 15px 10px",
        flex:1,
        color:"white",
        margin:"10px",
        textAlign:"center",
      },
      no:{
        backgroundColor:"#FF6978",
        color:"white",
        padding:"15px 10px 15px 10px",
        flex:1,
        margin:"10px",
        textAlign:"center",
      }
}));

export default useStyles2;