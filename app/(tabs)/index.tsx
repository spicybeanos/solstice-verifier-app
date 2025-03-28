import { Text, View, StyleSheet } from "react-native";
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#25292e',
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={styles.text}>Edit app/index.tsx to edit this screen.</Text>
      <Link href='/profile' style={{
        padding: 10,
        borderStyle: "solid",
        borderBlockColor: 'white',
        borderRadius: 5,
        borderWidth: 1,
        margin: 20,
        color: 'white',
        textAlign: "center"
      }}>Go to Profile</Link>
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
  },
})