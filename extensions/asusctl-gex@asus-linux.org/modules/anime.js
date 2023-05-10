const Me = imports.misc.extensionUtils.getCurrentExtension();
const { main, popupMenu, slider } = imports.ui;
const { St, Gio } = imports.gi;
const Log = Me.imports.modules.log;
const DBus = Me.imports.modules.anime_dbus;
var Client = class Client {
    constructor() {
        this.connector = new DBus.AnimeDbus();
        this.connected = false;
        this._sliderDragging = false;
        this._sliderChangedId = 0;
    }
    isRunning() {
        return (this.connected && this.connector && this.connector.isRunning());
    }
    start() {
        Log.debug(`Starting AniMe client...`);
        try {
            this.connector.start();
            this.connected = this.connector.isRunning();
            this.populatePopup();
        }
        catch (e) {
            Log.error(`AniMe client start failed!`, e);
        }
    }
    stop() {
        Log.debug(`Stopping AniMe client...`);
        if (this.isRunning()) {
            this.connected = false;
            this.connector.stop();
        }
    }
    populatePopup() {
        if (!this.isRunning())
            return;
        let menu = main.panel.statusArea['asusctl-gex.panel'].menu;
        this.itemAnimeParent = new popupMenu.PopupBaseMenuItem({ activate: false, style_class: 'asusctl-gex-menu-item asusctl-gex-anime-item' });
        const animeItemHeadline = new popupMenu.PopupMenuItem('AniMe Matrix', { hover: false, can_focus: false, style_class: 'headline headline-label asusctl-gex-menu-item' });
        animeItemHeadline.sensitive = false;
        animeItemHeadline.active = false;
        let iconAnime = new St.Icon({
            gicon: Gio.icon_new_for_string(`${Me.path}/icons/scalable/anime.svg`),
            style_class: 'popup-menu-icon'
        });
        this.itemAnimeParent.add(iconAnime);
        this.animeBrightnessSlider = new slider.Slider(0);
        this.animeBrightnessSlider._disabled = true;
        this.animeBrightnessSlider.connect('drag-begin', () => (this._sliderDragging = true));
        this.animeBrightnessSlider.value = 1;
        this._sliderChangedId = this.animeBrightnessSlider.connect('notify::value', () => {
            let sliderValue = Math.round(this.animeBrightnessSlider.value * 100) / 100;
            if (!this._sliderDragging && sliderValue !== this.connector.brightness) {
                this.connector.brightness = sliderValue;
                this.connector.setBrightness(sliderValue);
            }
        });
        this.itemAnimeParent.connect('scroll-event', (actor, event) => {
            return this.animeBrightnessSlider.emit('scroll-event', event);
        });
        this.animeBrightnessSlider.connect('drag-end', () => {
            this._sliderDragging = false;
            let sliderValue = Math.round(this.animeBrightnessSlider.value * 100) / 100;
            if (sliderValue !== this.connector.brightness) {
                this.connector.brightness = sliderValue;
                this.connector.setBrightness(sliderValue);
            }
        });
        let bulbIcon = new St.Icon({
            gicon: Gio.icon_new_for_string(`${Me.path}/icons/scalable/bulb-on.svg`),
            style_class: 'asusctl-gex-switch-button-icon active'
        });
        this.itemAnimeSwitcher = new St.Button({
            style_class: 'asusctl-gex-switch-button active',
            accessible_name: 'On',
            child: bulbIcon,
        });
        this.itemAnimeSwitcher.connect('clicked', (object, value) => {
            this.connector.setOnOffState(null);
            if (this.itemAnimeSwitcher.style_class.includes('active')) {
                this.itemAnimeSwitcher.style_class = this.itemAnimeSwitcher.style_class.split('active').join(' ');
                bulbIcon.gicon = Gio.icon_new_for_string(`${Me.path}/icons/scalable/bulb-off.svg`);
            }
            else {
                this.itemAnimeSwitcher.style_class = `${this.itemAnimeSwitcher.style_class} active`;
                bulbIcon.gicon = Gio.icon_new_for_string(`${Me.path}/icons/scalable/bulb-on.svg`);
            }
        });
        this.itemAnimeParent.add(iconAnime);
        this.itemAnimeParent.add_child(this.animeBrightnessSlider);
        this.itemAnimeParent.add_child(this.itemAnimeSwitcher);
        menu.addMenuItem(new popupMenu.PopupSeparatorMenuItem());
        menu.addMenuItem(animeItemHeadline);
        menu.addMenuItem(this.itemAnimeParent);
    }
}
//# sourceMappingURL=anime.js.map