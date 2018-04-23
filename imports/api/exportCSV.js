export const exportCSV = (headerCSV, bodyCSV, filename) => {

  // ** must add '\ueff' to prevent broken korean font
  const blob = new Blob(['\ufeff' + headerCSV + '\r\n' + bodyCSV], {
    type: 'text/csv;charset=utf-8;'
  });

  if (navigator.msSaveOrOpenBlob) {
    navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    downloadAnchor(URL.createObjectURL(blob), filename);
  }
}

// function to generate download anchor
const downloadAnchor = (content, filename) => {
  const anchor = document.createElement('a');
  anchor.style = 'display:none !important';
  anchor.id = 'downloadanchor';
  document.body.appendChild(anchor);

  if ('download' in anchor) {
    anchor.download = filename;
  }
  anchor.href = content;
  anchor.click();
  anchor.remove();
};
