export function download(content, name, type = 'text/plain') {
  const url = URL.createObjectURL(
      content instanceof Blob ? content : new Blob([content], { type }),
    ),
    a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
