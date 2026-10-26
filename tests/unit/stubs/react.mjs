// Hooks are never rendered in unit tests; modules only need the names to exist.
export const useState = (v) => [typeof v === "function" ? v() : v, () => {}];
export const useEffect = () => {};
export const useRef = (v) => ({ current: v });
export const useMemo = (f) => f();
export const createElement = () => null;
export const Fragment = "Fragment";
export default { useState, useEffect, useRef, useMemo, createElement, Fragment };
