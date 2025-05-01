function OnVisilabsCartLoaded() {
	var tagVars = {
		"OM.pbid": "{{RMC-ecommerce.cart.basket_id}}",
		"OM.pb": "{{RMC-CartArray-PB-JS}}",
		"OM.pu": "{{RMC-CartArray-PU-JS}}",
		"OM.ppr": "{{RMC-CartArray-PPR-JS}}",
		"OM.pbt": "{{RMC-CartArray-PBT-JS}}",
	};

	let isCollected = false;

	var VL = new Visilabs();

	if (checkException(tagVars)) {
		VL.AddParameter("OM.VLEventException", "True");
		VL.AddParameter("OM.VLEventExceptionName", "ProductBasket");
		VL.Collect();
	} else {
		VL.AddParameter("OM.pbid", tagVars.OM.pbid);
		VL.AddParameter("OM.pb", tagVars.OM.pb.join(";"));
		VL.AddParameter("OM.pu", tagVars.OM.pu.join(";"));
		VL.AddParameter("OM.ppr", tagVars.OM.ppr.join(";"));
		VL.AddParameter("OM.pbt", tagVars.OM.pbt);
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
	var url =
		(location.protocol.indexOf("https") == 0 ? "https" : "http") +
		"://vsh.visilabs.net/Visilabs.min.js?sid=" +
		"{{RMC-sid}}" +
		"&oid=" +
		"{{RMC-oid}}" +
		"";
	var script = document.createElement("script");
	if (location.href.toString().indexOf("vldebug=true") > 0) {
		url =
			(location.protocol.indexOf("https") == 0 ? "https" : "http") +
			"://vsh.visilabs.net/Visilabs_Debug.js?sid=" +
			"{{RMC-sid}}" +
			"&oid=" +
			"{{RMC-oid}}" +
			"";
	}
	script.onload = OnVisilabsCartLoaded;
	script.type = "text/javascript";
	script.src = url;
	document.getElementsByTagName("head")[0].appendChild(script);
} else OnVisilabsCartLoaded();
