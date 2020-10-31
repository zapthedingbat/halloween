(function (win, doc) {
  var DRIP_RADIUS = 3;
  var DRIP_GROW_RATE = 0.1;
  var DROP_SPEED = 0.5;
  var ACCELERATION = 0.5;
  var START_CHANCE = 0.0001;

  // Remove the script tags
  Array.prototype.slice
    .call(doc.getElementsByTagName("script"))
    .forEach(function (script) {
      script.parentElement.removeChild(script);
    });

  function frame(ctx, hits) {
    var height = ctx.canvas.height;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    hits.forEach(function (hit, i) {
      // Update state
      var radius = hit.radius;
      var trail = hit.trail;

      if (radius === 0 && Math.random() < START_CHANCE) {
        // Start drip growing
        radius = DRIP_GROW_RATE;
      } else if (radius > 0 && radius < DRIP_RADIUS) {
        // Grow drip
        radius += DRIP_GROW_RATE;
      }

      if (radius > DRIP_RADIUS && trail === 0) {
        // Start dropping
        trail = DROP_SPEED;
      } else if (trail < height) {
        // Drop
        trail = trail + trail * ACCELERATION;
      } else {
        // Restart
        radius = 0;
        trail = 0;
      }

      hits[i].trail = trail;
      hits[i].radius = radius;

      // Draw
      var x = hit.x;
      var y = hit.y + trail + radius;

      ctx.beginPath();
      ctx.moveTo(x, y - (radius + trail));

      ctx.bezierCurveTo(x, y - radius, x - radius, y - radius, x - radius, y);
      ctx.bezierCurveTo(
        x - radius,
        y + radius,
        x + radius,
        y + radius,
        x + radius,
        y
      );
      ctx.bezierCurveTo(
        x + radius,
        y - radius,
        x,
        y - radius,
        x,
        y - (radius + trail)
      );
      ctx.fill();
    });

    win.requestAnimationFrame(function () {
      frame(ctx, hits);
    });
  }

  function draw(ctx, x, y, height, width) {
    // Draw the text
    ctx.font = "normal 10pt monospace";
    var lineHeight = 15;
    var lines = document.body.innerText.split("\n");
    for (var j = 0; j < lines.length; j++) {
      ctx.fillText(lines[j], 0, 0 + j * lineHeight);
    }

    // Get text pixel data
    var textPixelData = ctx.getImageData(0, 0, width, height);
    ctx.clearRect(0, 0, width, height);

    var hits = [];
    var pixelData = textPixelData.data;
    for (var i = 0; i < pixelData.length; i += 4) {
      var a = pixelData[i + 3];
      if (a >= 255) {
        hits.push({
          x: (i / 4) % width,
          y: Math.floor(i / 4 / width),
          trail: 0,
          radius: 0,
        });
      }
    }
    ctx.fillStyle = "red";
    frame(ctx, hits);
  }

  function generateImage(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.globalAlpha = 1;
    ctx.filter = "none";
    ctx.globalCompositeOperation = "source-over";
    ctx.textBaseline = "hanging";

    const { height, width } = ctx.canvas;
    draw(ctx, 0, 0, width, height);
  }

  doc.body.style.height = doc.documentElement.style.height = "100%";
  doc.body.style.overflow = doc.documentElement.style.overflow = "hidden";

  const canvas = doc.createElement("canvas");
  canvas.height = 512;
  canvas.width = 650;
  canvas.style.position = "absolute";
  canvas.style.zIndex = "-1";
  const context = canvas.getContext("2d");
  doc.body.insertBefore(canvas, doc.body.firstChild);

  generateImage(context);
})(window, document);
