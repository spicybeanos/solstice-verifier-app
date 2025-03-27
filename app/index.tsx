import { Text, View } from "react-native";
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Link href='/profile' style={{
        padding: 10,
        borderStyle: "solid",
        borderBlockColor: 'black',
        borderRadius: 5,
        borderWidth: 1,
        margin: 20,
        textAlign: "center"
      }}>Go to Profile</Link>
    </View>
  );
}
