import React from "react";

//* Adds/sets a key-value pair to an 'object' state
export function setStateItem(state, key, value) {
    const object = {...state};
    object[key] = value;
    return object;
}