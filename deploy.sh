#!/bin/bash
set -e

SERVER="ubuntu@15.188.200.219"
KEY="$HOME/.ssh/it2p.pem"
SSH="ssh -i $KEY"
RSYNC="rsync -az -e \"ssh -i $KEY\""

echo "==> Building..."
npm run build

echo "==> Syncing .next to server..."
rsync -az -e "ssh -i $KEY" .next "$SERVER:/var/www/it2p/"

echo "==> Restarting app..."
$SSH "$SERVER" "sudo systemctl restart it2p"

echo "==> Checking status..."
$SSH "$SERVER" "sudo systemctl is-active it2p"

echo ""
echo "Done — https://it2p.solydev.com"
