const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const { Gio } = imports.gi;
const Log = Me.imports.modules.log;
const Panel = Me.imports.modules.panel;

var Extension = class Extension {
    constructor() {
        this.gpuModeIndicator = null;
        this.quickToggles = null;
        this.systemMenu = null;
    }
    enable() {
        Gio.Resource.load(`${Me.path}/resources/org.gnome.Shell.Extensions.supergfxctl-gex.gresource`)._register();
        this.systemMenu = Main.panel.statusArea.quickSettings;
        if (typeof this.systemMenu == 'undefined') {
            Log.raw('init', 'system menu is not defined');
            return false;
        }
        this.gpuModeIndicator = new Panel.gpuModeIndicator();
        this.quickToggles = new Panel.gpuModeToggle(this.gpuModeIndicator);
        this.gpuModeIndicator._indicator = this.gpuModeIndicator._addIndicator();
        this.gpuModeIndicator._indicator.visible = true;
        this.gpuModeIndicator.quickSettingsItems.push(this.quickToggles);
        this.systemMenu._indicators.remove_child(this.systemMenu._system);
        this.systemMenu._indicators.add_child(this.gpuModeIndicator);
        this.systemMenu._addItems(this.gpuModeIndicator.quickSettingsItems);
        this.systemMenu._indicators.add_child(this.systemMenu._system);
    }
    disable() {
        this.quickToggles.stop();
        this.quickToggles.destroy();
        this.quickToggles = null;
        this.gpuModeIndicator.destroy();
        this.gpuModeIndicator = null;
    }
}

function init() {
    return new Extension();
}
