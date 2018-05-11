"use strict";
import React, { Component } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image
} from "react-native";
import { RNCamera } from "react-native-camera";
import RNFS from "react-native-fs";

function b64toByte(b64Data, sliceSize) {
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    return byteArrays;
}

export default class BadInstagramCloneApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            imgs: []
        };
    }
    render() {
        return (
            <View style={styles.container}>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        backgroundColor: "white"
                    }}
                >
                    {this.state.imgs.map(uri => {
                        return (
                            <Image
                                key={uri}
                                style={{ width: 40, height: 40 }}
                                source={{ uri: uri }}
                                onLoad={e => console.log("loaded!", e)}
                            />
                        );
                    })}
                </View>
                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    style={styles.preview}
                    type={RNCamera.Constants.Type.back}
                    flashMode={RNCamera.Constants.FlashMode.on}
                    permissionDialogTitle={"Permission to use camera"}
                    permissionDialogMessage={
                        "We need your permission to use your camera phone"
                    }
                />
                <View
                    style={{
                        flex: 0,
                        flexDirection: "row",
                        justifyContent: "center"
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            this.takePicture();
                        }}
                        style={styles.capture}
                    >
                        <Text style={{ fontSize: 14 }}> SNAP </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    takePicture = () => {
        if (this.camera) {
            const options = { quality: 0.5, base64: true };
            this.camera.takePictureAsync(options).then(data => {
                this.setState({ imgs: [...this.state.imgs, data.uri] });

                RNFS.readFile(data.uri, "base64")
                    .then(result => {
                        var byte8bit = b64toByte(result);

                        console.log("blob", byte8bit);
                    })
                    .catch(err => {
                        console.log("err", err);
                    });
            });

        }
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column"
    },
    preview: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center"
    },
    capture: {
        flex: 0,
        backgroundColor: "#fff",
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: "center",
        margin: 20
    }
});
