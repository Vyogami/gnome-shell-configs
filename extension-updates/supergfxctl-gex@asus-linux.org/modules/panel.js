const Me = imports.misc.extensionUtils.getCurrentExtension();
const { GObject } = imports.gi;
const { popupMenu } = imports.ui;
const { QuickMenuToggle, SystemIndicator } = imports.ui.quickSettings;
const Resources = Me.imports.helpers.resource_helpers;
const { DBus } = Me.imports.modules.dbus;
const { LabelType } = Me.imports.helpers.label_helper;

var gpuModeIndicator = GObject.registerClass(class gpuModeIndicator extends SystemIndicator {

    constructor() {
        super();
    }
});

var gpuModeToggle = GObject.registerClass(class gpuModeToggle extends QuickMenuToggle {

    constructor(gpuModeIndicator) {
        super();
        this._dbus = null;
        this._gpuModeIndicator = null;
        this._gpuModeItems = new Map();
        this._gpuModeIndicator = gpuModeIndicator;
        this._gpuModeIndicator._indicator =
            this._gpuModeIndicator._addIndicator();
        this._gpuModeIndicator._indicator.visible = true;
        this._gpuModeSection = new popupMenu.PopupMenuSection();
        this.menu.addMenuItem(this._gpuModeSection);
        this._dbus = new DBus(this);
        this._labels = this._dbus.labelHelper;
        this.refresh();
    }

    refresh() {
        if (this._dbus === null)
            return;
        this._gpuModeSection.removeAll();
        this._gpuModeItems.clear();
        const lastState = this._dbus.lastState;

        for (const key in this._dbus.supported) {
            if (Object.prototype.hasOwnProperty.call(this._dbus.supported, key)) {
                const element = this._dbus.supported[key];
                const item = new popupMenu.PopupImageMenuItem(this._labels.get(LabelType.GfxMenu, element), Resources.Icon.getByName(`gpu-${this._labels.get(LabelType.Gfx, element)}`));
                item.connect('activate', () => {
                    this._dbus.gfxMode = element;
                });
                this._gpuModeItems.set(element, item);
                this._gpuModeSection.addMenuItem(item);
            }
        }
        this._gpuModeSection.addMenuItem(new popupMenu.PopupSeparatorMenuItem());

        for (const [profile, item] of this._gpuModeItems) {
            item.setOrnament(profile === lastState
                ? popupMenu.Ornament.DOT
                : popupMenu.Ornament.NONE);
        }
        let powerItem = new popupMenu.PopupImageMenuItem(`dedicated GPU is ${this._labels.get(LabelType.Power, this._dbus.lastPowerState)}`, Resources.Icon.getByName(`dgpu-${this._labels.get(LabelType.PowerFileName, this._dbus.lastPowerState)}`));
        powerItem.sensitive = false;
        powerItem.active = false;
        this._gpuModeSection.addMenuItem(powerItem);
        const title = `${this._labels.get(LabelType.GfxMenu, this._dbus.lastState)} (${this._labels.get(LabelType.Power, this._dbus.lastPowerState)})`;
        if (this._labels.gsVersion >= 44)
            this.title = title;
        else
            this.label = title;
        const icon = Resources.Icon.getByName(`gpu-${this._labels.get(LabelType.Gfx, this._dbus.lastState)}${this._labels.get(LabelType.PowerFileName, this._dbus.lastPowerState) == 'active'
            ? '-active'
            : ''}`);
        this.gicon = icon;
        this.addIndicator();
        this.menu.setHeader(icon, `${this._labels.get(LabelType.GfxMenu, this._dbus.lastState)} (${this._labels.get(LabelType.Power, this._dbus.lastPowerState)})`);
    }

    addIndicator() {
        this._gpuModeIndicator.remove_actor(this._gpuModeIndicator._indicator);
        this._gpuModeIndicator._indicator.gicon = Resources.Icon.getByName(`gpu-${this._labels.get(LabelType.Gfx, this._dbus.lastState)}${this._labels.get(LabelType.PowerFileName, this._dbus.lastPowerState) == 'active'
            ? '-active'
            : ''}`);
        this._gpuModeIndicator._indicator.style_class =
            'supergfxctl-gex panel-icon system-status-icon';
        this._gpuModeIndicator.add_actor(this._gpuModeIndicator._indicator);
    }

    disable() {
        this.destroy();
        this._dbus = null;
        this._labels = null;
        this._gpuModeIndicator = null;
    }
});
