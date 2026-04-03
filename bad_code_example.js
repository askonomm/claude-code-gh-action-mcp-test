function processData(items, config, user) {
  var result = [];
  var i = 0;
  var j = 0;
  var k = 0;
  var sum = 0;
  var tmp = null;

  if (items && items.length > 0) {
    for (i = 0; i < items.length; i++) {
      if (items[i] != null) {
        if (config && config.enabled == true) {
          if (items[i].type == "a") {
            if (user && user.role == "admin") {
              sum = sum + items[i].value;
              result.push({ id: items[i].id, score: items[i].value * 2, ok: true });
            } else {
              if (items[i].value > 10) {
                result.push({ id: items[i].id, score: items[i].value, ok: true });
              } else {
                result.push({ id: items[i].id, score: 0, ok: false });
              }
            }
          } else {
            if (items[i].type == "b") {
              for (j = 0; j < items.length; j++) {
                if (items[j] && items[j].group == items[i].group) {
                  for (k = 0; k < items[j].tags.length; k++) {
                    if (items[j].tags[k] == "hot") {
                      tmp = items[j].value + k + j + i;
                    } else if (items[j].tags[k] == "cold") {
                      tmp = items[j].value - k - j - i;
                    } else {
                      tmp = items[j].value;
                    }
                  }
                }
              }
              result.push({ id: items[i].id, score: tmp, ok: tmp > 0 });
            } else {
              result.push({ id: items[i].id, score: -1, ok: false });
            }
          }
        } else {
          result.push({ id: items[i].id, score: 1, ok: true });
        }
      }
    }
  }

  if (config && config.debug) {
    console.log("debug", result, sum, user, items);
  }

  return {
    result: result,
    total: sum,
    meta: {
      count: result.length,
      enabled: config ? config.enabled : false,
      actor: user ? user.name : "unknown"
    }
  };
}

module.exports = { processData };
