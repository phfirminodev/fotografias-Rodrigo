#!/usr/bin/env python3
"""
RODRIGO ZAGO — SCRIPT DE SINCRONIZAÇÃO / UPLOAD PARA O CLOUDFLARE R2

Este script permite enviar automaticamente toda a pasta de mídia (vídeos e fotos)
para o seu Bucket do Cloudflare R2 utilizando a API S3 compatível.

Instalação de dependências:
    pip install boto3

Como usar:
    1. No painel da Cloudflare -> R2 -> Manage R2 API Tokens -> Create API Token (com permissão Object Read & Write).
    2. Copie:
       - Account ID
       - Access Key ID
       - Secret Access Key
       - Nome do seu Bucket (ex: 'rodrigo-zago-assets')
    3. Execute:
       python upload_to_r2.py --account-id SEU_ACCOUNT_ID --access-key SUA_ACCESS_KEY --secret-key SUA_SECRET_KEY --bucket SEU_BUCKET_NAME
"""

import os
import sys
import argparse
import mimetypes

def upload_directory_to_r2(directory, bucket_name, account_id, access_key, secret_key):
    try:
        import boto3
        from botocore.config import Config
    except ImportError:
        print("[ERRO] O pacote 'boto3' não está instalado.")
        print("Para instalar, execute: pip install boto3")
        sys.exit(1)

    endpoint_url = f"https://{account_id}.r2.cloudflarestorage.com"
    
    print(f"[*] Conectando ao Cloudflare R2 em: {endpoint_url}")
    s3 = boto3.client(
        's3',
        endpoint_url=endpoint_url,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version='s3v4')
    )

    print(f"[*] Escaneando arquivos em: {directory}")
    total_uploaded = 0
    total_bytes = 0

    for root, _, files in os.walk(directory):
        for file in files:
            local_path = os.path.join(root, file)
            # Converte para caminho relativo com barras normais (ex: assets/video/filme-carol-alex.mp4)
            relative_path = os.path.relpath(local_path, start=".").replace("\\", "/")
            
            # Identifica o tipo MIME
            content_type, _ = mimetypes.guess_type(local_path)
            if not content_type:
                if relative_path.endswith('.mp4'):
                    content_type = 'video/mp4'
                else:
                    content_type = 'application/octet-stream'

            file_size_mb = os.path.getsize(local_path) / (1024 * 1024)
            print(f"[->] Enviando {relative_path} ({file_size_mb:.2f} MB)...", end=" ", flush=True)

            try:
                s3.upload_file(
                    local_path,
                    bucket_name,
                    relative_path,
                    ExtraArgs={
                        'ContentType': content_type,
                        'CacheControl': 'public, max-age=31536000, immutable'
                    }
                )
                print("✓ OK")
                total_uploaded += 1
                total_bytes += os.path.getsize(local_path)
            except Exception as e:
                print(f"✗ FALHA: {e}")

    total_mb = total_bytes / (1024 * 1024)
    print(f"\n[✓] Concluído! {total_uploaded} arquivos sincronizados com o R2 ({total_mb:.2f} MB).")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Upload de ativos para o Cloudflare R2")
    parser.add_argument('--dir', default='assets', help="Pasta de origem (padrão: assets)")
    parser.add_argument('--bucket', required=True, help="Nome do Bucket no R2")
    parser.add_argument('--account-id', required=True, help="Cloudflare Account ID")
    parser.add_argument('--access-key', required=True, help="R2 Access Key ID")
    parser.add_argument('--secret-key', required=True, help="R2 Secret Access Key")
    args = parser.parse_args()

    upload_directory_to_r2(args.dir, args.bucket, args.account_id, args.access_key, args.secret_key)
