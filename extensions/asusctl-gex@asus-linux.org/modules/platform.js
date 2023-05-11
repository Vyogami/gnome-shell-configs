const Me = imports.misc.extensionUtils.getCurrentExtension();
const { main, popupMenu } = imports.ui;
const {} = imports.gi;
const Log = Me.imports.modules.log;
const DBus = Me.imports.modules.platform_dbus;
var Client = class Client {
    constructor() {
        this.connector = new DBus.Platform();
        this.connected = false;
    }
    isRunning() {
        return (this.connected && this.connector && this.connector.isRunning());
    }
    start() {
        Log.debug(`Starting Platform client...`);
        try {
            this.connector.start();
            this.connected = this.connector.isRunning();
            this.populatePopup();
        }
        catch (e) {
            Log.error(`Platform client start failed!`, e);
        }
    }
    stop() {
        Log.debug(`Stopping Platform client...`);
        if (this.isRunning()) {
            this.connected = false;
            this.connector.stop();
        }
    }
    populatePopup() {
        if (!this.isRunning())
            return;
        let menu = main.panel.statusArea['asusctl-gex.panel'].menu;
        menu.addMenuItem(new popupMenu.PopupSeparatorMenuItem());
        const biosHeadline = new popupMenu.PopupMenuItem('BIOS Settings', {
            hover: false,
            can_focus: false,
            style_class: 'headline headline-label asusctl-gex-menu-item'
        });
        biosHeadline.sensitive = false;
        biosHeadline.active = false;
        menu.addMenuItem(biosHeadline);
        if (asusctlGexInstance.supported.connector.supportedAttributes.bios_overdrive) {
            this.overdriveSwitch = new popupMenu.PopupSwitchMenuItem('Panel Overdrive', this.connector.lastStateOverdrive);
            this.overdriveSwitch.connect('toggled', (item) => {
                this.connector.setOverdrive(item.state);
            });
            menu.addMenuItem(this.overdriveSwitch);
        }
        if (asusctlGexInstance.supported.connector.supportedAttributes.bios_toggleSound) {
            this.switchPostBootSound = new popupMenu.PopupSwitchMenuItem('Post Boot Sound', this.connector.lastStatePostBootSound);
            this.switchPostBootSound.connect('toggled', (item) => {
                this.connector.setPostBootSound(item.state);
            });
            menu.addMenuItem(this.switchPostBootSound);
        }
        if (asusctlGexInstance.supported.connector.supportedAttributes.bios_toggleMUX) {
            this.switchMUX = new popupMenu.PopupSwitchMenuItem('Graphics MUX set to dedicated', this.connector.lastStateMUX);
            this.switchMUX.connect('toggled', (item) => {
                this.connector.setMUX(item.state);
            });
            menu.addMenuItem(this.switchMUX);
        }
    }
}
//# sourceMappingURL=platform.js.map