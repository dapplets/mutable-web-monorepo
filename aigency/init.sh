#!/bin/bash
set -e

echo "🔧 Ensuring custom nodes directory exists..."
mkdir -p /home/node/.n8n/nodes

echo "📦 Installing latest community nodes..."
cd /home/node/.n8n/nodes
npm install @dapplets/n8n-nodes-aigency@latest || echo "⚠️ npm install completed with warnings."

echo "📁 Returning to home directory..."
cd ~

echo "📋 Copying credentials backup..."
cp /backup/credentials.json /home/node/credentials.json

echo "🔐 Filling in credentials from environment variables..."
# Using delimiter ! to avoid escaping issues with '/' or other characters in the keys
sed -i "s!\$OPENAI_API_KEY!${OPENAI_API_KEY}!g" /home/node/credentials.json
sed -i "s!\$AIGENCY_API_KEY!${AIGENCY_API_KEY}!g" /home/node/credentials.json
sed -i "s!\$AIGENCY_API_URL!${AIGENCY_API_URL}!g" /home/node/credentials.json

echo "⬇️ Importing credentials to n8n..."
n8n import:credentials --input=/home/node/credentials.json

echo "⬇️ Importing workflows to n8n..."
n8n import:workflow --input=/backup/workflows.json

echo "✅ Activating workflows marked as active in JSON..."
jq -r '.[] | select(.active == true) | .id' /backup/workflows.json | while read -r id; do
  echo "➡️ Activating workflow ID: $id"
  n8n update:workflow --id="$id" --active=true || echo "⚠️ Warning: activation requires n8n restart"
done