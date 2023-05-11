const Me = imports.misc.extensionUtils.getCurrentExtension();
const { Gio } = imports.gi;
const Resources = Me.imports.helpers.resource_helpers;
const Log = Me.imports.modules.log;
const { PanelHelper } = Me.imports.helpers.panel_helper;
const { LabelHelper, LabelType } = Me.imports.helpers.label_helper;

var DBus = class DBus {

    constructor(gpuModeToggle) {
        this.sgfxVendor = '';
        this.sgfxLastState = 6;
        this.sgfxPowerState = 3;
        this.sgfxSupportedGPUs = [];
        this.connected = false;
        this.gpuModeToggle = gpuModeToggle;
        this.proxy = new Gio.DBusProxy.makeProxyWrapper(Resources.File.DBus('org-supergfxctl-gfx-5'))(Gio.DBus.system, 'org.supergfxctl.Daemon', '/org/supergfxctl/Gfx');
        if ((this.connected = this.supportedMode) && this.initialize()) {

            try {
                const lastState = this.lastState;
                const lastPState = this.lastPowerState;
                const lVar = `${this.labels.get(LabelType.GfxMenu, lastState)} (${this.labels.get(LabelType.Power, lastPState)}})`;
                const gpuIconName = `gpu-${this.labels.get(LabelType.Gfx, lastState) +
                    this.labels.get(LabelType.PowerFileName, lastPState) ==
                    'active'
                    ? '-active'
                    : ''}`;
                if (this.labels.gsVersion >= 44)
                    this.gpuModeToggle.title = lVar;
                else
                    this.gpuModeToggle.label = lVar;
                this.gpuModeToggle.gicon = Resources.Icon.getByName(gpuIconName);
                this.gpuModeToggle.menu.setHeader(Resources.Icon.getByName(gpuIconName), `${this.labels.get(LabelType.GfxMenu, lastState)} (${this.labels.get(LabelType.Power, lastPState)})`);
            }
            catch (e) {
                PanelHelper.notify('Could not establish connection to supergfxctl!', 'gpu-integrated-active', '', 3);
                Log.error('Graphics Mode DBus initialization using supergfxctl failed after making the connection!', e);
            }
        }
    }

    initialize() {
        Log.info('initializing DBus interface...');

        try {
            this.initLabels();
            if (this.labels.v51) {
                this.sgfxLastState = 7;
                this.sgfxPowerState = 5;
            }
            this.vendor;
            this.gfxMode;
            this.gpuPower;
            this.connectSignals();
        }
        catch {
            Log.error('initializing DBus failed!');
            return false;
        }
        Log.info('initialized DBus interface.');
        return true;
    }

    connectSignals() {
        this.connectNotifySignal();
        this.connectPowerSignal();
    }

    get supportedMode() {
        const supp = this.proxy.SupportedSync();
        if (Array.isArray(supp) && Array.isArray(supp[0])) {
            this.sgfxSupportedGPUs = supp[0].map((n) => parseInt(n) || 0);
            return supp[0].length === this.sgfxSupportedGPUs.length;
        }
        Log.warn('Graphics Mode DBus: get current mode failed!');
        return false;
    }

    initLabels() {

        try {
            this.labels = new LabelHelper(this.proxy.VersionSync().toString().split('.'));
        }
        catch (e) {
            Log.error('Graphics Mode DBus: get current version failed!', e);
        }
    }

    connectNotifySignal() {

        try {
            this.proxy.connectSignal('NotifyAction', (proxy = null, name, value) => {
                let newMode = parseInt(this.proxy.ModeSync());
                let details = `Graphics Mode has changed.`;
                let icon = 'gpu-integrated-active';
                let switchable = true;

                switch (this.labels.get(LabelType.UserAction, value)) {
                    case 'integrated':
                        details = `You must switch to Integrated mode before switching to VFIO.`;
                        switchable = false;
                        break;
                    case 'none':
                        details = `Graphics Mode changed to ${this.labels.get(LabelType.Gfx, newMode)}`;
                        break;
                    default:
                        details = `Graphics Mode changed. Please save your work and ${this.labels.get(LabelType.UserAction, value)} to apply the changes.`;
                        icon = 'reboot';
                        break;
                }
                if (switchable && newMode !== this.sgfxLastState) {
                    this.sgfxLastState = newMode;
                    this.gpuModeToggle.refresh();
                }
                PanelHelper.notify(details, icon, this.labels.get(LabelType.UserAction, value));
            });
        }
        catch (error) {
            Log.error(`Error connecting Signal, no live updates of GPU modes!`, error);
        }
    }

    connectPowerSignal() {

        try {
            this.proxy.connectSignal('NotifyGfxStatus', (proxy = null, name, value) => {
                if (this.sgfxPowerState !== value[0]) {
                    this.sgfxPowerState = value[0];
                    if (this.sgfxPowerState == 0 && this.sgfxLastState == 1) {

                        try {
                            let mode = parseInt(this.proxy.ModeSync());
                            if (this.labels.is(LabelType.Gfx, mode, 'integrated'))
                                PanelHelper.notify(`Your dedicated GPU turned on while you are on the integrated mode. This should not happen. It could be that another application rescanned your PCI bus. Rebooting is advised.`, 'gif/fire.gif', 'reboot');
                            else if (this.sgfxLastState !== mode)
                                this.sgfxLastState = mode;
                            this.gpuModeToggle.refresh();
                        }
                        catch (e) {
                            Log.error('Graphics Mode DBus getting mode failed!', e);
                        }
                    }
                }
            });
        }
        catch (error) {
            Log.error(`Error connecting Signal, no live updates of GPU modes!`, error);
        }
    }

    get vendor() {

        try {
            return (this.sgfxVendor = this.proxy.VendorSync());
        }
        catch (e) {
            Log.error('Graphics Mode DBus: get current vendor failed!', e);
        }
        return this.sgfxVendor;
    }

    get gfxMode() {

        try {
            return (this.sgfxLastState = parseInt(this.proxy.ModeSync()));
        }
        catch (e) {
            Log.error('Graphics Mode DBus: get current mode failed!', e);
        }
        return this.sgfxLastState;
    }

    set gfxMode(mode) {

        try {
            this.proxy.SetModeSync(mode);
        }
        catch (e) {
            Log.error('Graphics Mode DBus switching failed!', e);
            PanelHelper.notify(e.toString(), 'gif/fire.gif');
        }
    }

    get gpuPower() {

        try {
            return (this.sgfxPowerState = parseInt(this.proxy.PowerSync().toString().trim()));
        }
        catch (e) {
            Log.error('Graphics Mode DBus getting power mode failed!', e);
        }
        return (this.sgfxPowerState = 3);
    }

    get supported() {
        return this.connected ? this.sgfxSupportedGPUs : [];
    }

    get lastState() {
        return this.connected ? this.sgfxLastState : 6 + (this.labels.v51 ? 1 : 0);
    }

    get lastPowerState() {
        return this.connected ? this.sgfxPowerState : 3 + (this.labels.v51 ? 2 : 0);
    }

    get labelHelper() {
        return this.labels;
    }
}
