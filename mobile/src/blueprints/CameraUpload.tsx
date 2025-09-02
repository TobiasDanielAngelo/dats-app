import React, { useState } from "react";
import { Button, Image, View, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function CameraUpload() {
  const [photo, setPhoto] = useState<any>(null);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Camera access is needed");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const uploadPhoto = async () => {
    if (!photo) return;
    const data = new FormData();
    data.append("image", {
      uri: photo.uri,
      name: "photo.jpg",
      type: "image/jpeg",
    } as any);

    await fetch("https://your-api-endpoint.com/upload", {
      method: "POST",
      body: data,
      headers: { "Content-Type": "multipart/form-data" },
    });
    Alert.alert("Uploaded!");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Take Photo" onPress={takePhoto} />
      {photo && (
        <>
          <Image
            source={{ uri: photo.uri }}
            style={{ width: 200, height: 200 }}
          />
          <Button title="Upload" onPress={uploadPhoto} />
        </>
      )}
    </View>
  );
}
