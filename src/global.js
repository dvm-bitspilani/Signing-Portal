import React from "react";

export function setStateItem(state, key, value) {
    const object = {...state};
    object[key] = value;
    return object;
}