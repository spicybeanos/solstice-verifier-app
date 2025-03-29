import { useState, useEffect } from "react";
import { Button, Text, TextInput, View } from "react-native";
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Link } from "expo-router";
import type { Result } from "@/components/Result";
import { loadData, saveData } from "@/components/PersistantStorage";
const URL = 'https://solstice.mitblrfest.org';

interface CheckerUserLogin {
    user: string;
    pass: string;
}
interface CheckerUserLoginResponse {
    token: string;
}
interface CheckerUserLoginError {
    error: string;
}
interface CheckerUserReset {
    pass: string;
    newPass: string;
}

export default function Profile() {
    const [username, onChangeUsername] = useState("")
    const [password, onChangePassword] = useState("")
    const [loggedIn, onChangeLoggedIn] = useState(false);
    const [errorText, onChangedError] = useState('')

    const [oldPass, onChangeOldPass] = useState('');
    const [newPass, onChangeNewPass] = useState('');
    const [repeatNewPass, onChangeRepeatNewPass] = useState('');
    const [resetError, onChangeResetError] = useState('')

    useEffect(() => {
        checkLoggedIn();
    }, []);

    const checkLoggedIn = () => {
        loadData('token').then(async (token) => {
            if (token.success == false) {
                onChangeLoggedIn(false)
            } else if (token.result == null || token.result == '') {
                onChangeLoggedIn(false)
            } else {
                loadData('username').then((usr) => {
                    onChangeUsername(usr.result)
                })
                onChangeLoggedIn(true)
            }
        })
    }

    const login = async () => {
        const res = await fetch(`${URL}/check/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user: username, pass: password } as CheckerUserLogin)
        })

        if (res.ok) {
            const t = await res.json() as CheckerUserLoginResponse;
            onChangeLoggedIn(true)
            saveData('username', username);
            saveData('token', t.token);
        } else if (res.status == 403) {
            onChangedError(`Invalid credentials`)
        }
    }

    const logout = () => {
        loadData('token').then((token) => {
            if (token.success) {
                fetch(`${URL}/check/logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token.result as string}`
                    },
                }).then(() => {
                    saveData('token', '').then(() => {
                        saveData('username', '').then(() => {
                            onChangeLoggedIn(false);
                        })
                    })
                });
            } else {
                onChangeResetError("You're not logged in.");
                return;
            }
        })
    }

    function resetPassword() {
        if (newPass != repeatNewPass) {
            onChangeResetError('New password not same as repeat new password.')
        } else {
            onChangeResetError('');
            loadData('token').then((token) => {
                if (token.success) {
                    fetch(`${URL}/check/reset`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token.result}`
                        },
                        body: JSON.stringify({ pass: oldPass, newPass: newPass } as CheckerUserReset)
                    })
                } else {
                    onChangeResetError(`You're not logged in`);
                    return;
                }
            });

        }
    }

    return (
        <SafeAreaProvider
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: '#25292e',
            }}>
            <SafeAreaView
                style={{
                    padding: 30
                }}
            >
                {
                    !loggedIn &&
                    <View>
                        <Text style={{ fontSize: 30, textAlign: "center", color: "#fff" }}>Log in as Checker</Text>
                        <Text style={{ color: '#fff' }}>Username</Text>
                        <TextInput
                            style={styles.input}
                            placeholderTextColor={'#888'}
                            onChangeText={onChangeUsername}
                        />
                        <Text style={{ color: '#fff' }}>Password</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={onChangePassword}
                            secureTextEntry={true}
                            placeholderTextColor={'#888'}
                        />
                        <Button color={"green"} title="Log in" onPress={() => { login() }} />
                        <Text style={{ color: "red" }}>{errorText}</Text>
                    </View>
                }

                {loggedIn && <View>
                    <Text style={{ fontSize: 40, color: '#ffffff' }}>{username}</Text>
                    <Text style={{ color: 'lightgreen', padding: 15, fontSize: 20 }}>Logged in succesfully!</Text>
                    <Button color={'red'} title="Log out" onPress={() => { logout() }} />
                    <View>
                        <Text style={{ color: 'red' }}>{resetError}</Text>
                        <TextInput placeholder="Old password" placeholderTextColor='#888' style={styles.input} onChangeText={onChangeOldPass} secureTextEntry={true} />
                        <TextInput placeholder="New password" placeholderTextColor='#888' style={styles.input} onChangeText={onChangeNewPass} secureTextEntry={true} />
                        <TextInput placeholder="Repeat new password" placeholderTextColor='#888' style={styles.input} onChangeText={onChangeRepeatNewPass} secureTextEntry={true} />
                        <Button title="Reset Password" onPress={() => { resetPassword() }} />
                    </View>
                </View>}

            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    input: {
        width: 300,
        height: 50,
        borderRadius: 10,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        borderColor: "#fff",
        color: '#fff'
    },
});