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

let ctx;
let photo;
const SIZE = 296

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
        ctx.fillStyle = 'purple';
        ctx.fillRect(0, 0, SIZE, SIZE/4);
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
                    // quality={RNCamera.Constants.VideoQuality.720p}
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
                <View style={{
                    flexDirection: "row",
                    justifyContent: "center"
                }}>
                    <View style={{ width: SIZE }}>
                        <Canvas key="hihi" ref={this.handleCanvas} />
                    </View>

                </View>
            </View>
        );
    }

    takePicture = () => {
        if (this.camera) {
            const options = {
                width: SIZE,
                quality: 1.0, // 0.77
                forceUpOrientation: true,
                exif: true
            };
            this.camera.takePictureAsync(options).then(data => {
                this.setState({ imgs: [...this.state.imgs, data.uri] });

                RNFS.readFile(data.uri, "base64")
                    .then(result => {
                        photo.src = "data:image/jpg;base64," + result;
                        photo.addEventListener("load", () => {

                            ctx.drawImage(photo, 0, data.height / 8 * 3, data.width, data.height / 4 , 0, 0, SIZE, SIZE / 4).then(() => {
                                ctx
                                    .getImageData(0, 0, SIZE, SIZE / 4)
                                    .then(myGetImageData => {

                                        const GrayImage = [];
                                        const data = myGetImageData.data;
                                        const data_length = Object.keys(data).length;

                                        for (let i = 0; i < data_length; i += 4) {
                                            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
                                            GrayImage.push(gray);
                                        }

                                        const res = [];
                                        let tmp = [];
                                        let num = 0;
                                        for (let i in GrayImage) {
                                            num++;
                                            tmp.push(GrayImage[i]);
                                            if (num == SIZE) {
                                                num = 0;
                                                res.push(tmp);
                                                tmp = [];
                                            }
                                        }

                                        for(let i = 0; i < SIZE/4; i+= SIZE/4){
                                            for(let j = 0; j < SIZE; j+= SIZE/4){
                                                const hist = []
                                                for(let k = 0; k < 32; k++)
                                                    hist.push(1)
                                                for(let x = i ; x < i + SIZE/4; x++ ){
                                                    for(let y = j; y < j + SIZE/4; y++ ){
                                                        hist[parseInt(res[x][y] / 8)] += 1;
                                                    }
                                                }

                                                const histR = []
                                                for(let k = 1; k < 32; k++){
                                                    histR.push(hist[k] / hist[k-1])
                                                }

                                                let mx = -1
                                                let mx_index = 12
                                                for(let k = 0; k < 31; k++){
                                                    if(mx < histR[k] && hist[k+1] >= 500){
                                                        mx = histR[k]
                                                        mx_index = k
                                                    }
                                                }

                                                for(let k = mx_index; k >= 0; k--){
                                                    if(histR[k] < 3.0){
                                                        mx_index = k + 1
                                                        break;
                                                    }
                                                }

                                                for(let x = i ; x < i + SIZE/4; x++ ){
                                                    for(let y = j; y < j + SIZE/4; y++ ){
                                                        res[x][y] = (res[x][y] < mx_index * 8) ? 1 : 0;
                                                    }
                                                }
                                            }
                                        }

                                        let str = "\n"
                                        for(let i = 0; i < SIZE/4; i+=2){
                                            for(let j = 0; j < SIZE; j+=2){
                                                str = str + res[i][j]
                                            }
                                            str = str + "\n"
                                        }
                                        console.log(str)
                                    });
                                }
                            );
                        });
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
