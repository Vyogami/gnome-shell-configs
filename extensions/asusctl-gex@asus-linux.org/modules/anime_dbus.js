const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const Resources = Me.imports.modules.resources;
const { Gio } = imports.gi;
var AnimeDbus = class AnimeDbus {
    constructor() {
        this.asusLinuxProxy = null;
        this.connected = false;
        this.state = true;
        this.brightness = 255;
    }
    setOnOffState(state) {
        if (this.isRunning()) {
            try {
                state = (state == null ? !this.state : state);
                if (this.state !== state) {
                    this.state = state;
                }
                Log.debug(`Setting AniMe Power to ${state}`);
                return this.asusLinuxProxy.SetOnOffSync(state);
            }
            catch (e) {
                Log.error(`AniMe DBus set power failed!`, e);
            }
        }
    }
    setBrightness(brightness) {
        if (this.isRunning()) {
            try {
                if (this.brightness !== brightness) {
                    this.brightness = brightness;
                }
                Log.debug(`Setting AniMe Brightness to ${brightness}`);
                return this.asusLinuxProxy.SetBrightnessSync(brightness);
            }
            catch (e) {
                Log.error(`AniMe DBus set brightness failed!`, e);
            }
        }
    }
    isRunning() {
        return this.connected;
    }
    async start() {
        Log.debug(`Starting AniMe DBus client...`);
        try {
            let xml = Resources.File.DBus('org-asuslinux-anime-4');
            this.asusLinuxProxy = new Gio.DBusProxy.makeProxyWrapper(xml)(Gio.DBus.system, 'org.asuslinux.Daemon', '/org/asuslinux/Anime');
            this.connected = true;
        }
        catch (e) {
            Log.error(`AniMe DBus initialization failed!`, e);
        }
    }
    stop() {
        Log.debug(`Stopping AniMe DBus client...`);
        if (this.isRunning()) {
            this.connected = false;
            this.asusLinuxProxy = null;
            this.state = true;
        }
    }
}
//# sourceMappingURL=anime_dbus.js.map