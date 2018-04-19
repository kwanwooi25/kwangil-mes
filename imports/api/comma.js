export const comma = (str) => {
  str = String(str);
  return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, "$1,");
}

export const uncomma = (str) => {
  str = String(str);
  return str.replace(/[^\d]+/g, "");
}
