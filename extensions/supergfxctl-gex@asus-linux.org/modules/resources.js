const Me = imports.misc.extensionUtils.getCurrentExtension();
const { Gio, GLib } = imports.gi;
const Log = Me.imports.modules.log;

var File = class File {
    static DBus(name) {
        let file = `${Me.path}/resources/dbus/${name}.xml`;
        try {
            let [_ok, bytes] = GLib.file_get_contents(file);
            if (!_ok)
                Log.warn(`Couldn't read contents of "${file}"`);
            return _ok ? imports.byteArray.toString(bytes) : null;
        }
        catch (e) {
            Log.error(`Failed to load "${file}"`, e);
        }
    }
}

function getIcon(name) {
    const settings = imports.gi.St.Settings.get();
    const iconPath = 'resource://org/gnome/Shell/Extensions/supergfxctl-gex/icons/scalable';
    const iconNames = [
        'dgpu-active',
        'dgpu-off',
        'dgpu-suspended',
        'gpu-compute',
        'gpu-compute-active',
        'gpu-asusmuxdiscreet',
        'gpu-asusmuxdiscreet-active',
        'gpu-egpu',
        'gpu-egpu-active',
        'gpu-hybrid',
        'gpu-hybrid-active',
        'gpu-integrated',
        'gpu-integrated-active',
        'gpu-vfio',
        'gpu-vfio-active',
        'reboot',
    ];
    let _resource = {};
    for (const iconName of iconNames) {
        _resource[iconName] = new Gio.FileIcon({
            file: Gio.File.new_for_uri(`${iconPath}/${iconName}.svg`),
        });
    }
    if (_resource[name] !== undefined)
        return _resource[name];
    let _desktop = new imports.gi.Gtk.IconTheme();
    _desktop.set_custom_theme(settings.gtk_icon_theme);
    settings.connect('notify::gtk-icon-theme', (settings_) => {
        _desktop.set_custom_theme(settings_.gtk_icon_theme);
    });
    if (_desktop.has_icon(name))
        return new Gio.ThemedIcon({ name: name });
    return new Gio.ThemedIcon({ name: name });
}
