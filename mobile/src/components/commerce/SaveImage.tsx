import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

export const saveImageToDownloads = async (
  uri: string,
  fileName?: string
): Promise<boolean> => {
  try {
    // Ask permission (only needed on Android for media)
    if (Platform.OS === "android") {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission not granted");
      }
    }

    // Pick filename
    const name = fileName || uri.split("/").pop()?.split("?")[0] || "image.jpg";
    const fileUri = FileSystem.documentDirectory + name;

    // Download to app storage
    await FileSystem.downloadAsync(uri, fileUri);

    if (Platform.OS === "android") {
      // Save to gallery / Downloads
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync("Download", asset, false);
      console.log("✅ Saved to Downloads:", asset.uri);
      return true;
    } else {
      // iOS → Share dialog (no Downloads folder)
      await Sharing.shareAsync(fileUri);
      return true;
    }
  } catch (err) {
    console.error("❌ Save failed:", err);
    throw err;
    return false;
  }
};
