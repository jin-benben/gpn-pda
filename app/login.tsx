import { commonRequestFetch } from "@/lib/commonServices";
import { User, removeLocalUserInfo, setLocalUserInfo } from "@/lib/util";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as z from "zod";
const schema = z.object({
  password: z.string().min(1, "请输入密码"),
  phone: z.string().min(1, "请输入账号"),
});

import { FormikTextInput } from "@/components/FormItem";
import theme from "@/const/theme";
import { Formik } from "formik";
import { useEffect } from "react";

export default function LoginScreen() {
  const router = useRouter();
  useEffect(() => { 
    removeLocalUserInfo()
  }, []);
  const onSubmit = (v: any) => {
    return commonRequestFetch<any, User>({
      functionCode: "employeeLogin",
      url: "/loginPwd",
      prefix: "jms-auth",
      data: v,
    })
      .then((res) => {
        setLocalUserInfo(res);
        router.replace("/");
      })
      .catch((err) => {
        console.log(err, "登录失败");
      });
  };

  return (
    <Formik onSubmit={onSubmit} initialValues={{ phone: "", password: "" }}>
      {(props) => (
        <View style={styles.container}>
          <View style={styles.formItem}>
            <Text style={styles.labelItem}>手机号:</Text>
            <FormikTextInput
              name="phone"
              placeholder="请输入手机号"
              style={styles.textInput}
            />
          </View>
          <View style={styles.formItem}>
            <Text style={styles.labelItem}>密 码:</Text>
            <FormikTextInput
              name="password"
              secureTextEntry
              textContentType="password"
              placeholder="请输入密码"
              style={styles.textInput}
            />
          </View>
          <TouchableOpacity
            disabled={props.isSubmitting}
            style={styles.submitBtn}
            onPress={() => props.handleSubmit()}
          >
            {props.isSubmitting && (
              <ActivityIndicator animating={true} color={"#fff"} />
            )}
            <Text style={styles.buttonText}>登录</Text>
          </TouchableOpacity>
        </View>
      )}
    </Formik>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  logo: {
    width: 66,
    height: 66,
    marginTop: 20,
    marginBottom: 20,
  },
  formItem: {
    width: "100%",
    display: "flex",
    marginBottom: 10,
  },
  submitBtn: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    borderRadius: 6,
    marginTop: 10,
    backgroundColor: theme.main,
  },
  textInput: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 4,
    fontSize: 12,
  },
  labelItem: {
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
  },
});
