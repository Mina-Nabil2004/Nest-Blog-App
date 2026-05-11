# Deployment Guide

## Prerequisites

- AWS account
- GitHub repository with the project code
- Domain name (optional)

---

## Step 1: Create an IAM User for S3

1. Open the [AWS Console](https://console.aws.amazon.com) → **IAM** → **Users** → **Create user**
2. Username: `blog-app-s3`
3. **Permissions**: Attach policy `AmazonS3FullAccess`
4. After creating, go to **Security credentials** → **Create access key** → choose **Application running outside AWS**
5. Save the **Access key ID** and **Secret access key** — you'll need them in `.env`

---

## Step 2: Create an S3 Bucket

1. Open **S3** → **Create bucket**
2. Bucket name: e.g. `blog-app-uploads`
3. Region: `us-east-1` (or your preferred region — must match `AWS_REGION` in `.env`)
4. **Block Public Access**: Uncheck **Block all public access** (and acknowledge the warning) — images must be publicly readable in the browser
5. After creation, go to **Permissions** → **Bucket policy** → **Edit** and add (replace `your-bucket-name`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

6. Then go to **Permissions** → **CORS** → **Edit** and add:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

---

## Step 3: Launch an EC2 Instance

1. Open **EC2** → **Launch instance**
2. **AMI**: Ubuntu Server 22.04 LTS
3. **Instance type**: `t3.small` (recommended) or `t2.micro` (free tier)
4. **Key pair**: Create a new key pair → download the `.pem` file and keep it safe
5. **Security group** — add these inbound rules:

| Type  | Port | Source    |
|-------|------|-----------|
| SSH   | 22   | Your IP   |
| Custom TCP | 8080 | 0.0.0.0/0 |
| Custom TCP | 15672 | Your IP (RabbitMQ UI) |

6. Launch the instance and note the **Public IPv4 address**

---

## Step 4: Set Up Docker on EC2

SSH into your instance:

```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

Install Docker and Docker Compose:

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu
```

Log out and back in for the group change to take effect:

```bash
exit
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

---

## Step 5: Deploy the App

Clone the repository and configure the environment:

```bash
cd /home/ubuntu
git clone https://github.com/<your-username>/blog-app.git
cd blog-app/Nest-Blog-App
cp .env .env.backup
nano .env
```

Fill in the real values for:

```
APP_URL=http://<EC2_PUBLIC_IP>:8080

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<from Step 1>
AWS_SECRET_ACCESS_KEY=<from Step 1>
AWS_S3_BUCKET=<from Step 2>

RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
```

Start the application:

```bash
docker compose up -d --build
```

Verify all containers are running:

```bash
docker compose ps
```

---

## Step 6: Set Up GitHub Actions CI/CD

In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret** and add:

| Secret name   | Value                                      |
|---------------|--------------------------------------------|
| `EC2_HOST`    | Your EC2 public IP address                 |
| `EC2_USER`    | `ubuntu`                                   |
| `EC2_SSH_KEY` | Contents of your `.pem` file (entire text) |

To get the SSH key content:

```bash
cat your-key.pem
```

Copy the entire output including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`.

From now on, every push to `main` will run tests and auto-deploy to EC2.

---

## Access URLs

| Service          | URL                                      |
|------------------|------------------------------------------|
| API (Swagger UI) | `http://<EC2_IP>:8080/api`              |
| RabbitMQ UI      | `http://<EC2_IP>:15672` (guest / guest) |

---

## Useful Commands

```bash
# View logs
docker compose logs -f app

# Restart the app
docker compose restart app

# Full redeploy
docker compose down && docker compose up -d --build

# Run migrations manually
docker compose exec app npm run migration:run
```
