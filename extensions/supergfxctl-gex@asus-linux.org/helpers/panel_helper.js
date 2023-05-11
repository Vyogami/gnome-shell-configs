const Me = imports.misc.extensionUtils.getCurrentExtension();
const Util = imports.misc.util;
const { main, messageTray } = imports.ui;
const Resources = Me.imports.helpers.resource_helpers;

var PanelHelper = class PanelHelper {
    static notify(details, icon, action = '', urgency = 2) {
        const params = { gicon: Resources.Icon.getByName(icon) };
        const source = new messageTray.Source('Super Graphics Control', icon, params);
        const notification = new messageTray.Notification(source, 'Super Graphics Control', details, params);
        main.messageTray.add(source);
        notification.setTransient(true);

        switch (action) {
            case 'logout':
                notification.setUrgency(3);
                notification.addAction('Log Out Now!', () => {
                    Util.spawnCommandLine('gnome-session-quit');
                });
                break;
            case 'reboot':
                notification.setUrgency(3);
                notification.addAction('Reboot Now!', () => {
                    Util.spawnCommandLine('shutdown -ar now');
                });
                break;
            default:
                notification.setUrgency(urgency);
        }
        source.showNotification(notification);
    }
}
