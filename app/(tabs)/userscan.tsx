import { loadData } from '@/components/PersistantStorage';
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const URL = 'https://solstice.mitblrfest.org';

interface UserInfoRequest {
    user: SolsticeUser,
    pass: SolsticePassInfo | null
}
interface SolsticeUser {
    first_name: string;
    last_name: string;
    email_address: string;
    phone_number: string | null;
    mahe_registration_number: number | null;
    pass_id: string | null;
    id: string;
}
interface SolsticePassInfo {
    name: string;
    description: string | null;
    cost: string;
    id: string;
}

export default function UserScan() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [qrCode, onChangeQRCode] = useState('');
    const [error, onChangedError] = useState('');

    const [userInfo, onChangeUserInfo] = useState(null as UserInfoRequest | null);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    // useEffect(() => {
    //     checkLoggedIn();
    // }, []);

    const checkLoggedIn = () => {
        loadData('token').then(async (token) => {
            if (token.success == false) {
                return (false);
            } else if (token.result == null || token.result == '') {
                return (false);
            } else {
                return (true);
            }
        })
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    function scanQR(scanningResult: BarcodeScanningResult) {
        onChangeQRCode(scanningResult.raw ?? 'no qr')
    }

    function getUserInfo() {
        loadData('token').then((res) => {
            if (res.success == false) {
                onChangedError("You're not logged in. Go to profile and log in");
                return;
            } else if (res.result == '') {
                onChangedError("You're not logged in. Go to profile and log in");
                return;
            } else {
                const token = res.result;
                fetch(`${URL}/check/userid/${encodeURIComponent(qrCode.trim())}/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }).then((res) => {
                    if (res.ok) {
                        res.json().then((ui) => {
                            const userInfo = ui as UserInfoRequest;
                            onChangeUserInfo(userInfo)
                            onChangedError('')
                        });
                    } else if (res.status == 403) {
                        onChangeUserInfo(null)
                        onChangedError('Your session has timed out. Log in again.')
                    } else if (res.status == 400) {
                        onChangeUserInfo(null)
                        onChangedError('No userid put in field.')
                    }
                    else if (res.status == 404) {
                        onChangeUserInfo(null)
                        onChangedError('User not found.');
                    } else {
                        onChangeUserInfo(null)
                        onChangedError(`Unexpected error : ${res.status}`)
                    }
                })
            }
        });

    }

    return (
        <View style={styles.container}>
            <View style={styles.cameraWrapper}>
                <CameraView style={styles.camera} ratio='1:1' facing={facing} onBarcodeScanned={scanQR}>
                    <View style={styles.buttonContainer}>
                    </View>
                </CameraView>
            </View>
            <View>
                <Text style={{ color: 'white' }}>User ID</Text>
                <TextInput style={styles.input} placeholderTextColor={'#888'} placeholder='UserID' onChangeText={onChangeQRCode} value={qrCode} />
            </View>
            <Button title='Get info' onPress={() => { getUserInfo() }} />
            <Button title='Clear' onPress={() => { onChangeUserInfo(null); onChangedError(''); }} />
            <View
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    margin: 0
                }}
            >
                <Text style={{ fontSize: 16, color: 'red' }}>{error}</Text>
                {userInfo != null &&
                    <View>
                        <Text style={styles.text}>Name : {`${userInfo.user.first_name} ${userInfo.user.last_name}`}</Text>
                        <Text style={styles.text}>Pass : {`${userInfo.pass == null ? 'No pass owned' : userInfo.pass.name}`}</Text>
                        <Text style={styles.text}>Phone number : <Text style={{ fontFamily: 'monospace' }}>{`+91-${userInfo.user.phone_number?.substring(0, userInfo.user.phone_number.length / 2)} ${userInfo.user.phone_number?.substring(userInfo.user.phone_number.length / 2, userInfo.user.phone_number.length)}`}</Text></Text>
                        <Text style={styles.text}>Reg No : <Text style={{ fontFamily: 'monospace' }}>{`${userInfo.user.mahe_registration_number ?? 'Not a MAHE student'}`}</Text></Text>
                    </View>
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        width: 300,
        height: 50,
        borderRadius: 10,
        margin: 3,
        borderWidth: 1,
        padding: 10,
        borderColor: "#fff",
        color: '#fff',
        fontFamily: 'monospace'
    },
    container: {
        backgroundColor: '#25292e',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraWrapper: {
        width: 300,  // Fixed width
        height: 300, // Fixed height (1:1 aspect ratio)
        overflow: 'hidden',
        borderRadius: 10, // Optional: Rounded corners
    },
    camera: {
        flex: 1, // Fill the wrapper
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    button: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 5,
    },
    text: {
        color: 'white',
        fontSize: 16,
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
});
