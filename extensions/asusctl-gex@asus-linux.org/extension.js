const Config = imports.misc.config;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Log = Me.imports.modules.log;
const Supported = Me.imports.modules.supported;
const Charge = Me.imports.modules.charge;
const Anime = Me.imports.modules.anime;
const Panel = Me.imports.modules.panel;
const Platform = Me.imports.modules.platform;
var Extension = class Extension {
    constructor() {
    }
    enable() {
        this.isDebug = false;
        this.superNotice = false;
        this.getGexSettings();
        Log.info(`Initializing ${Me.metadata.name} version ${Me.metadata.version} on GNOME Shell ${Config.PACKAGE_VERSION}`);
        this.supported = new Supported.Client();
        this.supported.start();
        if (this.supported.connector.supportedAttributes.charge)
            this.chargingLimit = new Charge.Client();
        if (this.supported.connector.supportedAttributes.anime)
            this.anime = new Anime.Client();
        if (this.supported.connector.supportedAttributes.bios_overdrive || this.supported.connector.supportedAttributes.bios_toggleSound)
            this.Platform = new Platform.Client();
        Log.info(`Enabling ${Me.metadata.name} version ${Me.metadata.version}`);
        this.panelButton = new Panel.AsusNb_Indicator();
        if (this.supported.connector.supportedAttributes.charge)
            this.chargingLimit.start();
        if (this.supported.connector.supportedAttributes.anime)
            this.anime.start();
        if (this.supported.connector.supportedAttributes.bios_overdrive || this.supported.connector.supportedAttributes.bios_toggleSound)
            this.Platform.start();
    }
    disable() {
        Log.info(`Disabling ${Me.metadata.name} version ${Me.metadata.version}`);
        this.supported.stop();
        if (this.supported.connector.supportedAttributes.charge)
            this.chargingLimit.stop();
        if (this.supported.connector.supportedAttributes.anime)
            this.anime.stop();
        if (this.supported.connector.supportedAttributes.bios_overdrive || this.supported.connector.supportedAttributes.bios_toggleSound)
            this.Platform.stop();
        this.panelButton.destroy();
        this.panelButton = null;
    }
    getGexSettings() {
        try {
            this.settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.asusctl-gex');
            this.isDebug = this.getGexSetting('debug-enabled');
            this.superNotice = this.getGexSetting('supernotice');
            Log.debug(this.superNotice.toString());
        }
        catch (e) {
            Log.debug('Error getting settings.', e);
        }
    }
    getGexSetting(setting) {
        try {
            return this.settings.get_boolean(setting);
        }
        catch (e) {
            return false;
        }
    }
    setGexSetting(setting, value) {
        try {
            return this.settings.set_boolean(setting, value);
        }
        catch (e) {
            return false;
        }
    }
}
function init() {
    asusctlGexInstance = new Extension();
    return asusctlGexInstance;
}
//# sourceMappingURL=extension.js.map