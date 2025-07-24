FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# ポートは Gunicorn 用
EXPOSE 8000

# GunicornでFlaskを起動（本番用WSGIサーバー）
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]
