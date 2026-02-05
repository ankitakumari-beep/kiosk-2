self.onmessage = async (e) => {
  const { file, index } = e.data;

  try {
    const buffer = await file.arrayBuffer();

    self.postMessage({
      index,
      buffer,
      mime: file.type
    });
  } catch (err) {
    self.postMessage({
      index,
      error: err.message
    });
  }
};
