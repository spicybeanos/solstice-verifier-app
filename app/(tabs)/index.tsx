import { Text, View, StyleSheet, Image } from "react-native";
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: "center",
        alignItems: "flex-start",
        padding: 20
      }}
    >
      <View style={{
        width: 300, alignItems: "center",
      }}>
        <Image source={require('@/assets/images/white_sol.png')} />
      </View>
      <Text style={{ color: '#ffffff', fontSize: 60 }}>Hi!</Text>
      <Text style={styles.text}>In this app you can check user details using thier QR</Text>
      <Text style={styles.text}>You can cut ticket when you give them a band. The pass needed to get the ticket cut can be set on the website.</Text>
      <Text style={styles.text}>For more information or any help, you may contact me at <Text style={{ fontFamily: 'monospace' }}>+91-86522 07970</Text> or email me at <Text style={{ fontFamily: 'monospace' }}>aryan.d.dalal@gmail.com</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    padding:5
  },
})