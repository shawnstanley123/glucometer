import { SafeAreaView, Text, TextInput, TouchableOpacity, View, FlatList, StyleSheet } from 'react-native';
import React from 'react';
import { Feather, MaterialIcons } from '@expo/vector-icons';

export default function MessageItem({message,currentUser}) {
    console.log(message?.isRead)
    if(currentUser==message.userId){
    return (
        <View className="flex-row justify-end mb-3 mr-3">
            <View className="bg-gray-600 rounded-lg px-4 py-2">
                <Text className="text-white">{message?.text || ''}</Text>
                <View className="flex-row items-center justify-end mt-1">
            {/* Tick Icon */}
            {message?.isRead ? (
                <MaterialIcons name="done-all" size={16} color="#1E90FF" /> // Blue double tick for read
            ) : (
                <MaterialIcons name="done-all" size={16} color="#FFFFFF" /> // White double tick for not read
            )}
        </View>
            </View>
        </View>
    )}
    else{
        return (
            <View className="flex-row justify-start mb-3 ml-3">
                <View className="bg-gray-300 rounded-lg px-4 py-2">
                    <Text>{message?.text || ''}</Text>
                </View>
            </View>
        )
    }
}