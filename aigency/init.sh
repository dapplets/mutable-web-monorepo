# install latest community nodes
mkdir /home/node/.n8n/nodes
cd /home/node/.n8n/nodes
npm i @dapplets/n8n-nodes-aigency@latest
cd ~

cp /backup/credentials.json /home/node/credentials.json

# fill credentials from env variables
sed -i "s/\$OPENAI_API_KEY/${OPENAI_API_KEY}/g" /home/node/credentials.json
sed -i "s/\$AIGENCY_API_KEY/${AIGENCY_API_KEY}/g" /home/node/credentials.json
sed -i "s/\$AIGENCY_API_URL/${AIGENCY_API_URL}/g" /home/node/credentials.json

# import credentials
n8n import:credentials --input=/home/node/credentials.json

# import workflows
n8n import:workflow --input=/backup/workflows.json

# activate workflows that are active
jq -r '.[] | select(.active == true) | .id' /backup/workflows.json | xargs -I {} n8n update:workflow --id={} --active=true
