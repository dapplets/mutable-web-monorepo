# install community nodes
mkdir /home/node/.n8n/nodes
cd /home/node/.n8n/nodes
npm i @dapplets/n8n-nodes-aigency
cd ~

# import credentials
n8n import:credentials --input=/backup/credentials.json

# import workflows
n8n import:workflow --input=/backup/workflows.json

# activate workflows that are active
jq -r '.[] | select(.active == true) | .id' /backup/workflows.json | xargs -I {} n8n update:workflow --id={} --active=true
