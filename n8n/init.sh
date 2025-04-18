# import workflows
n8n import:workflow --input=/backup/workflows.json

# activate workflows that are active
jq -r '.[] | select(.active == true) | .id' /backup/workflows.json | xargs -I {} n8n update:workflow --id={} --active=true
