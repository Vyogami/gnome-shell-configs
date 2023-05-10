const Me = imports.misc.extensionUtils.getCurrentExtension();
const { Gio, GObject } = imports.gi;
const { popupMenu, main, messageTray } = imports.ui;
const { QuickMenuToggle, SystemIndicator } = imports.ui.quickSettings;
const Labels = Me.imports.modules.labels;
const Log = Me.imports.modules.log;
const Resources = Me.imports.modules.resources;
const Helpers = Me.imports.modules.helpers;

var Title = 'supergfxctl';

function notify(details, icon, action = '', urgency = 2) {
    let gIcon = Resources.getIcon(icon);
    let params = { gicon: gIcon };
    let source = new messageTray.Source('Super Graphics Control', icon, params);
    let notification = new messageTray.Notification(source, 'Super Graphics Control', details, params);
    main.messageTray.add(source);
    notification.setTransient(true);
    switch (action) {
        case 'logout':
            notification.setUrgency(3);
            notification.addAction('Log Out Now!', () => {
                Helpers.spawnCommandLine('gnome-session-quit');
            });
            break;
        case 'reboot':
            notification.setUrgency(3);
            notification.addAction('Reboot Now!', () => {
                Helpers.spawnCommandLine('shutdown -ar now');
            });
            break;
        default:
            notification.setUrgency(urgency);
    }
    source.showNotification(notification);
}

var gpuModeIndicator = GObject.registerClass(class gpuModeIndicator extends SystemIndicator {
    _init() {
        super._init();
    }
});

var gpuModeToggle = GObject.registerClass(class gpuModeToggle extends QuickMenuToggle {
    constructor(gpuModeIndicator) {
        super();
        this.connected = false;
        this._supported = [];
        this._vendor = '';
        this._lastState = 6;
        this._powerState = 3;
        this._version = ['0', '0', '0'];
        this._versionTested = Me.metadata.supergfxctl.toString().split('.');
        this._gsVer = Helpers.getGnomeShellVersion();
        this._gpuModeIndicator = null;
        this._gpuModeIndicator = gpuModeIndicator;
    }
    _init() {
        super._init();
        this._gpuModeItems = new Map();
        this._updateMenu = true;
        this._createProxy();
    }
    _createProxy() {
        let xml = Resources.File.DBus('org-supergfxctl-gfx-5');
        this._proxy = new Gio.DBusProxy.makeProxyWrapper(xml)(Gio.DBus.system, 'org.supergfxctl.Daemon', '/org/supergfxctl/Gfx', async (proxy, e) => {
            if (e) {
                Log.error('Graphics Mode DBus initialization using supergfxctl failed!', e);
            }
            else {
                try {
                    if (!this.getSupported())
                        throw 'could not get supported GPU modes';
                    this.connected = true;
                    this.getVersion();
                    this.getVendor();
                    this.getGfxMode();
                    this.getGpuPower();
                    this.connectNotifySignal();
                    this.connectPowerSignal();
                    this._gpuModeSection = new popupMenu.PopupMenuSection();
                    this.menu.addMenuItem(this._gpuModeSection);
                    if (this._gsVer !== undefined && this._gsVer >= 44)
                        this.title = `${Labels.gfxLabelsMenu[this._lastState]} (${Labels.powerLabel[this._powerState]})`;
                    else
                        this.label = `${Labels.gfxLabelsMenu[this._lastState]} (${Labels.powerLabel[this._powerState]})`;
                    this.gicon = Resources.getIcon(`gpu-${Labels.gfxLabels[this._lastState]}${Labels.powerLabelFilename[this._powerState] == 'active'
                        ? '-active'
                        : ''}`);
                    this.menu.setHeader(Resources.getIcon(`gpu-${Labels.gfxLabels[this._lastState]}${Labels.powerLabelFilename[this._powerState] == 'active'
                        ? '-active'
                        : ''}`), `${Labels.gfxLabelsMenu[this._lastState]} (${Labels.powerLabel[this._powerState]})`);
                    this._sync();
                    return true;
                }
                catch (e) {
                    notify('Could not establish connection to supergfxctl!', 'gpu-integrated-active', '', 3);
                    Log.error('Graphics Mode DBus initialization using supergfxctl failed after making the connection!', e);
                    return false;
                }
            }
        });
        return false;
    }
    _sync() {
        if (this._updateMenu) {
            this._gpuModeSection.removeAll();
            this._gpuModeItems.clear();
            if (Labels.gfxLabels[this._lastState] !== 'asusmuxdiscreet') {
                for (const key in this._supported) {
                    if (Object.prototype.hasOwnProperty.call(this._supported, key)) {
                        const element = this._supported[key];
                        const item = new popupMenu.PopupImageMenuItem(Labels.gfxLabelsMenu[element], Resources.getIcon(`gpu-${Labels.gfxLabels[element]}`));
                        item.connect('activate', () => {
                            this.setGfxMode(element);
                        });
                        this._gpuModeItems.set(element, item);
                        this._gpuModeSection.addMenuItem(item);
                    }
                }
                this._gpuModeSection.addMenuItem(new popupMenu.PopupSeparatorMenuItem());
            }
            for (const [profile, item] of this._gpuModeItems) {
                item.setOrnament(profile === this._lastState
                    ? popupMenu.Ornament.DOT
                    : popupMenu.Ornament.NONE);
            }
            if (this._version !== this._versionTested) {
                let versionText = '';
                if (this._version[0] !== this._versionTested[0]) {
                    versionText = `supergfxctl ${this._versionTested.join('.')}+ is required (${this._version.join('.')} installed)`;
                }
                else if (parseInt(this._version[1]) < parseInt(this._versionTested[1]) ||
                    parseInt(this._version[2]) < parseInt(this._versionTested[2])) {
                    versionText = `newer point release of supergfxctl ${this._versionTested.join('.')}+ is required (${this._version.join('.')} installed)`;
                }
                if (versionText.length > 0) {
                    const item = new popupMenu.PopupImageMenuItem(versionText, 'software-update-urgent-symbolic');
                    item.connect('activate', () => {
                        Helpers.spawnCommandLine('xdg-open https://gitlab.com/asus-linux/supergfxctl/');
                    });
                    this._gpuModeItems.set(0, item);
                    this._gpuModeSection.addMenuItem(item);
                    this._gpuModeSection.addMenuItem(new popupMenu.PopupSeparatorMenuItem());
                }
            }
            let powerItem = new popupMenu.PopupImageMenuItem(`dedicated GPU is ${Labels.powerLabel[this._powerState]}`, Resources.getIcon(`dgpu-${Labels.powerLabelFilename[this._powerState]}`));
            powerItem.sensitive = false;
            powerItem.active = false;
            this._gpuModeSection.addMenuItem(powerItem);
            if (this._gsVer !== undefined && this._gsVer >= 44)
                this.title = `${Labels.gfxLabelsMenu[this._lastState]} (${Labels.powerLabel[this._powerState]})`;
            else
                this.label = `${Labels.gfxLabelsMenu[this._lastState]} (${Labels.powerLabel[this._powerState]})`;
            this.gicon = Resources.getIcon(`gpu-${Labels.gfxLabels[this._lastState]}${Labels.powerLabelFilename[this._powerState] == 'active'
                ? '-active'
                : ''}`);
            this.setIndicator();
            this._updateMenu = false;
        }
        this.menu.setHeader(Resources.getIcon(`gpu-${Labels.gfxLabels[this._lastState]}${Labels.powerLabelFilename[this._powerState] == 'active'
            ? '-active'
            : ''}`), `${Labels.gfxLabelsMenu[this._lastState]} (${Labels.powerLabel[this._powerState]})`);
    }
    setIndicator() {
        this._gpuModeIndicator.remove_actor(this._gpuModeIndicator._indicator);
        this._gpuModeIndicator._indicator.gicon = Resources.getIcon(`gpu-${Labels.gfxLabels[this._lastState]}${Labels.powerLabelFilename[this._powerState] == 'active'
            ? '-active'
            : ''}`);
        this._gpuModeIndicator._indicator.style_class =
            'supergfxctl-gex panel-icon system-status-icon';
        this._gpuModeIndicator.add_actor(this._gpuModeIndicator._indicator);
    }
    connectNotifySignal() {
        try {
            this._proxy.connectSignal('NotifyAction', (proxy = null, name, value) => {
                let newMode = parseInt(this._proxy.ModeSync());
                let details = `Graphics Mode has changed.`;
                let icon = 'gpu-integrated-active';
                if (Labels.userAction[value] === 'integrated') {
                    details = `You must switch to Integrated mode before switching to VFIO.`;
                }
                else if (Labels.userAction[value] !== 'none') {
                    details = `Graphics Mode changed. Please save your work and ${Labels.userAction[value]} to apply the changes.`;
                    icon = 'reboot';
                    if (newMode !== this._lastState) {
                        this._lastState = newMode;
                        this._updateMenu = true;
                    }
                }
                else {
                    if (newMode !== this._lastState) {
                        details = `Graphics Mode changed to ${Labels.gfxLabels[newMode]}`;
                        this._lastState = newMode;
                        this._updateMenu = true;
                    }
                }
                this._sync();
                notify(details, icon, Labels.userAction[value]);
            });
        }
        catch (error) {
            Log.error(`Error connecting Signal, no live updates of GPU modes!`, error);
        }
    }
    connectPowerSignal() {
        try {
            this._proxy.connectSignal('NotifyGfxStatus', (proxy = null, name, value) => {
                if (value[0] !== this._powerState)
                    this.updatePanelPower(value[0]);
            });
        }
        catch (error) {
            Log.error(`Error connecting Signal, no live updates of GPU modes!`, error);
        }
    }
    getSupported() {
        try {
            let supported = this._proxy.SupportedSync();
            for (const [_key, _value] of Object.entries(supported)) {
                if (typeof _value == 'object') {
                    for (const [_keyInner, _valueInner] of Object.entries(_value)) {
                        this._supported[parseInt(_keyInner)] = parseInt(_valueInner);
                    }
                }
            }
            return true;
        }
        catch (e) {
            Log.error('Graphics Mode DBus: get current mode failed!', e);
        }
        return false;
    }
    getVendor() {
        if (this.connected) {
            try {
                this._vendor = this._proxy.VendorSync();
                return this._vendor;
            }
            catch (e) {
                Log.error('Graphics Mode DBus: get current vendor failed!', e);
            }
        }
        return '';
    }
    getVersion() {
        if (this.connected) {
            try {
                const version = this._proxy.VersionSync();
                this._version = version.toString().split('.');
                return this._version;
            }
            catch (e) {
                Log.error('Graphics Mode DBus: get current version failed!', e);
            }
        }
        return ['0', '0', '0'];
    }
    getGfxMode() {
        if (this.connected) {
            try {
                this._lastState = parseInt(this._proxy.ModeSync());
                return this._lastState;
            }
            catch (e) {
                Log.error('Graphics Mode DBus: get current mode failed!', e);
            }
        }
        return 6;
    }
    setGfxMode(mode) {
        if (this.connected) {
            try {
                this._proxy.SetModeSync(mode);
                return true;
            }
            catch (e) {
                Log.error('Graphics Mode DBus switching failed!', e);
                notify(e.toString(), 'gif/fire.gif');
            }
        }
        return false;
    }
    getGpuPower() {
        if (this.connected) {
            try {
                this._powerState = parseInt(this._proxy.PowerSync().toString().trim());
                return true;
            }
            catch (e) {
                Log.error('Graphics Mode DBus getting power mode failed!', e);
            }
        }
        this._powerState = 3;
        return false;
    }
    updatePanelPower(gpuPowerLocal = this._powerState) {
        if (gpuPowerLocal !== this._powerState) {
            this._powerState = gpuPowerLocal;
            if (gpuPowerLocal == 0 && this._lastState == 1) {
                try {
                    let mode = parseInt(this._proxy.ModeSync());
                    if (Labels.gfxLabels[mode] == 'integrated')
                        notify(`Your dedicated GPU turned on while you are on the integrated mode. This should not happen. It could be that another application rescanned your PCI bus. Rebooting is advised.`, 'gif/fire.gif', 'reboot');
                    else if (this._lastState !== mode)
                        this._lastState = mode;
                }
                catch (e) {
                    Log.error('Graphics Mode DBus getting mode failed!', e);
                }
            }
            this._updateMenu = true;
            this._sync();
        }
    }
    stop() {
        this.connected = false;
        this._proxy = null;
    }
});
