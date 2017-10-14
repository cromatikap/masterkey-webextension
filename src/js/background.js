// Create context menu entry
browser.contextMenus.create(
	{
		contexts: ["password"],
		icons: {
			"16": "data/img/logo.svg"		
		},
		title: "MasterKey",
		id: "masterkey",
		command: "_execute_browser_action"
	}
);

// Some global state
let open_with = "button";
let ctx_response = null;
let masterkey = "";
let service = "";

browser.contextMenus.onClicked.addListener(function(info, tab) {
	if (info.menuItemId == "masterkey") {
		// Store that popup has been opened with context menu so that the password can be written to the input field instead of clipboard
		open_with = "contextmenu";
	}
});

browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message == "context_menu_opened") { // Sent by content script, sendResponse will set the password to the input
		ctx_response = sendResponse;
		return true;
	} else if (message == "init") { // Sent by popup when opened, requesting data
		sendResponse({"masterkey": masterkey, "service": service});
	} else if (message == "close") {
		// Stupid hack. When the popup is closed, reset open method to button because there is no real method
		// to find out if browser action button was pressed when a default popup is defined.
		open_with = "button";
	} else if (typeof message == "object") {
		if ("password" in message) { // User pressed enter in popup. Decide if password should be copied or filled in.
			let password = message.password;
			if (open_with == "contextmenu") {
				ctx_response({"set_password": password});
				browser.runtime.sendMessage("close");
			} else if(open_with == "button") {
				browser.runtime.sendMessage("copy");
			}
		}
		if ("masterkey" in message) { // Cache masterkey
			masterkey = message.masterkey;
		}
		if ("service" in message) { // Cache service name
			service = message.service;
		}
	}
	
})