document.body.addEventListener("contextmenu", function(ev) {
    // When context menu is opened, notify the background script so that the
    // background script can notify us again if user presses enter in popup.
    // Necessary because we can't access the field from which the context menu has
    // been opened in the background script, where the context menu entry was created
    // which does not really comply with my understanding of a *context* menu.
    if (ev.target.nodeName != "INPUT" || ev.target.type != "password") return;
    var element = ev.target;    
    browser.runtime.sendMessage("context_menu_opened").then(function(msg) {
        if ("set_password" in msg && element != null) {
            element.value = msg.set_password;
        }
    });
}, false);