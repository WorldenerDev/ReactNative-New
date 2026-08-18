// utils/formDataHelper.js
import { Platform } from "react-native";

const isImageFile = (value) =>
  typeof value === "object" && value?.uri && value?.name && value?.type;

/** Normalize RN file objects so multipart uploads work on iOS and Android. */
export const appendFileToFormData = (formData, fieldName, file) => {
  if (!file?.uri) {
    return;
  }

  let uri = file.uri;
  if (Platform.OS === "ios" && !uri.startsWith("file://")) {
    uri = `file://${uri}`;
  }

  const rawType = (file.type || "image/jpeg").toLowerCase();
  const type =
    rawType === "image/heic" || rawType === "image/heif"
      ? "image/jpeg"
      : rawType;

  const name = /\.(jpe?g|png|webp)$/i.test(file.name || "")
    ? file.name.replace(/\.(heic|heif)$/i, ".jpg")
    : `upload_${Date.now()}.jpg`;

  formData.append(fieldName, { uri, type, name });
};

export const objectToFormData = (obj) => {
  const formData = new FormData();

  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }

    if (isImageFile(value)) {
      appendFileToFormData(formData, key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
};

export const buildUpdateProfileFormData = ({
  name,
  phone_number,
  email,
  gender,
  dob,
  nationality,
  image,
}) => {
  const formData = new FormData();

  formData.append("name", name);
  if (phone_number) {
    formData.append("phone_number", phone_number);
  }

  if (email) {
    formData.append("email", email);
  }
  if (gender) {
    formData.append("gender", gender);
  }
  if (dob) {
    formData.append("dob", dob);
  }
  if (nationality) {
    formData.append("nationality", nationality);
  }

  appendFileToFormData(formData, "image", image);

  return formData;
};

export const buildCreateGroupFormData = ({
  groupName,
  groupImage,
  phoneNumbers,
  message,
}) => {
  const formData = new FormData();
  formData.append("groupName", groupName);
  if (phoneNumbers?.length) {
    phoneNumbers.forEach((phone) => formData.append("phoneNumbers[]", phone));
  }
  if (message) {
    formData.append("message", message);
  }
  appendFileToFormData(formData, "groupImage", groupImage);
  return formData;
};

export const buildUpdateGroupFormData = ({ groupName, groupImage }) => {
  const formData = new FormData();
  if (groupName?.trim()) {
    formData.append("groupName", groupName.trim());
  }
  appendFileToFormData(formData, "groupImage", groupImage);
  return formData;
};

export const extractProfileImagePath = (response) =>
  response?.data?.image ||
  response?.data?.user?.image ||
  response?.image ||
  response?.data?.profileImage ||
  null;
