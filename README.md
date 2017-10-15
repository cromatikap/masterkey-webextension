# Masterkey Webextension

Webextension for MasterKey: Create passwords from a master key and service name.

Does currently only work in Firefox. 

## Build

Install `npm` with a packet manager of your choice.

* `npm install -g browserify` (probably as root)
* `git clone github.com/ninov/masterkey-webextension && cd masterkey-webextension`
* `npm install`
* `make`

All files necessary for using the extension are now in dist.  
For temporary debugging, it can be activated in Firefox (Developer Edition or Nightly) at the `about:debugging`.

To create the xpi file: `make xpi`
