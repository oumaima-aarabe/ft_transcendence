# Generated by Django 4.2.20 on 2025-03-15 06:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('pong_game', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='game',
            name='theme',
        ),
    ]
