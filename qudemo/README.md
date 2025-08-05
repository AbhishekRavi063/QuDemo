# YouTube Download VM Setup

This guide creates a Google Cloud VM that runs a Flask app for downloading YouTube videos using yt-dlp.

## Prerequisites

- Google Cloud CLI configured (`gcloud auth login`)
- A Google Cloud project with billing enabled
- YouTube cookies file (optional, for age-restricted/private videos)

## Quick Setup Commands

### 1. Set Variables
```bash
PROJECT_ID="your-project-id"
VM_NAME="yt-download-vm"
ZONE="us-central1-a"
STATIC_IP_NAME="yt-download-ip"
```

### 2. Reserve Static IP
```bash
gcloud compute addresses create $STATIC_IP_NAME \
    --project=$PROJECT_ID \
    --region=$(echo $ZONE | cut -d'-' -f1,2)
```

### 3. Create Firewall Rule
```bash
gcloud compute firewall-rules create yt-download-allow-8000 \
    --project=$PROJECT_ID \
    --direction=INGRESS \
    --priority=1000 \
    --network=default \
    --action=ALLOW \
    --rules=tcp:8000 \
    --source-ranges=0.0.0.0/0 \
    --target-tags=yt-download
```

### 4. Create VM with Startup Script
```bash
gcloud compute instances create $VM_NAME \
    --project=$PROJECT_ID \
    --zone=$ZONE \
    --machine-type=e2-small \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --tags=yt-download \
    --address=$(gcloud compute addresses describe $STATIC_IP_NAME --region=$(echo $ZONE | cut -d'-' -f1,2) --format="value(address)") \
    --metadata-from-file=startup-script=startup-script.sh \
    --metadata=shutdown-script=shutdown-script.sh
```

### 5. Upload YouTube Cookies (Optional)
```bash
# First, create your cookies file (see Cookies Setup section below)
chmod +x setup-cookies.sh
./setup-cookies.sh
```

### 6. Test the Endpoint
```bash
# Get the static IP
STATIC_IP=$(gcloud compute addresses describe $STATIC_IP_NAME --region=$(echo $ZONE | cut -d'-' -f1,2) --format="value(address)")

# Test with a YouTube URL
curl "http://$STATIC_IP:8000/download?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

## Files

### startup-script.sh
The startup script that runs when the VM boots up.

### app.py
The Flask application that handles YouTube downloads.

### requirements.txt
Python dependencies for the Flask app.

### systemd service files
- `ytapp.service` - Systemd service configuration
- `shutdown-script.sh` - Cleanup script

### setup-cookies.sh
Helper script to set up YouTube cookies for authenticated downloads.

## Manual Setup (if needed)

If you need to manually set up the VM:

1. SSH into the VM:
```bash
gcloud compute ssh $VM_NAME --zone=$ZONE
```

2. Run the setup commands:
```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv ffmpeg
sudo mkdir -p /opt/ytapp
cd /opt/ytapp
```

3. Create the Flask app and install dependencies:
```bash
# Copy app.py and requirements.txt to /opt/ytapp/
sudo pip3 install -r requirements.txt
```

4. Set up systemd service:
```bash
sudo systemctl enable ytapp
sudo systemctl start ytapp
```

## Cookies Setup

For downloading age-restricted or private YouTube videos, you need to provide cookies from your logged-in YouTube session.

### Quick Setup
```bash
chmod +x setup-cookies.sh
./setup-cookies.sh
```

### Manual Setup

1. **Get YouTube Cookies:**
   - **Easiest:** Install "Get cookies.txt" browser extension
   - **Manual:** F12 → Application → Cookies → youtube.com
   - **Command line:** `curl -c youtube_cookies.txt -b youtube_cookies.txt "https://www.youtube.com"`

2. **Upload to VM:**
   ```bash
   gcloud compute scp youtube_cookies.txt yt-download-vm:/opt/ytapp/ --zone=us-central1-a
   ```

## Usage

### Download a public video:
```bash
curl "http://YOUR_STATIC_IP:8000/download?url=https://www.youtube.com/watch?v=VIDEO_ID"
```

### Download age-restricted/private video (with cookies):
```bash
curl "http://YOUR_STATIC_IP:8000/download?url=https://www.youtube.com/watch?v=VIDEO_ID&use_cookies=true"
```

## Monitoring

Check service status:
```bash
gcloud compute ssh $VM_NAME --zone=$ZONE --command="sudo systemctl status ytapp"
```

View logs:
```bash
gcloud compute ssh $VM_NAME --zone=$ZONE --command="sudo journalctl -u ytapp -f"
```

## Cleanup

To delete the VM and resources:
```bash
gcloud compute instances delete $VM_NAME --zone=$ZONE
gcloud compute addresses delete $STATIC_IP_NAME --region=$(echo $ZONE | cut -d'-' -f1,2)
gcloud compute firewall-rules delete yt-download-allow-8000
```

## Security Notes

- The firewall rule allows access from any IP (0.0.0.0/0)
- Consider restricting to your IP range for production use
- The app runs as root for simplicity; consider using a dedicated user for production
- Temporary files are automatically cleaned up after each request 