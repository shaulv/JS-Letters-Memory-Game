export default class LS {

    static setData(key, array) {
        if (key && array && typeof (array) === 'object' && typeof (key) === 'string') {
            localStorage.setItem(key, JSON.stringify(array));
            return true;
        } else {
            console.log("Error! [key] & [array] are a must!\n[key] type has to be a string and the [array] has to be an object")
            return false;
        }
    }

    static removeData(key) {
        if (key && typeof (key) === 'string') {
            localStorage.removeItem(key);
            return true;
        } else {
            console.log("Error! [key] is a must!\n[key] type has to be a string")
            return false;
        }
    }

    static readData(key) {
        if (key && typeof (key) === 'string') {
            const storage = JSON.parse(localStorage.getItem(key));
            if (storage) {
                return storage;
            } else {
                return false;
            }
        } else {
            console.log("Error! [key] & [array] are a must!\n[key] type has to be a string and the [array] has to be an object")
            return false;
        }
    }

}

