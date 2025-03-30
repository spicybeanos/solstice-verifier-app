import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';


export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#ffd33d',
                headerStyle: {
                    backgroundColor: '#25292e',
                },
                headerShadowVisible: false,
                headerTintColor: '#fff',
                tabBarStyle: {
                    backgroundColor: '#25292e',
                },
            }}
        >

            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={24} />
                    ),
                }}
            />
            <Tabs.Screen
                name="userscan"
                options={{
                    title: 'User Scan',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'id-card' : 'id-card-outline'} color={color} size={24} />
                    ),
                }}
            />
        </Tabs>
    );
}
