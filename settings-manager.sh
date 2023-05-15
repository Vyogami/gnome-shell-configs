#!/bin/bash

# Function to load GNOME settings
load_gnome_settings() {
    read -p "Enter the name of the GNOME settings file (or leave blank for default): " gnome_settings_file

    if [[ -z "$gnome_settings_file" ]]; then
        gnome_settings_file="gnome-settings.ini"
    fi

    if [ ! -f "$gnome_settings_file" ]; then
        echo "GNOME settings file not found: $gnome_settings_file"
        return
    fi

    echo "Loading GNOME settings..."
    dconf load / < "$gnome_settings_file"
    echo "GNOME settings loaded successfully."
}

# Function to save current GNOME settings
save_gnome_settings() {
    read -p "Enter the name of the GNOME settings file to save (or leave blank for default): " gnome_settings_file

    if [[ -z "$gnome_settings_file" ]]; then
        gnome_settings_file="gnome-settings.ini"
    fi

    echo "Saving current GNOME settings..."
    dconf dump / > "$gnome_settings_file"
    echo "GNOME settings saved successfully."
}

# Function to load extension settings
load_extension_settings() {
    read -p "Enter the name of the extension settings file (or leave blank for default): " extension_settings_file

    if [[ -z "$extension_settings_file" ]]; then
        extension_settings_file="extension-settings.ini"
    fi

    if [ ! -f "$extension_settings_file" ]; then
        echo "Extension settings file not found: $extension_settings_file"
        return
    fi

    echo "Loading extension settings..."
    dconf load /org/gnome/shell/extensions/ < "$extension_settings_file"
    echo "Extension settings loaded successfully."
}

# Function to save current extension settings
save_extension_settings() {
    read -p "Enter the name of the extension settings file to save (or leave blank for default): " extension_settings_file

    if [[ -z "$extension_settings_file" ]]; then
        extension_settings_file="extension-settings.ini"
    fi

    echo "Saving current extension settings..."
    dconf dump /org/gnome/shell/extensions/ > "$extension_settings_file"
    echo "Extension settings saved successfully."
}

# Main program
echo "GNOME and Extension Settings Loader"

while true; do
    echo "Menu:"
    echo "1. Load GNOME settings"
    echo "2. Save current GNOME settings"
    echo "3. Load extension settings"
    echo "4. Save current extension settings"
    echo "5. Quit"

    read -p "Enter your choice: " choice

    case $choice in
        1)
            load_gnome_settings
            ;;
        2)
            save_gnome_settings
            ;;
        3)
            load_extension_settings
            ;;
        4)
            save_extension_settings
            ;;
        5)
            echo "Exiting program."
            break
            ;;
        *)
            echo "Invalid choice. Please try again."
            ;;
    esac

    echo
done
