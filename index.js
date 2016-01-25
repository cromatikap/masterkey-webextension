var { ToggleButton } = require("sdk/ui/button/toggle");
var panels = require("sdk/panel");
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var clipboard = require("sdk/clipboard");
var cm = require("sdk/context-menu");
var preferences = require("sdk/simple-prefs").prefs;
var passwords = require("sdk/passwords");

var button = ToggleButton({
    id: "masterkey-button",
    label: "MasterKey",
    icon: "./img/logo.png",
    onChange: handleClick
});

var panel = panels.Panel({
    contentURL: "./panel.html",
    contentStyleFile: "./css/base.css",
    contentScriptFile: [
    "./js/panel.js"
    ],
    onHide: handleHide
});

var nodeIdentifier;

var item = cm.Item({
    label: "MasterKey",
    context: cm.SelectorContext('input[type="password"]'),
    contentScriptFile: "./js/contextmenu.js",
    onMessage: function(identifier) {
        nodeIdentifier = identifier;
        showPanel("context");
    },
    image: self.data.url("./img/logo16.png"),
    accesskey: "m"
});


function setPasswordField(pw) {
    var worker = require("sdk/tabs").activeTab.attach({
      contentScriptFile: "./js/tab.js",
  });

    worker.port.emit("password", {id: nodeIdentifier, pw: pw});
}

var openType = ""; // context or button

panel.port.on("password", function(pw) {
    panel.hide();

    if (openType == "context") {
        setPasswordField(pw);
    } else if (openType == "button") {
        clipboard.set(pw, "text");
    }
});

panel.port.on("setting", function(data) {
    console.log(JSON.stringify(data));
    preferences[data.prop] = data.value;
})

panel.port.on("masterkey", function(key) {
    passwords.search({
        realm: "masterkey",
        username: "masterkey",
        url: self.uri,
        onComplete: function(credentials) {
            if (credentials.length != 0) {
                credentials[0].onComplete = function() {
                    passwords.store({
                        username: "masterkey",
                        password: key,
                        realm: "masterkey"
                    });
                }
                passwords.remove(credentials[0]);
            } else {
                passwords.store({
                    username: "masterkey",
                    password: key,
                    realm: "masterkey"
                });
            }
        }
    });
});

passwords.search({
    realm: "masterkey",
    username: "masterkey",
    url: self.uri,
    onComplete: function(credentials) {
        if (credentials.length != 0)
            panel.port.emit("masterkey", credentials[0].password);
    }
});

function showPanel(type) {
    openType = type;
    panel.show({
        width: 300,
        height: 250,
        position: {
            top: -70
        }
    });
    panel.port.emit("show", preferences);
}

function handleClick(state) {
    if (state.checked) {
        showPanel("button");
    }
}

function handleHide() {
    button.state("window", {checked: false});
}
