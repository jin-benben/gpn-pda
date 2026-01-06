import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { Modal, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
interface PopupProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title:string,
  modalStyle?:StyleProp<ViewStyle>
}
export default function Popup({
  visible,title,
  children,onClose,modalStyle
}:PopupProps){
  return (
    <Modal 
      visible={visible} 
      hardwareAccelerated
      statusBarTranslucent
      backdropColor={'rgba(0,0,0,0.5)'}
      transparent
    >
      <View style={styles.container}>
        <View style={[styles.modalView,modalStyle]}> 
          <View style={styles.headerWrapper}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={20} color="gray" />
            </TouchableOpacity>
          </View>
          <View style={{flex:1}}>{children}</View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView:{
    shadowColor: '#000',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor:"white",
    width:"100%"
  },
  headerWrapper:{
    padding:10,
    flexDirection:"row",
    justifyContent:"space-between"
  },
  title:{
    fontSize:14,
    fontWeight:500
  },
  closeBtn:{

  }
});
