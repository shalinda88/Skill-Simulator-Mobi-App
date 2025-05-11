import React from "react";
import {View,SafeAreaView,StyleSheet} from "react-native";
import Header from "../components/Header";
import Footer from "../components/Footer";


const Layout = ({children}) =>{
    return(
        <SafeAreaView style={styles.container}>
            <Header/>
            <View style={styles.content}>
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: 'white',
    },
    content:{
        flex: 1,
    }
});

export default Layout;