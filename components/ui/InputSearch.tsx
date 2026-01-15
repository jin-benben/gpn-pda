// components/InputSearch.tsx
import theme from '@/const/theme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { RefObject, use, useEffect, useImperativeHandle, useInsertionEffect, useRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

export interface SearchInput extends Pick<TextInput,"focus"|"blur">{
  
}

interface InputSearchProps extends TextInputProps {
  onSearch?: (text: string) => void;
  ref?: RefObject<SearchInput | null>;
}

const InputSearch: React.FC<InputSearchProps> = ({ 
  onSearch, 
  onSubmitEditing,
  ref,
  ...props 
}) => {
  const inputRef = useRef<TextInput | null>(null);
  const handleSubmit = (e: any) => {
    onSubmitEditing?.(e);
    onSearch?.(e.nativeEvent.text);
  };
 useImperativeHandle(ref, () => {
  return {
    focus: () => {
      inputRef.current?.focus();
    },
    blur: () => {
      inputRef.current?.blur();
    }
  }
 },[inputRef]);
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons style={styles.searchButton} name="line-scan" size={16} color={theme.main} />
      <TextInput
        style={styles.input}
        placeholder="搜索..."
        returnKeyType="search"
        onSubmitEditing={handleSubmit}
        selectTextOnFocus
        {...props}
        ref={inputRef}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    width: "100%",
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: 36,
  },
  searchButton: {
    padding: 5,
  },
});

export default InputSearch;