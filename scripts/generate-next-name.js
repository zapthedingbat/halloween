const codePoints = [];
for (var c = 11392; c <= 11492; c++) {
  codePoints.push(c);
}

let i = 0;

function generateNextName(name) {
  var r = i++ % codePoints.length;
  var res = String.fromCodePoint(codePoints[r]);
  var q = Math.floor(i / codePoints.length);
  while (q) {
    r = q % codePoints.length;
    q = Math.floor(q / codePoints.length);
    res = String.fromCodePoint(codePoints[r]) + res;
  }
  console.log(res);
  return res;
}

module.exports = generateNextName;
