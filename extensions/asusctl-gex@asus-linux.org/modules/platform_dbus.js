const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const Panel = Me.imports.modules.panel;
const Resources = Me.imports.modules.resources;
const { Gio } = imports.gi;
var Platform = class Platform {
    constructor() {
        this.asusLinuxProxy = null;
        this.connected = false;
        this.lastStatePostBootSound = false;
        this.lastStateOverdrive = false;
        this.lastStateMUX = false;
    }
    getPostBootSound() {
        if (this.isRunning()) {
            try {
                let currentState = this.asusLinuxProxy.PostBootSoundSync();
                return parseInt(currentState) == 1 ? true : false;
            }
            catch (e) {
                Log.error(`Failed to get POST Boot Sound state!`, e);
            }
        }
        return this.lastStatePostBootSound;
    }
    setPostBootSound(state) {
        if (this.isRunning()) {
            try {
                if (state !== this.lastStatePostBootSound) {
                    this.lastStatePostBootSound = state;
                }
                return this.asusLinuxProxy.SetPostBootSoundSync(state);
            }
            catch (e) {
                Log.error(`Platform DBus set Post Boot Sound failed!`, e);
            }
        }
    }
    getMUX() {
        if (this.isRunning()) {
            try {
                let currentState = this.asusLinuxProxy.GpuMuxModeSync();
                return parseInt(currentState) == 0 ? true : false;
            }
            catch (e) {
                Log.error(`Failed to get MUX state!`, e);
            }
        }
        return this.lastStatePostBootSound;
    }
    setMUX(state) {
        if (this.isRunning()) {
            try {
                if (!state !== this.lastStateMUX) {
                    this.lastStateMUX = !state;
                }
                return this.asusLinuxProxy.SetGpuMuxModeSync(!state);
            }
            catch (e) {
                Log.error(`Switching the MUX failed!`, e);
            }
        }
    }
    getOverdrive() {
        if (this.isRunning()) {
            try {
                let currentState = this.asusLinuxProxy.PanelOverdriveSync();
                return parseInt(currentState) == 1 ? true : false;
            }
            catch (e) {
                Log.error(`Failed to get Overdrive state!`, e);
            }
        }
        return this.lastStateOverdrive;
    }
    setOverdrive(state) {
        if (this.isRunning()) {
            try {
                if (state !== this.lastStateOverdrive) {
                    this.lastStateOverdrive = state;
                }
                return this.asusLinuxProxy.SetPanelOverdriveSync(state);
            }
            catch (e) {
                Log.error(`Overdrive DBus set overdrive state failed!`, e);
            }
        }
    }
    isRunning() {
        return this.connected;
    }
    async start() {
        Log.debug(`Starting Platform DBus module...`);
        try {
            let xml = Resources.File.DBus('org-asuslinus-platform-4');
            this.asusLinuxProxy = new Gio.DBusProxy.makeProxyWrapper(xml)(Gio.DBus.system, 'org.asuslinux.Daemon', '/org/asuslinux/Platform');
            this.connected = true;
            if (asusctlGexInstance.supported.connector.supportedAttributes.bios_toggleSound) {
                this.lastStatePostBootSound = this.getPostBootSound();
                this.asusLinuxProxy.connectSignal("NotifyPostBootSound", (proxy = null, _name, data) => {
                    if (proxy) {
                        Log.debug(`PostBootSound changed to ${data}`);
                        asusctlGexInstance.Platform.switchPostBootSound.setToggleState(this.lastStatePostBootSound);
                    }
                });
            }
            if (asusctlGexInstance.supported.connector.supportedAttributes.bios_overdrive) {
                this.lastStateOverdrive = this.getOverdrive();
                this.asusLinuxProxy.connectSignal("NotifyPanelOverdrive", (proxy = null, _name, data) => {
                    if (proxy) {
                        Log.debug(`Overdrive has changed to ${data}.`);
                        asusctlGexInstance.Platform.overdriveSwitch.setToggleState(this.lastStateOverdrive);
                    }
                });
            }
            if (asusctlGexInstance.supported.connector.supportedAttributes.bios_toggleMUX) {
                this.lastStateMUX = this.getMUX();
                this.asusLinuxProxy.connectSignal("NotifyGpuMuxMode", (proxy = null, _name, data) => {
                    if (proxy) {
                        Log.debug(`MUX has changed to ${data}.`);
                        asusctlGexInstance.Platform.switchMUX.setToggleState(this.lastStateMUX);
                        Panel.Actions.notify('ASUS Notebook Control', `MUX Mode has chnged. Please reboot to apply the changes.`, 'scalable/reboot.svg', 'reboot');
                    }
                });
            }
        }
        catch (e) {
            Log.error(`Overdrive DBus init failed!`, e);
        }
    }
    stop() {
        Log.debug(`Stopping Overdrive DBus module...`);
        if (this.isRunning()) {
            this.connected = false;
            this.asusLinuxProxy = null;
            this.lastStatePostBootSound = false;
            this.lastStateOverdrive = false;
        }
    }
}
//# sourceMappingURL=platform_dbus.js.map