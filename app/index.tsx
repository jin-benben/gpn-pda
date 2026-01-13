import UpdateManager from "@/components/UpdateManager";
import { getLocalUserInfo } from "@/lib/util";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
const menuOptions = [
  {
    url: './wms0007',
    text: '常规收货',
    icon:require("../assets/images/shouhuo.png")
  },
  {
    url: './wms0007?baseDocType=ass0006',
    text: '售后收货',
    icon:require("../assets/images/shouhuo.png")
  },
  {
    url: './wms0008',
    text: '上 架',
    icon:require("../assets/images/shangjia.png")
  },
  {
    url: './wms0017',
    text: '库存查询',
    icon:require("../assets/images/pandian.png")
  },
  {
    url: './wms0031',
    text: '库位补货',
    icon:require("../assets/images/buhuo.png")
  },
  {
    url: './wms0028',
    text: '快速移动',
    icon:require("../assets/images/kuaisuzhuanyi.png")
  },
  {
    url: './combination',
    text: '组合装查询',
    icon:require("../assets/images/pandian.png")
  },
  {
    url: './wms0034',
    text: '收货异常',
    icon:require("../assets/images/yichang.png")
  },
]
export default function Index() {
  const userInfo = getLocalUserInfo();
  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        headerRight: () => (
          <Link href={"./login"} replace>
            <MaterialIcons name="logout" size={24} color="gray" />
          </Link>
        )
      }} />
      <View style={styles.loginWrapper}>
        <Image style={{width:44,height:44}} source={require("../assets/images/logo.png")} />
        {
          userInfo ? (
            <Text style={{fontSize:18,marginLeft:20}}>{userInfo?.userName}</Text>
          ):(
            <Link href={"./login"} replace style={styles.loginButton}>
              <Text>登 录</Text>
            </Link>
          )
        }
      </View>
      <View className="flex-row flex-wrap"> 
        {
          menuOptions.map((item, index) => (
            <Link href={item.url as any} key={index} asChild> 
              <TouchableOpacity className="w-1/4 justify-center items-center h-24 gap-2 py-2">
                <Image style={{width:30,height:30}} source={item.icon} />
                <Text>{item.text}</Text>
              </TouchableOpacity>
            </Link>
          ))
        }
      </View>
      <UpdateManager />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    height: "100%",
  },
  
  gridMenu:{
    display:"flex",
    flexWrap:"wrap",
    flexDirection:"row",
  },
  menuItem:{
    flex:1,
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
  loginButton:{
    padding:10,
    borderRadius:5,
    margin:10,
    fontSize:16,
    width:100,
    backgroundColor:"#fcfcfc",
    textAlign:"center",
  },
});