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

# Main program
echo "GNOME and Extension Settings Loader"

while true; do
    echo "Menu:"
    echo "1. Load GNOME settings"
    echo "2. Load extension settings"
    echo "3. Quit"

    read -p "Enter your choice: " choice

    case $choice in
        1)
            load_gnome_settings
            ;;
        2)
            load_extension_settings
            ;;
        3)
            echo "Exiting program."
            break
            ;;
        *)
            echo "Invalid choice. Please try again."
            ;;
    esac

    echo
done

