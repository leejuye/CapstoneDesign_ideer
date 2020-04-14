#!/bin/bash
# +--------------------------------+
# | npm postinstall                |
# | Hotword Installer by Bugsounet |
# | Rev 1.0.6                      |
# +--------------------------------+

# get the installer directory
Installer_get_current_dir () {
  SOURCE="${BASH_SOURCE[0]}"
  while [ -h "$SOURCE" ]; do
    DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
  done
  echo "$( cd -P "$( dirname "$SOURCE" )" && pwd )"
}

Installer_dir="$(Installer_get_current_dir)"

# move to installler directory
cd "$Installer_dir"

source utils.sh
source hotword.sh

# del last log
rm installer.log 2>/dev/null

# logs in installer.log file
Installer_log

# check version
Installer_version="$(cat ../package.json | grep version | cut -c15-19 2>/dev/null)"

# Let's start !
echo

# Check not run as root
if [ "$EUID" -eq 0 ]; then
  Installer_error "npm install must not be used as root"
  exit 1
fi

# Check platform compatibility
Installer_checkOS
if  [ "$platform" == "osx" ]; then
  exit 0
fi

echo

# Audio out/in checking
Installer_info "Checking Speaker and Microphone..."
Installer_yesno "Do you want check your audio configuration" && (
  Installer_checkaudio
  echo
  Installer_checkmic
  echo

  if [ ! -z "$plug_rec" ]; then
    Installer_warning "This is your Hotword mic working configuration :"
    if [ "$os_name" == "raspbian" ]; then
      Installer_warning "Remember: if you are using RPI, it's better to use arecord program"
    fi
    echo
    Installer_warning "mic: {"
    Installer_warning "  recordProgram: \"arecord\","
    Installer_warning "  device: \"$plug_rec\""
    Installer_warning "},"
  fi
)

echo

# the end...
Installer_exit "Hotword v$Installer_version is now installed !"
