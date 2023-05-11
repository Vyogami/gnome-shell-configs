const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const DBus = Me.imports.modules.supported_dbus;
var Client = class Client {
    constructor() {
        this.connector = new DBus.Supported();
        this.connected = false;
        try {
            this.connector = new DBus.Supported();
        }
        catch (e) {
            Log.error(`Supported client initialization failed!`, e);
        }
    }
    isRunning() {
        return (this.connected && this.connector && this.connector.isRunning());
    }
    start() {
        Log.debug(`Starting Supported client...`);
        try {
            this.connector.start();
            this.connected = this.connector.isRunning();
        }
        catch (e) {
            Log.error(`Supported start failed!`, e);
        }
    }
    stop() {
        Log.debug(`Stopping Supported client...`);
        if (this.isRunning()) {
            this.connected = false;
            this.connector.stop();
        }
    }
}
//# sourceMappingURL=supported.js.map