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
import Canvas, { Image as CanvasImage } from "react-native-canvas";
import { uploadImageToStatistic } from "./math";

let ctx;
let photo;
const SIZE = 296;

export default class BadInstagramCloneApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            imgs: [],
            src: ""
        };
    }
    handleCanvas = canvas => {
        photo = new CanvasImage(canvas);
        ctx = canvas.getContext("2d");
        ctx.fillStyle = "purple";
        ctx.fillRect(0, 0, SIZE, SIZE / 4);
    };
    render() {
        return (
            <View style={styles.container}>
                <RNCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    style={styles.preview}
                    type={RNCamera.Constants.Type.back}
                    flashMode={RNCamera.Constants.FlashMode.off}
                    onCameraReady={() => {
                        // console.log("onCameraReady")
                        // this.takePicture()
                    }}
                    permissionDialogTitle={"Permission to use camera"}
                    permissionDialogMessage={
                        "We need your permission to use your camera phone"
                    }
                />
                <View
                    style={{
                        aspectRatio: 4,
                        width: "100%",
                        alignItems: "center",
                        backgroundColor: "#FFFFFF50",
                        marginTop: "-62.5%"
                    }}
                />
                <View
                    style={{
                        marginTop: "37.5%",
                        width: "100%"
                    }}
                />
                <View
                    style={{
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
                        <View>
                            <Text style={{ fontSize: 14 }}> SNAP </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "center"
                    }}
                >
                    <View style={{ width: SIZE }}>
                        <Canvas key="hihi" ref={this.handleCanvas} />
                    </View>
                </View>
            </View>
        );
    }
    takePicture = () => {
        const options = {
            width: SIZE,
            base64: true
        };
        return this.camera.takePictureAsync(options).then(data => {
            photo.src = "data:image/jpg;base64," + data.base64;

            return photo.addEventListener("load", () => {
                return ctx
                    .drawImage(photo, 0, data.height / 8 * 3, data.width, data.height / 4, 0, 0, SIZE, SIZE / 4 )
                    .then(() => {
                        return ctx.getImageData(0, 0, SIZE, SIZE / 4)
                            .then(myGetImageData => {
                                return uploadImageToStatistic(myGetImageData.data, SIZE)
                            });
                    });
            });
        });
    };
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "column",
        backgroundColor: "white"
    },
    preview: {
        justifyContent: "flex-end",
        aspectRatio: 1,
        alignItems: "center"
    },
    capture: {
        marginTop: 20,
        padding: 20
    }
});
