import { displayDateTime } from '@/components/DisplayTime';
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
interface ProshowResponse {
    entry: ProshowBandRow | null
}
interface ProshowBandRow {
    user_id: string;
    time: string; // Using string to store timestampz
    given_by: string;
}

export default function UserScan() {
    const [userInfoTab, setUserInfoTab] = useState(true); // Default to left button

    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [qrCode, onChangeQRCode] = useState('');
    const [error, onChangedError] = useState('');

    const [ticketError, onChangedTicketError] = useState('');
    const [ticketInfo, onChangeTicketInfo] = useState(null as ProshowBandRow | null)
    const [showTicket, onChangeShowTicket] = useState(false)

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

    function getTicketStatus() {
        loadData('token').then(t => {
            if (t.success) {
                const token = t.result;
                fetch(`${URL}/check/proshow/${encodeURIComponent(qrCode.trim())}/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.ok) {
                        res.json().then(tic => {
                            const ticket = tic as ProshowResponse
                            onChangeTicketInfo(ticket.entry)
                            onChangeShowTicket(true)
                            onChangedTicketError('')
                        })
                    } else {
                        onChangeShowTicket(false)
                        if (res.status == 401) {
                            onChangedTicketError("You're not logged in")
                        } else if (res.status == 403) {
                            onChangedTicketError("Session expired. Log in again")
                        } else {
                            onChangedTicketError('')
                            if (res.status == 400) {
                                res.json().then(er => {
                                    onChangedTicketError(`Database error: ${er.error}`)
                                })
                            } else if (res.status == 404) {
                                onChangedTicketError("User's ticket hasn't been cut")
                            } else if (res.status == 500) {
                                res.json().then(er => {
                                    onChangedTicketError(`Server error : ${er.error}`)
                                })
                            }
                        }
                    }
                })
            }
            else {
                onChangedTicketError('You aren\'t logged in');
            }
        }).catch(exc => {
            onChangedTicketError(JSON.stringify(exc))
        })
    }

    function cutTicket() {
        loadData('token').then(t => {
            if (t.success) {
                const token = t.result;
                fetch(`${URL}/check/proshow/${encodeURIComponent(qrCode.trim())}/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }).then(res => {
                    if (res.ok) {
                        res.json().then(by => {
                            onChangedTicketError(`Ticket cut by ${by.added_by}`)
                        })
                    } else if (res.status == 401) {
                        onChangedTicketError('You\'re not logged in')
                    } else if (res.status == 403) {
                        onChangedTicketError("Session timed out, log in again!")
                    } else if (res.status == 500) {
                        res.json().then(er => {
                            onChangedTicketError(`Server/Database error : ${er.error}`)
                        })
                    } else if (res.status == 409 || res.status == 400) {
                        res.json().then(er => {
                            onChangedTicketError(er.error)
                        })
                    } else {
                        onChangedTicketError(`Unexpected error ${res.status}`)
                    }
                })
            }
        })
    }

    return (
        <View style={styles.container}>
            <View style={tabStyles.container}>
                <View style={tabStyles.toggleContainer}>
                    <TouchableOpacity
                        style={[tabStyles.button, userInfoTab && tabStyles.activeButton, tabStyles.leftButton]}
                        onPress={() => setUserInfoTab(true)}
                    >
                        <Text style={[tabStyles.buttonText, userInfoTab && tabStyles.activeText]}>User Info</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[tabStyles.button, !userInfoTab && tabStyles.activeButton, tabStyles.rightButton]}
                        onPress={() => setUserInfoTab(false)}
                    >
                        <Text style={[tabStyles.buttonText, !userInfoTab && tabStyles.activeText]}>Cut Ticket</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.cameraWrapper}>
                <CameraView style={styles.camera} ratio='1:1' facing={facing} onBarcodeScanned={scanQR}></CameraView>
            </View>
            <View>
                <Text style={{ color: 'white' }}>User ID</Text>
                <TextInput style={styles.input} placeholderTextColor={'#888'} placeholder='UserID' onChangeText={onChangeQRCode} value={qrCode} />
            </View>
            {
                userInfoTab &&
                <View>
                    <View style={{ flexDirection: 'row', margin: 5, justifyContent: 'center' }}>
                        <Button title='Get info' onPress={() => { getUserInfo() }} />
                        <Button title='Clear' onPress={() => { onChangeUserInfo(null); onChangedTicketError(''); }} />
                    </View>
                    <View
                        style={{
                            flexDirection: 'column',
                            margin: 0
                        }}
                    >
                        <Text style={{ fontSize: 16, color: 'red' }}>{error}</Text>
                        {userInfo != null &&
                            <View>
                                <Text style={styles.text}>Name : {`${userInfo.user.first_name} ${userInfo.user.last_name}`}</Text>
                                <Text style={styles.text}>Pass : {`${userInfo.pass == null ? 'No pass owned' : userInfo.pass.name}`}</Text>
                                <Text style={styles.text}>Reg No : <Text style={{ fontFamily: 'monospace' }}>{`${userInfo.user.mahe_registration_number ?? 'Not a MAHE student'}`}</Text></Text>
                                <Text style={styles.text}>Phone number : <Text style={{ fontFamily: 'monospace' }}>{`+91-${userInfo.user.phone_number?.substring(0, userInfo.user.phone_number.length / 2)} ${userInfo.user.phone_number?.substring(userInfo.user.phone_number.length / 2, userInfo.user.phone_number.length)}`}</Text></Text>
                                <Text style={styles.text}>e-mail : <Text style={{ fontFamily: 'monospace' }}>{userInfo.user.email_address}</Text></Text>
                            </View>
                        }
                    </View>
                </View>
            }
            {
                !userInfoTab &&
                <View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', margin: 5 }}>
                        <Button title='Check Status' onPress={() => { getTicketStatus() }} />
                        <Button title='Cut Ticket' onPress={() => { cutTicket() }} />
                        <Button title='Clear' onPress={() => { onChangeShowTicket(false); onChangeTicketInfo(null); onChangedTicketError('') }} />
                    </View>
                    <Text style={{ color: '#fff', padding: 5 }}>{ticketError}</Text>
                    {
                        showTicket &&
                        <View>
                            {
                                ticketInfo == null &&
                                <Text style={{ color: '#fff', fontSize: 16 }}>User's ticket has not been cut</Text>
                            }
                            {
                                ticketInfo != null &&
                                <View>
                                    <Text style={{ color: '#fff', fontSize: 16 }}>Cut by : {ticketInfo?.given_by}</Text>
                                    <Text style={{ color: '#fff', fontSize: 16 }}>Cut on : {displayDateTime(new Date(ticketInfo.time))}</Text>
                                </View>

                            }
                        </View>
                    }
                </View>
            }


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
        fontFamily: 'monospace',
    },
    container: {
        backgroundColor: '#25292e',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    cameraWrapper: {
        width: 250,  // Fixed width
        height: 250, // Fixed height (1:1 aspect ratio)
        overflow: 'hidden',
        borderRadius: 10, // Optional: Rounded corners
    },
    camera: {
        flex: 1, // Fill the wrapper
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

const tabStyles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#25292e',
        paddingHorizontal: 30,
        margin: 10
    },
    toggleContainer: {
        flexDirection: 'row',
        borderRadius: 13,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    button: {
        flex: 1,
        paddingVertical: 6,
        alignItems: 'center',
        backgroundColor: '#ccc',
    },
    activeButton: {
        backgroundColor: '#007AFF',
    },
    leftButton: {
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
    },
    rightButton: {
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
    },
    buttonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'black',
    },
    activeText: {
        color: 'white',
    }
});