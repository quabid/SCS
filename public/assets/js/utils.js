export const stringify = (arg = {}) => {
  if (null != arg && undefined != arg) {
    return JSON.stringify(arg);
  }
  return false;
};
export const parse = (arg = {}) => {
  if (null != arg && undefined != arg) {
    return JSON.parse(arg);
  }
  return false;
};
export const log = console.log.bind(console);
export const table = console.table.bind(console);
export const error = console.error.bind(console);
export const cls = console.clear.bind(console);

export const addHandler = (theElement, whichEvent, method) => {
  if (null != theElement && null != whichEvent && typeof method == "function") {
    theElement.addEventListener(whichEvent, method);
  }
};

export const addAttribute = (theElement, whichAttribute, attributeValue) => {
  if (null != theElement) {
    theElement.setAttribute(whichAttribute, attributeValue);
  }
};

export const removeAttribute = (theElement, whichAttribute) => {
  if (null != theElement) {
    if (theElement.hasAttribute(whichAttribute)) {
      theElement.removeAttribute(whichAttribute);
    }
  }
};

export const getElement = (nameIdClass) => {
  let element = null;
  if (null != (element = document.querySelector(`${nameIdClass}`))) {
    return element;
  } else if (null != (element = document.querySelector(`#${nameIdClass}`))) {
    return element;
  } else if (null != (element = document.querySelector(`.${nameIdClass}`))) {
    return element;
  }
  return null;
};

export const size = (arg = null) => {
  if (null != arg) {
    if (Array.isArray(arg)) {
      return arg.length;
    } else if (arg instanceof Object && !Array.isArray(arg)) {
      return Object.keys(arg).length;
    } else if (
      !(arg instanceof Object) &&
      !Array.isArray(arg) &&
      typeof arg == "string"
    ) {
      return arg.length;
    } else {
      return NaN;
    }
  }
};

export const cap = (arg) => {
  let word_split = null,
    line = "",
    word = arg.toString();
  if (null !== word && undefined !== word) {
    if (
      word.trim().toLowerCase() === "id" ||
      word.trim().toLowerCase() === "ssn" ||
      word.trim().toLowerCase() === "sku" ||
      word.trim().toLowerCase() === "vm" ||
      word.trim().toLowerCase() === "mac" ||
      word.trim().toLowerCase() === "imei" ||
      word.trim().toLowerCase() === "os" ||
      word.trim().toLowerCase() === "atm" ||
      word.trim().toLowerCase() === "pa" ||
      word.trim().toLowerCase() === "rjw"
    ) {
      return word.toUpperCase();
    } else if (word.match(/[-]/)) {
      if (null !== (word_split = word.split(["-"])).length > 0) {
        for (let i = 0; i < word_split.length; i++) {
          if (i < word_split.length - 1) {
            line +=
              word_split[i].substring(0, 1).toUpperCase() +
              word_split[i].substring(1) +
              "-";
          } else {
            line +=
              word_split[i].substring(0, 1).toUpperCase() +
              word_split[i].substring(1);
          }
        }
        return line;
      }
    } else if (word.match(/[ ]/)) {
      if (null !== (word_split = word.split([" "])).length > 0) {
        for (let i = 0; i < word_split.length; i++) {
          if (i < word_split.length - 1) {
            line +=
              word_split[i].substring(0, 1).toUpperCase() +
              word_split[i].substring(1) +
              " ";
          } else {
            line +=
              word_split[i].substring(0, 1).toUpperCase() +
              word_split[i].substring(1);
          }
        }
        return line;
      }
    } else {
      return word.substring(0, 1).toUpperCase() + word.substring(1);
    }
  }
};

export const appendChild = (parent, child) => {
  if (null != parent && null != child) {
    parent.appendChild(child);
  }
};

export const append = (parent, child) => {
  parent.append(child);
};

export const removeChildren = (parent) => {
  parent.querySelectorAll("*").forEach((dialog) => {
    dialog.remove();
  });
};

export const newElement = (type) => {
  if (null != type && typeof type == "string") {
    return document.createElement(type);
  }
  return null;
};
