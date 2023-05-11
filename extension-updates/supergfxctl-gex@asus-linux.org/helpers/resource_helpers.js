const Me = imports.misc.extensionUtils.getCurrentExtension();
const { Gio, GLib } = imports.gi;
const Log = Me.imports.modules.log;

var File = class File {
    static DBus(name) {
        const file = `${Me.path}/resources/dbus/${name}.xml`;

        try {
            const [ok, bytes] = GLib.file_get_contents(file);
            if (!ok)
                Log.warn(`Couldn't read contents of "${file}"`);
            return ok ? imports.byteArray.toString(bytes) : undefined;
        }
        catch (e) {
            Log.error(`Failed to load "${file}"`, e);
        }
    }
}

var Icon = class Icon {
    static getByName(name) {
        const iconPath = 'resource://org/gnome/Shell/Extensions/supergfxctl-gex/icons/scalable';
        const iconNames = [
            'dgpu-active',
            'dgpu-off',
            'dgpu-suspended',
            'gpu-asusmuxdiscreet-active',
            'gpu-asusmuxdiscreet',
            'gpu-compute-active',
            'gpu-compute',
            'gpu-egpu-active',
            'gpu-egpu',
            'gpu-hybrid-active',
            'gpu-hybrid',
            'gpu-integrated-active',
            'gpu-integrated',
            'gpu-nvidianomodeset-active',
            'gpu-nvidianomodeset',
            'gpu-vfio-active',
            'gpu-vfio',
            'reboot',
        ];
        const res = {};

        for (const iconName of iconNames) {
            res[iconName] = new Gio.FileIcon({
                file: Gio.File.new_for_uri(`${iconPath}/${iconName}.svg`),
            });
        }
        if (res[name] !== undefined)
            return res[name];
        return new Gio.ThemedIcon({ name: name });
    }
}
