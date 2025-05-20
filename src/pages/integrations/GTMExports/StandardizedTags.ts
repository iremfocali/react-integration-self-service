// Standardized GTM tag implementations with consistent tagVars pattern

export const CartViewTag = {
  name: "RMC-CartView",
  html: `<script type="text/javascript">
  function onProductBasketLoaded() {
    var tagVars = {
      "OM.pbid": {{RMC-ecommerce.cart.basket_id}},
      "OM.pb": {{RMC-CartArray-PB-JS}},
      "OM.pu": {{RMC-CartArray-PU-JS}},
      "OM.ppr": {{RMC-CartArray-PPR-JS}},
      "OM.pbt": {{RMC-CartArray-PBT-JS}}
    };
    
    var isCollected = false;
    var VL = new Visilabs();

    if (checkException(tagVars)) {
      VL.AddParameter("OM.VLEventException", "True");
      VL.AddParameter("OM.VLEventExceptionName", "ProductBasket");
      VL.Collect();
      isCollected = true;
    } else {
      VL.AddParameter("OM.pbid", tagVars["OM.pbid"]);
      VL.AddParameter("OM.pb", tagVars["OM.pb"].join(";"));
      VL.AddParameter("OM.pu", tagVars["OM.pu"].join(";"));
      VL.AddParameter("OM.ppr", tagVars["OM.ppr"].join(";"));
      VL.AddParameter("OM.pbt", tagVars["OM.pbt"]);
    }

    if (!isCollected) {
      VL.Collect();
      VL.SuggestActions();
    }
  }

  function checkException(tagVars) {
    var exceptionArray = ["null", "undefined", ""];
    var exception = false;
    for (var el in tagVars) {
      if (Array.isArray(tagVars[el])) {
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

  if (typeof Visilabs !== "function") {
    var url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
      "://vsh.visilabs.net/Visilabs.min.js?sid=" + {{RMC-sid}} + 
      "&oid=" + {{RMC-oid}};
    var script = document.createElement("script");
    if (location.href.toString().indexOf("vldebug=true") > 0) {
      url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
        "://vsh.visilabs.net/Visilabs_Debug.js?sid=" + {{RMC-sid}} + 
        "&oid=" + {{RMC-oid}};
    }
    script.onload = onProductBasketLoaded;
    script.type = "text/javascript";
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  } else {
    onProductBasketLoaded();
  }
</script>`,
};

export const LoginTag = {
  name: "RMC-Login",
  html: `<script type="text/javascript">
  function onLoginLoaded() {
    var tagVars = {
      "OM.exVisitorID": {{RMC-UserID}},
      "OM.b_login": "1"
    };
    
    var isCollected = false;
    var VL = new Visilabs();

    if (checkException(tagVars)) {
      VL.AddParameter("OM.VLEventException", "True");
      VL.AddParameter("OM.VLEventExceptionName", "Login");
      VL.Collect();
      isCollected = true;
    } else {
      VL.AddParameter("OM.exVisitorID", tagVars["OM.exVisitorID"]);
      VL.AddParameter("OM.b_login", tagVars["OM.b_login"]);
    }

    if (!isCollected) {
      VL.Collect();
      VL.SuggestActions();
    }
  }

  function checkException(tagVars) {
    var exceptionArray = ["null", "undefined", ""];
    var exception = false;
    for (var el in tagVars) {
      if (Array.isArray(tagVars[el])) {
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

  if (typeof Visilabs !== "function") {
    var url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
      "://vsh.visilabs.net/Visilabs.min.js?sid=" + {{RMC-sid}} + 
      "&oid=" + {{RMC-oid}};
    var script = document.createElement("script");
    if (location.href.toString().indexOf("vldebug=true") > 0) {
      url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
        "://vsh.visilabs.net/Visilabs_Debug.js?sid=" + {{RMC-sid}} + 
        "&oid=" + {{RMC-oid}};
    }
    script.onload = onLoginLoaded;
    script.type = "text/javascript";
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  } else {
    onLoginLoaded();
  }
</script>`,
};

export const PageViewTag = {
  name: "RMC-PageView",
  html: `<script type="text/javascript">
  function onPageViewLoaded() {
    var tagVars = {};
    var isCollected = false;
    var VL = new Visilabs();

    // PageView doesn't require any specific parameters
    VL.Collect();
    VL.SuggestActions();
  }

  if (typeof Visilabs !== "function") {
    var url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
      "://vsh.visilabs.net/Visilabs.min.js?sid=" + {{RMC-sid}} + 
      "&oid=" + {{RMC-oid}};
    var script = document.createElement("script");
    if (location.href.toString().indexOf("vldebug=true") > 0) {
      url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
        "://vsh.visilabs.net/Visilabs_Debug.js?sid=" + {{RMC-sid}} + 
        "&oid=" + {{RMC-oid}};
    }
    script.onload = onPageViewLoaded;
    script.type = "text/javascript";
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  } else {
    onPageViewLoaded();
  }
</script>`,
};

export const SearchViewTag = {
  name: "RMC-SearchView",
  html: `<script type="text/javascript">
  function onSearchViewLoaded() {
    var tagVars = {
      "OM.OSS": {{RMC-Search}}.word,
      "OM.OSSR": {{RMC-Search}}.result
    };
    
    var isCollected = false;
    var VL = new Visilabs();

    if (checkException(tagVars)) {
      VL.AddParameter("OM.VLEventException", "True");
      VL.AddParameter("OM.VLEventExceptionName", "OnSiteSearch");
      VL.Collect();
      isCollected = true;
    } else {
      VL.AddParameter("OM.OSS", tagVars["OM.OSS"]);
      if (tagVars["OM.OSSR"]) {
        VL.AddParameter("OM.OSSR", tagVars["OM.OSSR"]);
      }
    }

    if (!isCollected) {
      VL.Collect();
      VL.SuggestActions();
    }
  }

  function checkException(tagVars) {
    var exceptionArray = ["null", "undefined", ""];
    var exception = false;
    for (var el in tagVars) {
      if (Array.isArray(tagVars[el])) {
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

  if (typeof Visilabs !== "function") {
    var url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
      "://vsh.visilabs.net/Visilabs.min.js?sid=" + {{RMC-sid}} + 
      "&oid=" + {{RMC-oid}};
    var script = document.createElement("script");
    if (location.href.toString().indexOf("vldebug=true") > 0) {
      url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
        "://vsh.visilabs.net/Visilabs_Debug.js?sid=" + {{RMC-sid}} + 
        "&oid=" + {{RMC-oid}};
    }
    script.onload = onSearchViewLoaded;
    script.type = "text/javascript";
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  } else {
    onSearchViewLoaded();
  }
</script>`,
};

export const AddFavTag = {
  name: "RMC-AddFav",
  html: `<script type="text/javascript">
  function onAddFavLoaded() {
    var tagVars = {
      "OM.pf": {{RMC-Product}}.id,
      "OM.pfu": "1",
      "OM.ppr": parseFloat({{RMC-Product}}.price)
    };
    
    var isCollected = false;
    var VL = new Visilabs();

    if (checkException(tagVars)) {
      VL.AddParameter("OM.VLEventException", "True");
      VL.AddParameter("OM.VLEventExceptionName", "ProductFav");
      VL.Collect();
      isCollected = true;
    } else {
      VL.AddParameter("OM.pf", tagVars["OM.pf"]);
      VL.AddParameter("OM.pfu", tagVars["OM.pfu"]);
      VL.AddParameter("OM.ppr", tagVars["OM.ppr"]);
    }

    if (!isCollected) {
      VL.Collect();
    }
  }

  function checkException(tagVars) {
    var exceptionArray = ["null", "undefined", ""];
    var exception = false;
    for (var el in tagVars) {
      if (Array.isArray(tagVars[el])) {
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

  if (typeof Visilabs !== "function") {
    var url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
      "://vsh.visilabs.net/Visilabs.min.js?sid=" + {{RMC-sid}} + 
      "&oid=" + {{RMC-oid}};
    var script = document.createElement("script");
    if (location.href.toString().indexOf("vldebug=true") > 0) {
      url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
        "://vsh.visilabs.net/Visilabs_Debug.js?sid=" + {{RMC-sid}} + 
        "&oid=" + {{RMC-oid}};
    }
    script.onload = onAddFavLoaded;
    script.type = "text/javascript";
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  } else {
    onAddFavLoaded();
  }
</script>`,
};

export const RemoveFavTag = {
  name: "RMC-RemoveFav",
  html: `<script type="text/javascript">
  function onRemoveFavLoaded() {
    var tagVars = {
      "OM.pf": {{RMC-Product}}.id,
      "OM.pfu": "-1",
      "OM.ppr": parseFloat({{RMC-Product}}.price)
    };
    
    var isCollected = false;
    var VL = new Visilabs();

    if (checkException(tagVars)) {
      VL.AddParameter("OM.VLEventException", "True");
      VL.AddParameter("OM.VLEventExceptionName", "ProductFav");
      VL.Collect();
      isCollected = true;
    } else {
      VL.AddParameter("OM.pf", tagVars["OM.pf"]);
      VL.AddParameter("OM.pfu", tagVars["OM.pfu"]);
      VL.AddParameter("OM.ppr", tagVars["OM.ppr"]);
    }

    if (!isCollected) {
      VL.Collect();
    }
  }

  function checkException(tagVars) {
    var exceptionArray = ["null", "undefined", ""];
    var exception = false;
    for (var el in tagVars) {
      if (Array.isArray(tagVars[el])) {
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

  if (typeof Visilabs !== "function") {
    var url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
      "://vsh.visilabs.net/Visilabs.min.js?sid=" + {{RMC-sid}} + 
      "&oid=" + {{RMC-oid}};
    var script = document.createElement("script");
    if (location.href.toString().indexOf("vldebug=true") > 0) {
      url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
        "://vsh.visilabs.net/Visilabs_Debug.js?sid=" + {{RMC-sid}} + 
        "&oid=" + {{RMC-oid}};
    }
    script.onload = onRemoveFavLoaded;
    script.type = "text/javascript";
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  } else {
    onRemoveFavLoaded();
  }
</script>`,
};

export const SignUpTag = {
  name: "RMC-SignUp",
  html: `<script type="text/javascript">
  function onSignUpLoaded() {
    var tagVars = {
      "OM.exVisitorID": {{RMC-UserID}},
      "OM.b_sgnp": "1"
    };
    
    var isCollected = false;
    var VL = new Visilabs();

    if (checkException(tagVars)) {
      VL.AddParameter("OM.VLEventException", "True");
      VL.AddParameter("OM.VLEventExceptionName", "SignUp");
      VL.Collect();
      isCollected = true;
    } else {
      VL.AddParameter("OM.exVisitorID", tagVars["OM.exVisitorID"]);
      VL.AddParameter("OM.b_sgnp", tagVars["OM.b_sgnp"]);
    }

    if (!isCollected) {
      VL.Collect();
      VL.SuggestActions();
    }
  }

  function checkException(tagVars) {
    var exceptionArray = ["null", "undefined", ""];
    var exception = false;
    for (var el in tagVars) {
      if (Array.isArray(tagVars[el])) {
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

  if (typeof Visilabs !== "function") {
    var url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
      "://vsh.visilabs.net/Visilabs.min.js?sid=" + {{RMC-sid}} + 
      "&oid=" + {{RMC-oid}};
    var script = document.createElement("script");
    if (location.href.toString().indexOf("vldebug=true") > 0) {
      url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
        "://vsh.visilabs.net/Visilabs_Debug.js?sid=" + {{RMC-sid}} + 
        "&oid=" + {{RMC-oid}};
    }
    script.onload = onSignUpLoaded;
    script.type = "text/javascript";
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  } else {
    onSignUpLoaded();
  }
</script>`,
};

export const PurchaseTag = {
  name: "RMC-Purchase",
  html: `<script type="text/javascript">
  function onPurchaseLoaded() {
    var tagVars = {
      "OM.tid": {{RMC-ecommerce.checkout.purchase_id}},
      "OM.pp": {{RMC-PurchaseArray-PP-JS}},
      "OM.pu": {{RMC-PurchaseArray-PU-JS}},
      "OM.ppr": {{RMC-PurchaseArray-PPR-JS}},
      "OM.ppt": {{RMC-PurchaseArray-PPT-JS}},
      "OM.exVisitorID": {{RMC-ecommerce.checkout.vl_userID}}
    };
    
    var isCollected = false;
    var VL = new Visilabs();

    if (checkException(tagVars)) {
      VL.AddParameter("OM.VLEventException", "True");
      VL.AddParameter("OM.VLEventExceptionName", "ProductPurchase");
      VL.Collect();
      isCollected = true;
    } else {
      VL.AddParameter("OM.tid", tagVars["OM.tid"]);
      VL.AddParameter("OM.pp", tagVars["OM.pp"].join(';'));
      VL.AddParameter("OM.pu", tagVars["OM.pu"].join(';'));
      VL.AddParameter("OM.ppr", tagVars["OM.ppr"].join(';'));
      VL.AddParameter("OM.ppt", tagVars["OM.ppt"]);
      VL.AddParameter("OM.exVisitorID", tagVars["OM.exVisitorID"]);
    }

    if (!isCollected) {
      VL.Collect();
      VL.SuggestActions();
    }
  }

  function checkException(tagVars) {
    var exceptionArray = ["null", "undefined", ""];
    var exception = false;
    for (var el in tagVars) {
      if (Array.isArray(tagVars[el])) {
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

  if (typeof Visilabs !== "function") {
    var url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
      "://vsh.visilabs.net/Visilabs.min.js?sid=" + {{RMC-sid}} + 
      "&oid=" + {{RMC-oid}};
    var script = document.createElement("script");
    if (location.href.toString().indexOf("vldebug=true") > 0) {
      url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
        "://vsh.visilabs.net/Visilabs_Debug.js?sid=" + {{RMC-sid}} + 
        "&oid=" + {{RMC-oid}};
    }
    script.onload = onPurchaseLoaded;
    script.type = "text/javascript";
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  } else {
    onPurchaseLoaded();
  }
</script>`,
};

export const CategoryViewTag = {
  name: "RMC-CategoryView",
  html: `<script type="text/javascript">
  function onCategoryViewLoaded() {
    var tagVars = {
      "OM.clist": {{RMC-CategoryID}}
    };
    
    var isCollected = false;
    var VL = new Visilabs();

    if (checkException(tagVars)) {
      VL.AddParameter("OM.VLEventException", "True");
      VL.AddParameter("OM.VLEventExceptionName", "CategoryView");
      VL.Collect();
      isCollected = true;
    } else {
      VL.AddParameter("OM.clist", tagVars["OM.clist"]);
    }

    if (!isCollected) {
      VL.Collect();
      VL.SuggestActions();
    }
  }

  function checkException(tagVars) {
    var exceptionArray = ["null", "undefined", ""];
    var exception = false;
    for (var el in tagVars) {
      if (Array.isArray(tagVars[el])) {
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

  if (typeof Visilabs !== "function") {
    var url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
      "://vsh.visilabs.net/Visilabs.min.js?sid=" + {{RMC-sid}} + 
      "&oid=" + {{RMC-oid}};
    var script = document.createElement("script");
    if (location.href.toString().indexOf("vldebug=true") > 0) {
      url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
        "://vsh.visilabs.net/Visilabs_Debug.js?sid=" + {{RMC-sid}} + 
        "&oid=" + {{RMC-oid}};
    }
    script.onload = onCategoryViewLoaded;
    script.type = "text/javascript";
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  } else {
    onCategoryViewLoaded();
  }
</script>`,
};

export const ProductViewTag = {
  name: "RMC-ProductView",
  html: `<script type="text/javascript">
  function onProductViewLoaded() {
    var tagVars = {
      "OM.pv": {{RMC-ecommerce.detail.product}}.id,
      "OM.pn": {{RMC-ecommerce.detail.product}}.name,
      "OM.ppr": {{RMC-ecommerce.detail.product}}.price,
      "OM.inv": {{RMC-ecommerce.detail.product}}.stock,
      "OM.pv.1": {{RMC-ecommerce.detail.product}}.brand,
      "OM.cat": {{RMC-ecommerce.detail.product}}.category
    };
    
    var isCollected = false;
    var VL = new Visilabs();

    if (checkException(tagVars)) {
      VL.AddParameter("OM.VLEventException", "True");
      VL.AddParameter("OM.VLEventExceptionName", "ProductView");
      VL.AddParameter("OM.pageUrl", window.location.href);
      VL.Collect();
      isCollected = true;
    } else {
      VL.AddParameter("OM.pv", tagVars["OM.pv"]);
      VL.AddParameter("OM.pn", tagVars["OM.pn"]);
      VL.AddParameter("OM.ppr", tagVars["OM.ppr"]);
      
      if (tagVars["OM.inv"] && !isNaN(tagVars["OM.inv"])) {
        VL.AddParameter("OM.inv", tagVars["OM.inv"]);
      }
      if (tagVars["OM.pv.1"]) {
        VL.AddParameter("OM.pv.1", tagVars["OM.pv.1"]);
      }
      if (tagVars["OM.cat"]) {
        VL.AddParameter("OM.cat", tagVars["OM.cat"]);
      }
    }

    if (!isCollected) {
      VL.Collect();
      VL.SuggestActions();
    }
  }

  function checkException(tagVars) {
    var exceptionArray = ["null", "undefined", ""];
    var exception = false;
    for (var el in tagVars) {
      if (Array.isArray(tagVars[el])) {
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

  if (typeof Visilabs !== "function") {
    var url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
      "://vsh.visilabs.net/Visilabs.min.js?sid=" + {{RMC-sid}} + 
      "&oid=" + {{RMC-oid}};
    var script = document.createElement("script");
    if (location.href.toString().indexOf("vldebug=true") > 0) {
      url = (location.protocol.indexOf("https") == 0 ? "https" : "http") + 
        "://vsh.visilabs.net/Visilabs_Debug.js?sid=" + {{RMC-sid}} + 
        "&oid=" + {{RMC-oid}};
    }
    script.onload = onProductViewLoaded;
    script.type = "text/javascript";
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  } else {
    onProductViewLoaded();
  }
</script>`,
};
