import getStorageStorageName from "./getStorageName";
const hasStorageName = (value: any, storageName: string): boolean => {
    if (value && typeof value.__withStorageName === "string") {
        if (storageName) {
            return getStorageStorageName(value) === storageName;
        }
        return true;
    }
    return false;
};

export default hasStorageName;
