# Generated by Django 4.1.6 on 2023-03-25 13:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='first_name',
            field=models.TextField(max_length=32),
        ),
        migrations.AlterField(
            model_name='user',
            name='last_name',
            field=models.TextField(max_length=32),
        ),
    ]
