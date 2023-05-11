"use strict";
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const { GObject, Gio, Gtk } = imports.gi;
const asusctlGexPreferencesWindow = GObject.registerClass({
    GTypeName: 'asusctl-gex-preferences',
    Template: Me.dir.get_child('prefs.ui').get_uri(),
    InternalChildren: [
        'notifications_enabled',
        'debug_enabled',
        'supernotice'
    ],
}, class asusctlGexPreferencesWindow extends Gtk.Box {
    _init(preferences) {
        super._init();
        this._preferences = preferences;
        this._preferences.connect('changed', this._syncPreferences.bind(this));
        this._syncPreferences();
        this._notifications_enabled.connect('state-set', (event, state) => !this._preferences.set_boolean('notifications-enabled', state));
        this._debug_enabled.connect('state-set', (event, state) => !this._preferences.set_boolean('debug-enabled', state));
        this._supernotice.connect('state-set', (event, state) => !this._preferences.set_boolean('supernotice', state));
    }
    _syncPreferences() {
        this._notifications_enabled.active = this._preferences.get_boolean('notifications-enabled');
        this._debug_enabled.active = this._preferences.get_boolean('debug-enabled');
        this._supernotice.active = this._preferences.get_boolean('supernotice');
    }
});
function buildPrefsWidget() {
    const preferences = ExtensionUtils.getSettings('org.gnome.shell.extensions.asusctl-gex');
    return new asusctlGexPreferencesWindow(preferences);
}
function init() {
}
//# sourceMappingURL=prefs.js.map