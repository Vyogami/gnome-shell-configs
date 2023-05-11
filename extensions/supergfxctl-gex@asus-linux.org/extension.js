const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const { Gio } = imports.gi;
const Log = Me.imports.modules.log;
const Panel = Me.imports.modules.panel;

var Extension = class Extension {
    gpuModeIndicator = null;
    quickToggles = null;
    systemMenu = null;

    enable() {
        Gio.Resource.load(`${Me.path}/resources/org.gnome.Shell.Extensions.supergfxctl-gex.gresource`)._register();
        this.systemMenu = Main.panel.statusArea.quickSettings;
        if (typeof this.systemMenu == 'undefined') {
            Log.raw('init', 'system menu is not defined');
            return false;
        }
        this.gpuModeIndicator = new Panel.gpuModeIndicator();
        this.quickToggles = new Panel.gpuModeToggle(this.gpuModeIndicator);
        this.gpuModeIndicator.quickSettingsItems.push(this.quickToggles);
        this.enableSystemMenu();
        return true;
    }

    enableSystemMenu() {
        this.systemMenu._indicators.remove_child(this.systemMenu._system);
        this.systemMenu._indicators.add_child(this.gpuModeIndicator);
        this.systemMenu._indicators.add_child(this.systemMenu._system);
        this.systemMenu._addItems(this.gpuModeIndicator.quickSettingsItems);

        for (const item of this.gpuModeIndicator.quickSettingsItems) {
            this.systemMenu.menu._grid.set_child_below_sibling(item, this.systemMenu._backgroundApps.quickSettingsItems[0]);
        }
    }

    disable() {
        this.quickToggles?.disable();
        this.gpuModeIndicator?.destroy();
        this.quickToggles = null;
        this.gpuModeIndicator = null;
    }
}

function init() {
    return new Extension();
}
