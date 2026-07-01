import api from "./api";
import { DetectionResponse } from "../types/detection";

type UploadFile = {
  uri: string;
  name: string;
  type: string;
};

export async function detectGarbage(
  imageUri: string,
  latitude: number,
  longitude: number,
): Promise<DetectionResponse> {
  const formData = new FormData();

  const file: UploadFile = {
    uri: imageUri,
    name: "image.jpg",
    type: "image/jpeg",
  };

  formData.append("file", file as never);

  formData.append("latitude", latitude.toString());

  formData.append("longitude", longitude.toString());

  const response = await api.post("/detect", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
