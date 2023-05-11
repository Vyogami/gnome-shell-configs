const Me = imports.misc.extensionUtils.getCurrentExtension();
const { GLib } = imports.gi;
const Config = imports.misc.config;
const [major] = Config.PACKAGE_VERSION.split('.').map((s) => Number(s));
const Log = Me.imports.modules.log;

function spawnCommandLine(command) {
    try {
        GLib.spawn_command_line_async(command);
    }
    catch (e) {
        Log.error(`Spawning command failed: ${command}`, e);
    }
}

function getGnomeShellVersion() {
    return major >= 40 ? major : undefined;
}
