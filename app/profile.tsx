import { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Link } from "expo-router";
import type { Result } from "@/components/Result";

const URL = 'https://solstice.mitblrfest.org';

export interface CheckerUserLogin {
    user: string;
    pass: string;
}
export interface CheckerUserLoginResponse {
    token: string;
}
export interface CheckerUserLoginError {
    error: string;
}

export default function Profile() {
    const [username, onChangeUsername] = useState("")
    const [password, onChangePassword] = useState("")
    const [loggedIn, onChangeLoggedIn] = useState(false);
    const [errorText, onChangedError] = useState('')

    const login = async () => {
        const res = await fetch(`${URL}/check/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user: username, pass: password } as CheckerUserLogin)
        })

        if (res.ok) {
            onChangeLoggedIn(true)
        } else if (res.status == 403) {
            onChangedError(`Invalid credentials`)
        }
    }

    return (
        <SafeAreaProvider
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}>
            <SafeAreaView
                style={{
                    padding: 30
                }}
            >
                <Text>Should be google log in later. For now, we will do manual log in</Text>
                {
                    !loggedIn &&
                    <View>
                        <TextInput
                            style={styles.input}
                            onChangeText={onChangeUsername}
                            placeholder={'Username'}
                        />
                        <TextInput
                            style={styles.input}
                            onChangeText={onChangePassword}
                            placeholder={'Password'}
                            secureTextEntry={true}
                        />
                        <Button title="Log in" onPress={() => { login() }} />
                        <Text style={{ color: "red" }}>{errorText}</Text>
                    </View>
                }

                {loggedIn && <View>
                    <Text style={{ color: 'green' }}>Logged in succesfully!</Text>
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
    },
});