#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

PROJECT_ID="${PROJECT_ID:-theta-shuttle-503305-v1}"
REGION="${REGION:-northamerica-northeast2}"
ZONE="${ZONE:-northamerica-northeast2-a}"
AR_REPO="${AR_REPO:-lfa-containers}"
VPC="${VPC:-lfa-prod-vpc}"
SUBNET="${SUBNET:-lfa-prod-subnet}"
SUBNET_CIDR="${SUBNET_CIDR:-10.20.0.0/24}"
PSA_RANGE="${PSA_RANGE:-lfa-google-managed-services}"
PSA_ADDRESS="${PSA_ADDRESS:-10.30.0.0}"
PSA_PREFIX="${PSA_PREFIX:-16}"
SQL_INSTANCE="${SQL_INSTANCE:-lfa-learning-pg}"
SQL_TIER="${SQL_TIER:-db-g1-small}"
DB_NAME="lfa_learning"
RUNTIME_DB_USER="lfa_api"
MIGRATION_DB_USER="lfa_migrator"
RUNTIME_SA_NAME="${RUNTIME_SA_NAME:-lfa-runtime}"
MIGRATION_SA_NAME="${MIGRATION_SA_NAME:-lfa-migration}"
DEPLOY_SA_NAME="${DEPLOY_SA_NAME:-lfa-github-deploy}"
BOOTSTRAP_SA_NAME="${BOOTSTRAP_SA_NAME:-lfa-bootstrap-placeholder}"
DB_RUNTIME_SECRET="${DB_RUNTIME_SECRET:-lfa-db-runtime-url}"
DB_MIGRATION_SECRET="${DB_MIGRATION_SECRET:-lfa-db-migration-url}"
CSRF_SECRET="${CSRF_SECRET:-lfa-csrf-secret}"
SERVICE="${SERVICE:-lfa-learning-api}"
MIGRATION_JOB="${MIGRATION_JOB:-lfa-learning-migrate}"
CLAMAV_VM="${CLAMAV_VM:-lfa-clamav}"
CLAMAV_IP_NAME="${CLAMAV_IP_NAME:-lfa-clamav-ip}"
CLAMAV_IP="${CLAMAV_IP:-10.20.0.10}"
CLAMAV_FIREWALL="${CLAMAV_FIREWALL:-lfa-allow-clamav-from-run}"
CLAMAV_IAP_FIREWALL="${CLAMAV_IAP_FIREWALL:-lfa-allow-ssh-iap}"
WIF_POOL="${WIF_POOL:-lfa-production-github}"
WIF_PROVIDER="${WIF_PROVIDER:-lake-forest-main}"
GITHUB_REPO_ID="${GITHUB_REPO_ID:-1297155950}"
GITHUB_OWNER_ID="${GITHUB_OWNER_ID:-302372423}"
GITHUB_WORKFLOW_REF="${GITHUB_WORKFLOW_REF:-DanteJiao4ever/lake-forest-academy-demo/.github/workflows/deploy-backend.yml@refs/heads/main}"
PLACEHOLDER_IMAGE="${PLACEHOLDER_IMAGE:-us-docker.pkg.dev/cloudrun/container/hello:latest}"

die() {
  echo "ERROR: $*" >&2
  exit 1
}

trap 'printf "=== LFA BOOTSTRAP FAILED rc=%s line=%s ===\n" "$?" "$LINENO" >&2' ERR

command -v gcloud >/dev/null || die "gcloud not found"
command -v openssl >/dev/null || die "openssl not found"
[[ "${CONFIRM_BILLABLE:-}" == "DEPLOY-BILLABLE" ]] || die "Set CONFIRM_BILLABLE=DEPLOY-BILLABLE"
[[ "$GITHUB_REPO_ID" =~ ^[0-9]+$ ]] || die "GITHUB_REPO_ID must be numeric"
[[ "$GITHUB_OWNER_ID" =~ ^[0-9]+$ ]] || die "GITHUB_OWNER_ID must be numeric"

ACTIVE_ACCOUNT="$(gcloud auth list --filter=status:ACTIVE --format='value(account)' | head -n1)"
[[ -n "$ACTIVE_ACCOUNT" ]] || die "No active gcloud account"
unset CLOUDSDK_CORE_PROJECT CLOUDSDK_PROJECT
export GOOGLE_CLOUD_PROJECT="$PROJECT_ID"
command gcloud config set project "$PROJECT_ID" >/dev/null
[[ "$(command gcloud config get-value project)" == "$PROJECT_ID" ]] || die "Active gcloud project mismatch"
gcloud() {
  command gcloud --project="$PROJECT_ID" "$@"
}
BILLING_ENABLED="$(gcloud billing projects describe "$PROJECT_ID" --format='value(billingEnabled)')"
[[ "${BILLING_ENABLED,,}" == "true" ]] || die "Billing is not enabled"

echo "=== STEP 1/11 ENABLE APIS ==="
APIS=(
  artifactregistry.googleapis.com run.googleapis.com sqladmin.googleapis.com
  compute.googleapis.com servicenetworking.googleapis.com secretmanager.googleapis.com
  iam.googleapis.com iamcredentials.googleapis.com sts.googleapis.com
  drive.googleapis.com cloudresourcemanager.googleapis.com serviceusage.googleapis.com
  iap.googleapis.com
)
gcloud services enable "${APIS[@]}" --project="$PROJECT_ID"
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
RUNTIME_SA="${RUNTIME_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
MIGRATION_SA="${MIGRATION_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
DEPLOY_SA="${DEPLOY_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
BOOTSTRAP_SA="${BOOTSTRAP_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
CONNECTION_NAME="${PROJECT_ID}:${REGION}:${SQL_INSTANCE}"

echo "=== STEP 2/11 ARTIFACT REGISTRY ==="
if ! gcloud artifacts repositories describe "$AR_REPO" --location="$REGION" >/dev/null 2>&1; then
  gcloud artifacts repositories create "$AR_REPO" \
    --location="$REGION" \
    --repository-format=docker \
    --mode=standard-repository \
    --disable-vulnerability-scanning \
    --description="Lake Forest Learning production containers"
fi

echo "=== STEP 3/11 VPC AND PRIVATE SERVICE ACCESS ==="
if ! gcloud compute networks describe "$VPC" >/dev/null 2>&1; then
  gcloud compute networks create "$VPC" --subnet-mode=custom --bgp-routing-mode=regional
fi
if ! gcloud compute networks subnets describe "$SUBNET" --region="$REGION" >/dev/null 2>&1; then
  gcloud compute networks subnets create "$SUBNET" \
    --region="$REGION" \
    --network="$VPC" \
    --range="$SUBNET_CIDR" \
    --enable-private-ip-google-access
fi
[[ "$(gcloud compute networks subnets describe "$SUBNET" --region="$REGION" --format='value(ipCidrRange)')" == "$SUBNET_CIDR" ]] \
  || die "Existing subnet CIDR differs"

if ! gcloud compute addresses describe "$PSA_RANGE" --global >/dev/null 2>&1; then
  gcloud compute addresses create "$PSA_RANGE" \
    --global \
    --purpose=VPC_PEERING \
    --addresses="$PSA_ADDRESS" \
    --prefix-length="$PSA_PREFIX" \
    --network="$VPC"
fi
if ! gcloud services vpc-peerings list \
  --network="$VPC" \
  --service=servicenetworking.googleapis.com \
  --format='value(network)' | grep -q .; then
  gcloud services vpc-peerings connect \
    --service=servicenetworking.googleapis.com \
    --ranges="$PSA_RANGE" \
    --network="$VPC"
fi

echo "=== STEP 4/11 SERVICE ACCOUNTS AND SECRET CONTAINERS ==="
ensure_sa() {
  local id="$1" label="$2" email="${1}@${PROJECT_ID}.iam.gserviceaccount.com"
  gcloud iam service-accounts describe "$email" >/dev/null 2>&1 || \
    gcloud iam service-accounts create "$id" --display-name="$label"
}
ensure_sa "$RUNTIME_SA_NAME" "LFA API runtime"
ensure_sa "$MIGRATION_SA_NAME" "LFA database migrations"
ensure_sa "$DEPLOY_SA_NAME" "LFA GitHub deployer"
ensure_sa "$BOOTSTRAP_SA_NAME" "LFA unprivileged bootstrap placeholder"

for service_account in "$RUNTIME_SA" "$MIGRATION_SA" "$DEPLOY_SA" "$BOOTSTRAP_SA"; do
  sa_disabled="$(gcloud iam service-accounts describe "$service_account" --format='value(disabled)')"
  [[ "${sa_disabled,,}" != "true" ]] || die "Service account is disabled: ${service_account}"
  [[ -z "$(gcloud iam service-accounts keys list \
    --iam-account="$service_account" \
    --managed-by=user \
    --format='value(name)')" ]] || die "User-managed key exists for ${service_account}"
done
unset sa_disabled

for secret in "$DB_RUNTIME_SECRET" "$DB_MIGRATION_SECRET" "$CSRF_SECRET"; do
  gcloud secrets describe "$secret" >/dev/null 2>&1 || \
    gcloud secrets create "$secret" --replication-policy=automatic
done

has_version() {
  [[ -n "$(gcloud secrets versions list "$1" --filter='state=ENABLED' --limit=1 --format='value(name)')" ]]
}
if ! has_version "$DB_RUNTIME_SECRET"; then
  password="LfaA1!$(openssl rand -hex 24)"
  printf '%s' "postgresql://${RUNTIME_DB_USER}:${password}@127.0.0.1:5432/${DB_NAME}" | \
    gcloud secrets versions add "$DB_RUNTIME_SECRET" --data-file=-
  unset password
fi
if ! has_version "$DB_MIGRATION_SECRET"; then
  password="LfaA1!$(openssl rand -hex 24)"
  printf '%s' "postgresql://${MIGRATION_DB_USER}:${password}@127.0.0.1:5432/${DB_NAME}" | \
    gcloud secrets versions add "$DB_MIGRATION_SECRET" --data-file=-
  unset password
fi
if ! has_version "$CSRF_SECRET"; then
  openssl rand -hex 32 | tr -d '\n' | \
    gcloud secrets versions add "$CSRF_SECRET" --data-file=-
fi

extract_password() {
  local url="$1" user="$2"
  local prefix="postgresql://${user}:" suffix="@127.0.0.1:5432/${DB_NAME}"
  [[ "$url" == "$prefix"*"$suffix" ]] || die "Unexpected DATABASE_URL format for ${user}"
  url="${url#"$prefix"}"
  printf '%s' "${url%"$suffix"}"
}
RUNTIME_DB_URL="$(gcloud secrets versions access latest --secret="$DB_RUNTIME_SECRET")"
MIGRATION_DB_URL="$(gcloud secrets versions access latest --secret="$DB_MIGRATION_SECRET")"
RUNTIME_DB_PASSWORD="$(extract_password "$RUNTIME_DB_URL" "$RUNTIME_DB_USER")"
MIGRATION_DB_PASSWORD="$(extract_password "$MIGRATION_DB_URL" "$MIGRATION_DB_USER")"
unset RUNTIME_DB_URL MIGRATION_DB_URL

echo "=== STEP 5/11 CLOUD SQL (BILLABLE) ==="
if ! gcloud sql instances describe "$SQL_INSTANCE" >/dev/null 2>&1; then
  gcloud sql instances create "$SQL_INSTANCE" \
    --database-version=POSTGRES_16 \
    --edition=enterprise \
    --tier="$SQL_TIER" \
    --region="$REGION" \
    --availability-type=zonal \
    --network="projects/${PROJECT_ID}/global/networks/${VPC}" \
    --no-assign-ip \
    --storage-type=HDD \
    --storage-size=10 \
    --storage-auto-increase \
    --storage-auto-increase-limit=20 \
    --backup-start-time=07:00 \
    --backup-location="$REGION" \
    --retained-backups-count=7 \
    --enable-point-in-time-recovery \
    --deletion-protection \
    --enable-password-policy \
    --password-policy-min-length=20 \
    --password-policy-complexity=COMPLEXITY_DEFAULT \
    --password-policy-disallow-username-substring
fi
[[ "$(gcloud sql instances describe "$SQL_INSTANCE" --format='value(connectionName)')" == "$CONNECTION_NAME" ]] \
  || die "Cloud SQL connection name mismatch"
[[ "$(gcloud sql instances describe "$SQL_INSTANCE" --format='value(settings.tier)')" == "$SQL_TIER" ]] \
  || die "Cloud SQL tier differs; refusing a silent resize"

gcloud sql databases describe "$DB_NAME" --instance="$SQL_INSTANCE" >/dev/null 2>&1 || \
  gcloud sql databases create "$DB_NAME" --instance="$SQL_INSTANCE" --charset=UTF8

echo "=== STEP 6/11 DATABASE USERS ==="
if ! gcloud sql users list --instance="$SQL_INSTANCE" --format='value(name)' | grep -Fxq "$RUNTIME_DB_USER"; then
  # Supplying a non-privileged PostgreSQL role prevents Cloud SQL from giving a
  # new built-in user cloudsqlsuperuser/CREATEDB/CREATEROLE by default. Remove
  # this temporary membership immediately; migration 002 grants the app role.
  gcloud sql users create "$RUNTIME_DB_USER" \
    --instance="$SQL_INSTANCE" \
    --type=BUILT_IN \
    --password="$RUNTIME_DB_PASSWORD" \
    --database-roles=pg_read_all_settings
  gcloud sql users assign-roles "$RUNTIME_DB_USER" \
    --instance="$SQL_INSTANCE" \
    --type=BUILT_IN \
    --revoke-existing-roles \
    --database-roles=
else
  gcloud sql users set-password "$RUNTIME_DB_USER" \
    --instance="$SQL_INSTANCE" \
    --password="$RUNTIME_DB_PASSWORD"
  if ! gcloud sql users assign-roles "$RUNTIME_DB_USER" \
    --instance="$SQL_INSTANCE" \
    --type=BUILT_IN \
    --revoke-existing-roles \
    --database-roles=lfa_app_runtime; then
    echo "lfa_app_runtime is not created yet; keeping runtime at zero roles until migration 002"
    gcloud sql users assign-roles "$RUNTIME_DB_USER" \
      --instance="$SQL_INSTANCE" \
      --type=BUILT_IN \
      --revoke-existing-roles \
      --database-roles=
  fi
fi

if ! gcloud sql users list --instance="$SQL_INSTANCE" --format='value(name)' | grep -Fxq "$MIGRATION_DB_USER"; then
  gcloud sql users create "$MIGRATION_DB_USER" \
    --instance="$SQL_INSTANCE" \
    --type=BUILT_IN \
    --password="$MIGRATION_DB_PASSWORD" \
    --database-roles=cloudsqlsuperuser
else
  gcloud sql users set-password "$MIGRATION_DB_USER" \
    --instance="$SQL_INSTANCE" \
    --password="$MIGRATION_DB_PASSWORD"
fi
gcloud sql users assign-roles "$MIGRATION_DB_USER" \
  --instance="$SQL_INSTANCE" \
  --type=BUILT_IN \
  --revoke-existing-roles \
  --database-roles=cloudsqlsuperuser
unset RUNTIME_DB_PASSWORD MIGRATION_DB_PASSWORD

echo "=== STEP 7/11 CLAMAV VM (BILLABLE) ==="
if ! gcloud compute addresses describe "$CLAMAV_IP_NAME" --region="$REGION" >/dev/null 2>&1; then
  gcloud compute addresses create "$CLAMAV_IP_NAME" \
    --region="$REGION" \
    --subnet="$SUBNET" \
    --addresses="$CLAMAV_IP"
fi
[[ "$(gcloud compute addresses describe "$CLAMAV_IP_NAME" --region="$REGION" --format='value(address)')" == "$CLAMAV_IP" ]] \
  || die "ClamAV reserved IP differs"
if ! gcloud compute firewall-rules describe "$CLAMAV_FIREWALL" >/dev/null 2>&1; then
  gcloud compute firewall-rules create "$CLAMAV_FIREWALL" \
    --network="$VPC" \
    --direction=INGRESS \
    --priority=900 \
    --action=ALLOW \
    --rules=tcp:3310 \
    --source-ranges="$SUBNET_CIDR" \
    --target-tags=lfa-clamav \
    --description="Clamd only from the LFA Direct VPC subnet"
fi
if ! gcloud compute firewall-rules describe "$CLAMAV_IAP_FIREWALL" >/dev/null 2>&1; then
  gcloud compute firewall-rules create "$CLAMAV_IAP_FIREWALL" \
    --network="$VPC" \
    --direction=INGRESS \
    --priority=1000 \
    --action=ALLOW \
    --rules=tcp:22 \
    --source-ranges=35.235.240.0/20 \
    --target-tags=lfa-clamav \
    --description="SSH maintenance through Google Cloud IAP only"
fi

CLAMAV_STARTUP="$(mktemp)"
cat >"$CLAMAV_STARTUP" <<'STARTUP'
#!/usr/bin/env bash
set -Eeuo pipefail
exec > >(tee -a /var/log/lfa-clamav-startup.log /dev/ttyS0) 2>&1
export DEBIAN_FRONTEND=noninteractive

if ! swapon --show=NAME --noheadings | grep -Fxq /swapfile; then
  [[ -f /swapfile ]] || fallocate -l 2G /swapfile
  chmod 600 /swapfile
  file /swapfile | grep -q 'swap file' || mkswap /swapfile
  swapon /swapfile
fi
grep -qE '^/swapfile[[:space:]]' /etc/fstab || echo '/swapfile none swap sw 0 0' >>/etc/fstab

apt-get update
apt-get install -y --no-install-recommends clamav clamav-daemon netcat-openbsd
systemctl stop clamav-freshclam clamav-daemon || true

CONF=/etc/clamav/clamd.conf
sed -Ei '/^[[:space:]]*Example[[:space:]]*$/d' "$CONF"
set_clamd() {
  local key="$1" value="$2"
  sed -Ei "/^[[:space:]#]*${key}([[:space:]]|$)/d" "$CONF"
  printf '%s %s\n' "$key" "$value" >>"$CONF"
}
set_clamd TCPSocket 3310
set_clamd TCPAddr 0.0.0.0
set_clamd StreamMaxLength 30M
set_clamd MaxFileSize 30M
set_clamd MaxScanSize 100M
set_clamd MaxThreads 4
set_clamd MaxQueue 20
set_clamd ConcurrentDatabaseReload yes

mkdir -p /etc/systemd/system/clamav-daemon.service.d
cat >/etc/systemd/system/clamav-daemon.service.d/restart.conf <<'UNIT'
[Service]
Restart=on-failure
RestartSec=30s
UNIT
mkdir -p /etc/systemd/system/clamav-daemon.socket.d
cat >/etc/systemd/system/clamav-daemon.socket.d/lfa-tcp.conf <<'SOCKET'
[Socket]
ListenStream=
ListenStream=/run/clamav/clamd.ctl
ListenStream=0.0.0.0:3310
SOCKET
systemctl daemon-reload

database_exists() {
  find /var/lib/clamav -maxdepth 1 -type f \( -name '*.cvd' -o -name '*.cld' \) \
    -size +1M -print -quit | grep -q .
}
if ! database_exists; then
  for attempt in $(seq 1 12); do
    echo "FreshClam attempt ${attempt}/12"
    if freshclam && database_exists; then
      break
    fi
    sleep 30
  done
else
  freshclam || true
fi
systemctl enable --now clamav-freshclam
systemctl enable clamav-daemon.socket clamav-daemon
systemctl restart clamav-daemon.socket
systemctl restart clamav-daemon || true

for attempt in $(seq 1 60); do
  if printf 'zPING\0' | nc -w 2 127.0.0.1 3310 | grep -q PONG; then
    echo 'LFA_CLAMAV_READY'
    exit 0
  fi
  sleep 5
done
echo 'LFA_CLAMAV_NOT_READY; services remain enabled and retry on failure' >&2
exit 1
STARTUP
chmod 700 "$CLAMAV_STARTUP"

if ! gcloud compute instances describe "$CLAMAV_VM" --zone="$ZONE" >/dev/null 2>&1; then
  gcloud compute instances create "$CLAMAV_VM" \
    --zone="$ZONE" \
    --machine-type=e2-medium \
    --subnet="$SUBNET" \
    --private-network-ip="$CLAMAV_IP" \
    --network-tier=STANDARD \
    --tags=lfa-clamav \
    --image-family=debian-12 \
    --image-project=debian-cloud \
    --boot-disk-type=pd-standard \
    --boot-disk-size=20GB \
    --no-service-account \
    --no-scopes \
    --deletion-protection \
    --shielded-secure-boot \
    --shielded-vtpm \
    --shielded-integrity-monitoring \
    --metadata-from-file=startup-script="$CLAMAV_STARTUP"
fi
rm -f "$CLAMAV_STARTUP"
[[ "$(gcloud compute instances describe "$CLAMAV_VM" --zone="$ZONE" --format='value(networkInterfaces[0].networkIP)')" == "$CLAMAV_IP" ]] \
  || die "ClamAV VM internal IP differs"

echo "=== STEP 8/11 IAM ==="
project_role() {
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$1" \
    --role="$2" \
    --condition=None >/dev/null
}
project_role "$RUNTIME_SA" roles/cloudsql.client
project_role "$MIGRATION_SA" roles/cloudsql.client
project_role "$DEPLOY_SA" roles/cloudsql.viewer
project_role "$DEPLOY_SA" roles/serviceusage.serviceUsageConsumer

gcloud secrets add-iam-policy-binding "$DB_RUNTIME_SECRET" \
  --member="serviceAccount:$RUNTIME_SA" \
  --role=roles/secretmanager.secretAccessor >/dev/null
gcloud secrets add-iam-policy-binding "$DB_MIGRATION_SECRET" \
  --member="serviceAccount:$MIGRATION_SA" \
  --role=roles/secretmanager.secretAccessor >/dev/null
for service_account in "$RUNTIME_SA" "$MIGRATION_SA"; do
  gcloud secrets add-iam-policy-binding "$CSRF_SECRET" \
    --member="serviceAccount:$service_account" \
    --role=roles/secretmanager.secretAccessor >/dev/null
done
for secret in "$DB_RUNTIME_SECRET" "$DB_MIGRATION_SECRET" "$CSRF_SECRET"; do
  gcloud secrets add-iam-policy-binding "$secret" \
    --member="serviceAccount:$DEPLOY_SA" \
    --role=roles/secretmanager.viewer >/dev/null
done

gcloud artifacts repositories add-iam-policy-binding "$AR_REPO" \
  --location="$REGION" \
  --member="serviceAccount:$DEPLOY_SA" \
  --role=roles/artifactregistry.writer >/dev/null
for target_service_account in "$RUNTIME_SA" "$MIGRATION_SA"; do
  gcloud iam service-accounts add-iam-policy-binding "$target_service_account" \
    --member="serviceAccount:$DEPLOY_SA" \
    --role=roles/iam.serviceAccountUser >/dev/null
done

echo "=== STEP 9/11 PRE-CREATE CLOUD RUN RESOURCES ==="
if ! gcloud run services describe "$SERVICE" --region="$REGION" >/dev/null 2>&1; then
  gcloud run deploy "$SERVICE" \
    --region="$REGION" \
    --image="$PLACEHOLDER_IMAGE" \
    --service-account="$BOOTSTRAP_SA" \
    --execution-environment=gen2 \
    --network="$VPC" \
    --subnet="$SUBNET" \
    --vpc-egress=private-ranges-only \
    --set-cloudsql-instances="$CONNECTION_NAME" \
    --cpu=1 \
    --memory=512Mi \
    --concurrency=20 \
    --min=0 \
    --max=3 \
    --timeout=180s \
    --ingress=all \
    --no-allow-unauthenticated \
    --quiet
fi
if ! gcloud run jobs describe "$MIGRATION_JOB" --region="$REGION" >/dev/null 2>&1; then
  gcloud run jobs create "$MIGRATION_JOB" \
    --region="$REGION" \
    --image="$PLACEHOLDER_IMAGE" \
    --service-account="$BOOTSTRAP_SA" \
    --network="$VPC" \
    --subnet="$SUBNET" \
    --vpc-egress=private-ranges-only \
    --set-cloudsql-instances="$CONNECTION_NAME" \
    --cpu=1 \
    --memory=512Mi \
    --tasks=1 \
    --max-retries=0 \
    --task-timeout=10m
fi
gcloud run services add-iam-policy-binding "$SERVICE" \
  --region="$REGION" \
  --member="serviceAccount:$DEPLOY_SA" \
  --role=roles/run.admin >/dev/null
gcloud run jobs add-iam-policy-binding "$MIGRATION_JOB" \
  --region="$REGION" \
  --member="serviceAccount:$DEPLOY_SA" \
  --role=roles/run.admin >/dev/null

echo "=== STEP 10/11 GITHUB WORKLOAD IDENTITY ==="
if ! gcloud iam workload-identity-pools describe "$WIF_POOL" --location=global >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create "$WIF_POOL" \
    --location=global \
    --display-name="GitHub Actions"
fi
ATTRIBUTE_MAPPING="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_id=assertion.repository_id,attribute.repository_owner_id=assertion.repository_owner_id,attribute.ref=assertion.ref,attribute.environment=assertion.environment"
ATTRIBUTE_CONDITION="assertion.repository_id=='${GITHUB_REPO_ID}' && assertion.repository_owner_id=='${GITHUB_OWNER_ID}' && assertion.ref=='refs/heads/main' && assertion.environment=='production' && assertion.event_name=='workflow_dispatch' && assertion.workflow_ref=='${GITHUB_WORKFLOW_REF}'"
if gcloud iam workload-identity-pools providers describe "$WIF_PROVIDER" \
  --location=global \
  --workload-identity-pool="$WIF_POOL" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers update-oidc "$WIF_PROVIDER" \
    --location=global \
    --workload-identity-pool="$WIF_POOL" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="$ATTRIBUTE_MAPPING" \
    --attribute-condition="$ATTRIBUTE_CONDITION"
else
  gcloud iam workload-identity-pools providers create-oidc "$WIF_PROVIDER" \
    --location=global \
    --workload-identity-pool="$WIF_POOL" \
    --display-name="Lake Forest main production" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="$ATTRIBUTE_MAPPING" \
    --attribute-condition="$ATTRIBUTE_CONDITION"
fi
while IFS= read -r provider_name; do
  [[ "${provider_name##*/}" == "$WIF_PROVIDER" ]] || \
    die "WIF pool must be dedicated; unexpected provider ${provider_name##*/}"
done < <(gcloud iam workload-identity-pools providers list \
  --location=global \
  --workload-identity-pool="$WIF_POOL" \
  --format='value(name)')
WIF_PRINCIPAL="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WIF_POOL}/attribute.repository_id/${GITHUB_REPO_ID}"
gcloud iam service-accounts add-iam-policy-binding "$DEPLOY_SA" \
  --member="$WIF_PRINCIPAL" \
  --role=roles/iam.workloadIdentityUser >/dev/null
WIF_PROVIDER_NAME="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${WIF_POOL}/providers/${WIF_PROVIDER}"

echo "=== STEP 11/11 SUMMARY ==="
cat <<EOF
GCP_PROJECT_ID=$PROJECT_ID
GCP_REGION=$REGION
GCP_ARTIFACT_REGISTRY_REPOSITORY=$AR_REPO
GCP_CLOUD_RUN_SERVICE=$SERVICE
GCP_MIGRATION_JOB=$MIGRATION_JOB
GCP_CLOUD_SQL_INSTANCE=$CONNECTION_NAME
GCP_RUNTIME_SERVICE_ACCOUNT=$RUNTIME_SA
GCP_MIGRATION_SERVICE_ACCOUNT=$MIGRATION_SA
GCP_DB_RUNTIME_SECRET=$DB_RUNTIME_SECRET
GCP_DB_MIGRATION_SECRET=$DB_MIGRATION_SECRET
GCP_CSRF_SECRET=$CSRF_SECRET
GCP_CLAMAV_HOST=$CLAMAV_IP
GCP_VPC_NETWORK=$VPC
GCP_VPC_SUBNET=$SUBNET
GCP_WORKLOAD_IDENTITY_PROVIDER=$WIF_PROVIDER_NAME
GCP_DEPLOY_SERVICE_ACCOUNT=$DEPLOY_SA
EOF
echo "=== LFA BOOTSTRAP COMPLETE ==="
