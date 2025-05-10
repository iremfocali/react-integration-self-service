type TagParams = {
  name: string;
};

export default function CreateEvent(tagParams: TagParams) {
  // variablesObj icindeki arraylerin ikinci paratetresi o degiskenlerden array donup donmedigini kontrol edecek
  const config = {
    eventName: tagParams.name,
    variablesObj: {
      "OM.pbid": ["{{RMC-ecommerce.cart.basket_id}}", false],
      "OM.pb": ["{{RMC-CartArray-PB-JS}}", true],
      "OM.pu": ["{{RMC-CartArray-PU-JS}}", true],
      "OM.ppr": ["{{RMC-CartArray-PPR-JS}}", true],
      "OM.pbt": ["{{RMC-CartArray-PBT-JS}}", false],
    },
    isCollected: false,
  };
  const variablesCode = Object.entries(config.variablesObj)
    .map(([key, value]) => `  "${key}": ${value[0]}`)
    .join(",\n");
  const parametersCode = Object.entries(config.variablesObj)
    .map(([key, value]) => {
      if (value[1]) {
        return `VL.AddParameter("${key}", ${value[0]}.join(";"));`;
      } else {
        return `VL.AddParameter("${key}", ${value[0]});`;
      }
    })
    .join("\n");

  const tagCode = `
<script type="text/javascript">
  function on${config.eventName}Loaded() {
    var tagVars = \n${variablesCode}\n};
        
    var isCollected = ${config.isCollected};
    var VL = new Visilabs();

    if (checkException(tagVars)) {
      VL.AddParameter("OM.VLEventException", "True");
      VL.AddParameter("OM.VLEventExceptionName", "${config.eventName}");
      VL.Collect();
    } else {
      ${parametersCode}
    }

    if (!isCollected) {
      VL.Collect();
    }

    VL.SuggestActions();

    function checkException(tagVars) {
      var exceptionArray = ["null", "undefined", ""];
      var exception = false;
      for (var el in tagVars) {
        if (typeof tagVars[el] == Array) {
          for (var i = 0; i < tagVars[el].length; i++) {
            if (exceptionArray.includes(tagVars[el][i])) {
              exception = true;
              break;
            }
          }
        } else if (!tagVars[el] || exceptionArray.includes(tagVars[el])) {
          exception = true;
          break;
        }
      }
      return exception;
    }
  }

  if (typeof Visilabs !== "function") {
    var url = (location.protocol.indexOf("https") == 0 ? "https" : "http") +
      "://vsh.visilabs.net/Visilabs.min.js?sid=" + "{{RMC-sid}}" +
      "&oid=" + "{{RMC-oid}}";
    var script = document.createElement("script");
    if (location.href.toString().indexOf("vldebug=true") > 0) {
      url = (location.protocol.indexOf("https") == 0 ? "https" : "http") +
        "://vsh.visilabs.net/Visilabs_Debug.js?sid=" + "{{RMC-sid}}" +
        "&oid=" + "{{RMC-oid}}";
    }
    script.onload = on${config.eventName}Loaded;
    script.type = "text/javascript";
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  } else {
    on${config.eventName}Loaded();
  }
</script>`;

  return escapeForGTM(tagCode);
}

export function VariableToArray() {
  const variableCode = `function(){\n  var purchaseProductID = [];\n  {{RMC-ecommerce.checkout.products}}.forEach(function(product){\n    purchaseProductID.push(product.id);\n  });\n  return purchaseProductID;\n}`;
  return variableCode;
}

//helper function for string escapes
function escapeForGTM(input: string): string {
  return (
    input
      // Escape backslashes first in case they exist
      // .replace(/\\/g, "\\\\")
      // Escape double quotes
      .replace(/"/g, '\\"')
      // Escape single quotes (if needed)
      // .replace(/'/g, "\\'")
      // Replace real newline characters with the literal "\n"
      .replace(/\n/g, "\\n")
  );
}
