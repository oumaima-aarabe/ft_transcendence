FROM python:3.12



# COPY ./requirements.txt /

RUN pip install django psycopg2

WORKDIR /app
COPY . .
RUN chmod +x script.sh
EXPOSE 8000
CMD ["/bin/bash", "script.sh"]
