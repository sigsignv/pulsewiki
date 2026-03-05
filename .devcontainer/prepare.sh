#!/bin/sh

set -u

WORKSPACE_DIR="$(pwd)"

printf '%s\n' "Preparing Apache httpd environment"
printf '%s\n' "Workspace dir: ${WORKSPACE_DIR}"

if [ -d /var/www/html ] && [ ! -L /var/www/html ]; then
    printf '%s\n' "Remove /var/www/html directory"
    sudo rm -rf /var/www/html
fi

if [ -d "${WORKSPACE_DIR}" ] && [ ! -e /var/www/html ]; then
    printf '%s\n' "Create symlink from ${WORKSPACE_DIR} to /var/www/html"
    sudo ln -s "${WORKSPACE_DIR}" /var/www/html
fi

if command -v apache2ctl >/dev/null 2>&1; then
    printf '%s\n' "Starting Apache httpd server"
    apache2ctl start
fi
