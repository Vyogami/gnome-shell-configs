const Me = imports.misc.extensionUtils.getCurrentExtension();
const { main, popupMenu, slider } = imports.ui;
const { St } = imports.gi;
const Log = Me.imports.modules.log;
const DBus = Me.imports.modules.charge_dbus;
var Client = class Client {
    constructor() {
        this.connector = new DBus.ChargingLimit();
        this.connected = false;
        this._sliderDragging = false;
        this._sliderChangedId = 0;
    }
    isRunning() {
        return (this.connected && this.connector && this.connector.isRunning());
    }
    start() {
        Log.debug(`Starting Charging Limit client...`);
        try {
            this.connector.start();
            this.connected = this.connector.isRunning();
            this.populatePopup();
        }
        catch (e) {
            Log.error(`Charging Limit client start failed!`, e);
        }
    }
    stop() {
        Log.debug(`Stopping Charge Limit client...`);
        if (this.isRunning()) {
            this.connected = false;
            this.connector.stop();
        }
    }
    showModal() {
        let modalChargeLimit = new ChangeChargingLimitDialog(this.connector);
        modalChargeLimit.open();
    }
    populatePopup() {
        if (!this.isRunning())
            return;
        let menu = main.panel.statusArea['asusctl-gex.panel'].menu;
        this.menuItemChargeLimit = new popupMenu.PopupBaseMenuItem({ activate: false, style_class: 'asusctl-gex-menu-item asusctl-gex-battery-item' });
        const chargingLimitItemHeadline = new popupMenu.PopupMenuItem('Battery Charge Limit', { hover: false, can_focus: false, style_class: 'headline headline-label asusctl-gex-menu-item' });
        chargingLimitItemHeadline.sensitive = false;
        chargingLimitItemHeadline.active = false;
        let iconCharge = new St.Icon({ style_class: 'popup-menu-icon' });
        iconCharge.icon_name = 'battery-symbolic';
        this.menuItemChargeLimit.add(iconCharge);
        let valueInit = parseInt(asusctlGexInstance.chargingLimit.connector.getChargingLimit()) / 100;
        this.chargingLimitSlider = new slider.Slider(0);
        this.chargingLimitSlider.connect('drag-begin', () => (this._sliderDragging = true));
        this.chargingLimitSlider.value = valueInit;
        this._sliderChangedId = this.chargingLimitSlider.connect('notify::value', () => {
            let sliderValue = Math.round(this.chargingLimitSlider.value * 100);
            this.chargeLimitLabel.set_text(`${sliderValue}%`);
            if (!this._sliderDragging && sliderValue !== this.connector.lastState) {
                this.connector.lastState = sliderValue;
                this.connector.setChargingLimit(sliderValue);
            }
        });
        this.menuItemChargeLimit.connect('scroll-event', (actor, event) => {
            return this.chargingLimitSlider.emit('scroll-event', event);
        });
        this.chargingLimitSlider.connect('drag-end', () => {
            this._sliderDragging = false;
            let sliderValue = Math.round(this.chargingLimitSlider.value * 100);
            if (sliderValue !== this.connector.lastState) {
                this.connector.lastState = sliderValue;
                this.connector.setChargingLimit(sliderValue);
            }
            this.chargeLimitLabel.set_text(`${sliderValue}%`);
        });
        this.chargeLimitLabel = new St.Label({
            text: `${valueInit * 100}%`,
            style_class: 'asusctl-gex-battery-slider-label'
        });
        this.menuItemChargeLimit.add(iconCharge);
        this.menuItemChargeLimit.add_child(this.chargingLimitSlider);
        this.menuItemChargeLimit.add(this.chargeLimitLabel);
        menu.addMenuItem(new popupMenu.PopupSeparatorMenuItem());
        menu.addMenuItem(chargingLimitItemHeadline);
        menu.addMenuItem(this.menuItemChargeLimit);
    }
}
//# sourceMappingURL=charge.js.map