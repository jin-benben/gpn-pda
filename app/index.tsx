import { Link, router } from "expo-router";
import { Text, View, StyleSheet,Button,Image } from "react-native";
const menuOptions = [
  {
    url: './wms0007',
    text: '收货',
    icon:require("../assets/images/shouhuo.png")
  },
  {
    url: './wms0008',
    text: '上架',
    icon:require("../assets/images/shangjia.png")
  },

  {
    url: './wms0018',
    text: '库位转移',
    icon:require("../assets/images/zhuanyi.png")
  },
  {
    url: './wms0031',
    text: '库位补货',
    icon:require("../assets/images/buhuo.png")
  },
]
export default function Index() {
  return (
    <View
      style={styles.container}
    >
      <View style={styles.loginWrapper}>
        <Image style={{width:66,height:66}} source={require("../assets/images/logo.png")} />
        <Link href={"./login"} style={{fontSize:20,fontWeight:"bold",marginLeft:20}}><Text>登录</Text></Link>
      </View>
      <View style={styles.gridMenu}> 
        {
          menuOptions.map((item, index) => (
            <View onTouchEnd={() => router.navigate(item.url as any) } style={styles.menuItem} key={index}>
              <Image style={{width:40,height:40,marginBottom:6,display:"flex"}} source={item.icon} />
              <Text>{item.text}</Text>
            </View>
          ))
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    height: "100%",
  },
  text: {
  },
  gridMenu:{
    display:"flex",
    flexWrap:"wrap",
    flexDirection:"row",
    padding:10,
  },
  menuItem:{
    width:"25%",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    flexDirection:"column",
  },
  loginWrapper:{
    display:"flex",
    flexDirection:"row",
    alignItems:"center",
    padding:20,
  },
});