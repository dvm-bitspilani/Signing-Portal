import React from "react";
import { API_BASE_URL, MERCH_BASE_URL } from "../keyconfig.js";

export const apiBaseURL = API_BASE_URL;
export const merchBaseURL = MERCH_BASE_URL;
//* Adds/sets a key-value pair to an 'object' state
export function setStateItem(state, key, value) {
  const object = { ...state };
  object[key] = value;
  return object;
}

export function setStateItems(state, obj) {
  const tempObject = { ...state };
  for (let key in obj) tempObject[key] = obj[key];
  return tempObject;
}
