FROM python:3.12

WORKDIR /app


COPY requirements.txt .

# RUN pip install django psycopg2

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

RUN chmod +x script.sh

CMD ["/bin/bash", "script.sh"]
