const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const Panel = Me.imports.modules.panel;
const Resources = Me.imports.modules.resources;
const { Gio, GLib } = imports.gi;
var ChargingLimit = class ChargingLimit {
    constructor() {
        this.asusLinuxProxy = null;
        this.connected = false;
        this.lastState = 100;
        this.pollerDelayTicks = 0;
        this.timeoutChargePoller = null;
    }
    getChargingLimit() {
        if (this.isRunning()) {
            try {
                let currentState = this.asusLinuxProxy.LimitSync().toString().trim();
                return currentState;
            }
            catch (e) {
                Log.error(`Failed to fetch Charging Limit!`, e);
            }
        }
        return this.lastState;
    }
    setChargingLimit(limit) {
        if (this.isRunning()) {
            try {
                if (limit > 0 && this.lastState !== limit) {
                    this.lastState = limit;
                }
                return this.asusLinuxProxy.SetLimitSync(limit);
            }
            catch (e) {
                Log.error(`Profile DBus set power profile failed!`, e);
            }
        }
    }
    updateChargingLimit(curState) {
        if (curState > 0 && this.lastState !== curState) {
            asusctlGexInstance.chargingLimit.chargingLimitSlider.block_signal_handler(asusctlGexInstance.chargingLimit._sliderChangedId);
            asusctlGexInstance.chargingLimit.chargingLimitSlider.value = curState / 100;
            asusctlGexInstance.chargingLimit.chargingLimitSlider.unblock_signal_handler(asusctlGexInstance.chargingLimit._sliderChangedId);
            asusctlGexInstance.chargingLimit.chargeLimitLabel.set_text(`${curState}%`);
            this.lastState = curState;
        }
    }
    pollerChargingLimit() {
        if (this.isRunning() && this.pollerDelayTicks <= 0) {
            try {
                let currentLimit = this.getChargingLimit();
                if (currentLimit !== this.lastState) {
                    this.updateChargingLimit(currentLimit);
                    Panel.Actions.notify('ASUS Notebook Control', `Charging Limit changed to ${currentLimit}%`, 'scalable/battery-symbolic.svg');
                }
            }
            catch (e) {
                Log.error(`Charging Limit poller init failed!`, e);
            }
            finally {
                return this.isRunning() ? GLib.SOURCE_CONTINUE : GLib.SOURCE_REMOVE;
            }
        }
        else if (this.isRunning() && this.pollerDelayTicks > 0) {
            this.pollerDelayTicks--;
            return GLib.SOURCE_CONTINUE;
        }
        else {
            return GLib.SOURCE_REMOVE;
        }
    }
    isRunning() {
        return this.connected;
    }
    async start() {
        Log.debug(`Starting Charging Limit DBus client...`);
        try {
            let xml = Resources.File.DBus('org-asuslinux-charge-4');
            this.asusLinuxProxy = new Gio.DBusProxy.makeProxyWrapper(xml)(Gio.DBus.system, 'org.asuslinux.Daemon', '/org/asuslinux/Charge');
            this.connected = true;
            this.lastState = this.getChargingLimit();
            this.asusLinuxProxy.connectSignal("NotifyCharge", (proxy = null, name, data) => {
                if (proxy) {
                    Log.debug(`Charging Limit has changed to ${data}% (${name}).`);
                    this.updateChargingLimit(parseInt(data));
                }
            });
            try {
                this.timeoutChargePoller = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 5, this.pollerChargingLimit.bind(this));
            }
            catch (e) {
                Log.error(`Charging Limit DBus Poller initialization failed!`, e);
            }
        }
        catch (e) {
            Log.error(`Charging Limit DBus initialization failed!`, e);
        }
    }
    stop() {
        Log.debug(`Stopping Charging Limit DBus client...`);
        if (this.isRunning()) {
            this.connected = false;
            this.asusLinuxProxy = null;
            this.lastState = 100;
            GLib.Source.remove(this.timeoutChargePoller);
            this.timeoutChargePoller = null;
        }
    }
}
//# sourceMappingURL=charge_dbus.js.map