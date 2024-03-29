# Gnome Shell Configs

This repository contains my configurations for the Gnome desktop environment. It includes a collection of extensions and related settings that enhance the functionality and appearance of the Gnome Shell.

## Extensions

The following Gnome Shell extensions are stored in this repository:

- **AlphabeticalAppGrid @stuarthayhurst**: Restore the alphabetical ordering of the app grid.
- **asusctl-gex @asus-linux**: Extension for visualizing asusctl(asusd) settings and status..
  > [!WARNING]
  > Incompatible with gnome 45
- **bluetooth-quick-connect @bjarosze**: Allows quick and easy connection to Bluetooth devices directly from the control panel.
- **blur-my-shell @aunetx**: Adds a blur effect to various elements of the Gnome Shell, giving a sleek and modern look.
- **caffeine @patapon**: Prevents the system from suspending or activating the screensaver when active.
- **clipboard-indicator @tudmotu**: Provides a clipboard history and allows easy access to previously copied items.
- **color-picker @tuberry**: Enables picking colors from the screen and provides a color picker tool.
- **display-scale-switcher @knokelmaat**: Allows quick switching between different display scaling options from control panel.
- **gnome-extension-brightness @bruno.englert**: Adds brightness controls to the control panel for easy adjustment.
- **gtktitlebar @velitasali**: Removes the title bar from maximized windows, saving screen space.
- **just-perfection-desktop @just-perfection**: Customizes the desktop layout, including the taskbar, app menu, and system tray.
- **netspeed simplified @prateekmedia**: Displays network speed indicators in the top bar.
  > [!NOTE]
  > Compatible with Gnome 44, 45
- **openweather-extension @jenslody**: Provides weather information in the top bar, including current conditions and forecasts.
- **quick-settings-tweaks @qwreey**: Adds additional settings and tweaks to the Gnome Shell top bar.
- **reorder-workspaces @jer**: Allows reordering of workspaces in the Activities Overview.
- **panellScroll @sun.wxg**: Enables scrolling through workspaces using the mouse wheel or touchpad gestures.
- **supergfxctl-gex @asus-linux**: Adds advanced graphics settings and control for ASUS laptops.
- **top-bar-organizer @julian.gse.jsts**: Allows customization and organization of items in the top bar.
- **unite @hardpixel.eu**: Combines the title bar and top bar to save vertical screen space.
- **hanabi-extension @jeffshee**: Live wallpaper for gnome.
- **gnome-ui-tune @itstime.tech**: some of the subtle yet ease of life improvements for gnome ui.
- **dash-to-dock @micxgx**: customization options for gnome dash.

These extensions provide additional functionality, customization options, and convenience features to enhance your Gnome Shell experience.

## Themes

It contains my custom theme along with some of my favorite themes.

- **codereaper**: this is my custom theme.
    ![codereaper-theme](./assets/codereaper-desktop-min.png)

## Usage

To use these Gnome Shell configurations and extensions, follow these steps:

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/vyogami/gnome-shell-configs.git ~/.local/share/gnome-shell
   ```

1. Load the Gnome Shell settings and extensions:

   - Run the `settings-manager.sh` script to load and save the Gnome Shell settings and extensions configurations.
   - Alternatively, manually copy the contents of the `gnome-settings.ini` and `extensions-settings.ini` files to their respective locations in your Gnome Shell configuration directory.

1. Customize the Gnome Shell configurations according to your preferences. Feel free to modify or add extensions, update settings, or change the applied theme.
