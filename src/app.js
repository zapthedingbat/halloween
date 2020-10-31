const fs = require("fs");
const path = require("path");

const URL = "/tale.txt";

function html(request, response) {
  fs.readFile(path.resolve(__dirname, "assets/source.txt"), "utf-8", function (
    err,
    data
  ) {
    if (err) {
      console.log(err);
    }
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.writeHead(200);
    response.end(
      `<!DOCTYPE html><html style=white-space:pre;font-family:monospace;>${data.replace(
        "@zapthedingbat",
        "<a href=//twitter.com/zapthedingbat style=color:inherit>@zapthedingbat</a>"
      )}<script src=#></script>

<script async src="https://www.googletagmanager.com/gtag/js?id=${
        process.env.GOOGLE_MEASUREMENT_ID
      }"></script>
<script>
window.dataLayer = [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${process.env.GOOGLE_MEASUREMENT_ID}');
</script>`
    );
  });
}

function load(request, response) {
  fs.readFile(path.resolve(__dirname, "../dist/load.weird.js"), function (
    err,
    data
  ) {
    if (err) {
      console.log(err);
    }
    response.setHeader("Refresh", `0; url=${URL}`);
    response.setHeader("Content-Type", "text/javascript");
    response.writeHead(200);
    response.end(data);
  });
}

function source(request, response) {
  fs.readFile(path.resolve(__dirname, "assets/source.txt"), function (
    err,
    data
  ) {
    if (err) {
      console.log(err);
    }
    response.setHeader("Refresh", `0; url=${URL}`);
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.writeHead(200);
    response.end(data);
  });
}

function scriptImage(request, response) {
  fs.readFile(path.resolve(__dirname, "../dist/client.weird.jpg"), function (
    err,
    data
  ) {
    if (err) {
      console.log(err);
    }
    response.setHeader("Content-Type", "image/jpeg");
    response.writeHead(200);
    response.end(data);
  });
}

function app(request, response) {
  console.log(request.url, request.headers["user-agent"]);

  if (request.url !== URL) {
    response.setHeader("Location", URL);
    response.writeHead(302);
    response.end("");
    return;
  }

  const acceptHeader = request.headers["accept"];
  const acceptTypes = acceptHeader ? acceptHeader.split(",") : [];
  if (acceptTypes.length === 1 && acceptTypes[0] === "*/*") {
    load(request, response);
    return;
  }

  if (acceptTypes.length === 1 && acceptTypes[0] === "image/jpeg") {
    scriptImage(request, response);
    return;
  }

  if (
    !acceptTypes.includes("text/html") &&
    acceptTypes.some((h) => /image\//.test(h))
  ) {
    source(request, response);
    return;
  }

  const cacheControlHeader = request.headers["cache-control"];
  if (
    !acceptHeader ||
    !cacheControlHeader ||
    !/max-age=0/.test(cacheControlHeader)
  ) {
    source(request, response);
    return;
  }

  html(request, response);
}

module.exports = app;
