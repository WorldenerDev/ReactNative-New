// utils/formDataHelper.js

export const objectToFormData = (obj) => {
    const formData = new FormData();

    Object.entries(obj).forEach(([key, value]) => {
        if (value === null || value === undefined) return;

        // If the value is a file object (uri, name, type)
        if (
            typeof value === 'object' &&
            value?.uri &&
            value?.name &&
            value?.type
        ) {
            formData.append(key, value);
        } else {
            formData.append(key, String(value));
        }
    });

    return formData;
};
