import React from "react";

export const apiBaseURL = "https://www.bits-oasis.org/2025/main/signings";

//* Adds/sets a key-value pair to an 'object' state
export function setStateItem(state, key, value) {
    const object = {...state};
    object[key] = value;
    return object;
}

export function setStateItems(state, obj) {
    const tempObject = {...state};
    for (let key in obj) tempObject[key] = obj[key];
    return tempObject;
}
