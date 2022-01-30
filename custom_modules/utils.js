export const stringify = (obj) => {
  if (null != obj) {
    return JSON.stringify(obj);
  }
  return null;
};

export const parse = (jsonStr) => {
  if (null != jsonStr) {
    return JSON.parse(jsonStr);
  }
  return null;
};

export const keys = (obj) => {
  if (null != obj && !Array.isArray(obj) && typeof obj == "object") {
    return Object.keys(obj);
  }
  return null;
};
