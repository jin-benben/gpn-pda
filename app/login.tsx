import { commonRequestFetch } from "@/lib/commonServices";
import { User, setLocalUserInfo } from "@/lib/util";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as z from "zod";
const schema = z.object({
  password: z.string().min(1, "请输入密码"),
  phone:z.string().min(1, "请输入账号"),
});

import type { AnyFieldApi } from '@tanstack/react-form';

function FieldInfo({ field }: { field: AnyFieldApi }) {
  console.log()
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <Text style={{ color: "red",fontSize:12 }}>{field.state.meta.errors.map((e) => e.message)}</Text>
      ) : null}
    </>
  )
}
export default function LoginScreen() {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      phone: "",
      password: "",
    },
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      commonRequestFetch<any,User>({
        functionCode:"employeeLogin",
        url:"/loginPwd",
        prefix:"jms-auth",
        data:value,
      }).then(res=>{ 
        setLocalUserInfo(res)
        router.replace("/");
      }).catch(err=>{ 
        console.log(err,'登录失败')
      })
    },
  });
  
  return (
    <View style={styles.container}>
      <form.Field name="phone">
        {(field) => (
          <View style={styles.formItem}>
            <Text style={styles.labelItem}>手机号:</Text>
            <TextInput
              placeholder="请输入手机号"
              style={styles.textInput}
              value={field.state.value}
              onChangeText={field.handleChange}
            />
            <FieldInfo field={field} />
          </View>
        )}
      </form.Field>
      <form.Field name="password">
        {(field) => (
          <View style={styles.formItem}>
            <Text style={styles.labelItem}>密 码:</Text>
            <TextInput
              textContentType="password"
              placeholder="请输入密码"
              style={styles.textInput}
              value={field.state.value}
              secureTextEntry
              onChangeText={field.handleChange}
            />
             <FieldInfo field={field} />
          </View>
        )}
      </form.Field>
      
      <TouchableOpacity style={styles.submitBtn} onPress={()=>form.handleSubmit()}>
        {
          form.state.isSubmitting && <ActivityIndicator animating={true} color={"#fff"}/>
        }
        <Text style={styles.buttonText}>登录</Text>
      </TouchableOpacity>
    </View>
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
    backgroundColor: "#e40614",
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
