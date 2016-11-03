#!/usr/bin/env bash

set -e

printf '-'
printf 'Provisioning started'
printf '-'

#printf '-'
#printf 'Creating praisee user'
#printf '-'
#
#sudo sudo useradd -m -s /bin/bash praisee
#sudo sudo mkdir /var/praisee
#sudo sudo chown praisee:praisee -R /var/praisee/
#
#cd /home/praisee

printf '-'
printf 'Setting up system'
printf '-'

sudo apt-get install -y python-dev

printf '-'
printf 'Installing Node 6'
printf '-'

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
source ~/.bashrc
nvm install 6

printf '-'
printf 'Adding auto-mounting db disk'
printf '-'

echo UUID=`sudo blkid -s UUID -o value /dev/disk/by-id/google-db` /mnt/disks/db ext4 discard,defaults 1 1 | sudo tee -a /etc/fstab

printf '-'
printf 'Adding Postgres sources'
printf '-'

sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" >> /etc/apt/sources.list.d/pgdg.list'
wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | sudo apt-key add -
sudo DEBIAN_FRONTEND=noninteractive apt-get update

printf '-'
printf 'Installing PostgreSQL 9.5'
printf '-'

sudo DEBIAN_FRONTEND=noninteractive apt-get install -y postgresql postgresql-contrib
sudo mkdir -p /mnt/disks/db/postgresql/9.5/main
sudo chown -R postgres:postgres /mnt/disks/db/postgresql
sudo cp /var/praisee/env-production/configs/etc/postgresql/9.5/main/postgresql.conf /etc/postgresql/9.5/main/postgresql.conf
#sudo sed -i -E "s/#?\s*?listen_addresses\s*?=\s*?'.*?'/listen_addresses = '*'/g" /etc/postgresql/9.5/main/postgresql.conf
sudo pg_dropcluster 9.5 main --stop
sudo pg_createcluster 9.5 main -d /mnt/disks/db/postgresql/9.5/main
sudo sed -i -E '/local\s+all\s+postgres\s+/ahost    all             postgres        samenet                 trust' /etc/postgresql/9.5/main/pg_hba.conf
sudo sed -i -E 's/(local\s+all\s+postgres\s+)peer/\1trust/g' /etc/postgresql/9.5/main/pg_hba.conf
sudo service postgresql restart
createdb -U postgres praisee

printf '-'
printf 'Java 8 Repo, see http://tecadmin.net/install-oracle-java-8-jdk-8-ubuntu-via-ppa/'
printf '-'

sudo DEBIAN_FRONTEND=noninteractive add-apt-repository -y ppa:webupd8team/java
sudo DEBIAN_FRONTEND=noninteractive apt-get update

printf '-'
printf 'Installing Java 8'
printf '-'

sudo debconf-set-selections <<< 'oracle-java8-installer shared/accepted-oracle-license-v1-1 select true'
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y oracle-java8-installer
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y oracle-java8-set-default

printf '-'
printf 'Installing Elastic'
printf '-'

# wget -q https://download.elasticsearch.org/elasticsearch/release/org/elasticsearch/distribution/deb/elasticsearch/5.0.0-alpha2/elasticsearch-5.0.0-alpha2.deb -O ~/elasticsearch.deb && sudo dpkg -i ~/elasticsearch.deb && rm -f ~/elasticsearch.deb
wget -q https://download.elasticsearch.org/elasticsearch/release/org/elasticsearch/distribution/deb/elasticsearch/2.3.2/elasticsearch-2.3.2.deb -O ~/elasticsearch.deb && sudo dpkg -i ~/elasticsearch.deb && rm -f ~/elasticsearch.deb
sudo mkdir -p /mnt/disks/db/elasticsearch
sudo chown -R elasticsearch:elasticsearch /mnt/disks/db/elasticsearch
#sudo sed -i -E 's/#?\s+?network.host.+?/network.host: 0/g' /etc/elasticsearch/elasticsearch.yml
sudo cp /var/praisee/env-production/configs/etc/elasticsearch/elasticsearch.yml /etc/elasticsearch/elasticsearch.yml
sudo update-rc.d elasticsearch defaults
sudo /usr/share/elasticsearch/bin/plugin install mobz/elasticsearch-head
sudo service elasticsearch start

printf '-'
printf 'Installing Kibana'
printf '-'

# wget -q https://download.elastic.co/kibana/kibana/kibana_5.0.0-alpha2_amd64.deb -O ~/kibana.deb && sudo dpkg -i ~/kibana.deb && rm -f ~/kibana.deb
wget -q https://download.elastic.co/kibana/kibana/kibana_4.5.0_amd64.deb -O ~/kibana.deb && sudo dpkg -i ~/kibana.deb && rm -f ~/kibana.deb
sudo update-rc.d kibana defaults 96 9
sudo service kibana start

printf '-'
printf 'Installing Redis'
printf '-'

# https://www.digitalocean.com/community/tutorials/how-to-configure-a-redis-cluster-on-ubuntu-14-04
sudo DEBIAN_FRONTEND=noninteractive add-apt-repository -y ppa:chris-lea/redis-server
sudo DEBIAN_FRONTEND=noninteractive apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y redis-server
sudo mkdir -p /mnt/disks/db/redis
sudo chown -R redis:redis /mnt/disks/db/redis
#sudo sed -i -E "s/bind\s+[^\s]+/bind 0.0.0.0/g" /etc/redis/redis.conf
sudo cp /var/praisee/env-production/configs/etc/redis/redis.conf /etc/redis/redis.conf
sudo update-rc.d redis-server defaults
sudo /etc/init.d/redis-server restart

printf '-'
printf 'Installing RabbitMQ'
printf '-'

echo 'deb http://www.rabbitmq.com/debian/ testing main' | sudo tee /etc/apt/sources.list.d/rabbitmq.list
wget -O- https://www.rabbitmq.com/rabbitmq-release-signing-key.asc | sudo apt-key add -
sudo DEBIAN_FRONTEND=noninteractive sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive sudo apt-get install -y rabbitmq-server
sudo rabbitmq-plugins enable rabbitmq_management
sudo rabbitmq-plugins enable rabbitmq_management_visualiser

printf '-'
printf 'Adding RabbitMQ management user admin/admin and dev/dev at http://localhost:15672'
printf '-'

# Admin user
sudo rabbitmqctl add_user admin admin
sudo rabbitmqctl set_user_tags admin administrator
sudo rabbitmqctl set_permissions -p / admin ".*" ".*" ".*"

# Development environment user
sudo rabbitmqctl add_user dev dev
sudo rabbitmqctl set_permissions -p / dev ".*" ".*" ".*"

printf '-'
printf 'Installing Git'
printf '-'

sudo DEBIAN_FRONTEND=noninteractive sudo apt-add-repository -y ppa:git-core/ppa
sudo DEBIAN_FRONTEND=noninteractive sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive sudo apt-get install -y git

printf '-'
printf 'Installing Python'
printf '-'

# https://github.com/yyuu/pyenv/wiki/Common-build-problems
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y make build-essential checkinstall gcc libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev xz-utils
curl -L https://raw.githubusercontent.com/yyuu/pyenv-installer/master/bin/pyenv-installer | bash
echo 'export PATH="/home/praisee/.pyenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc
pyenv install 2.7
pyenv global 2.7
pyenv shell 2.7

printf '-'
printf 'Installing Thumbor'
printf '-'

sudo DEBIAN_FRONTEND=noninteractive sudo apt-get install -y libpng12-dev libtiff5-dev libpng-dev libjasper-dev libwebp-dev libcurl4-openssl-dev python-pgmagick libmagick++-dev graphicsmagick libopencv-dev python-opencv
pushd ~/.pyenv/versions/2.7/lib/python2.7/site-packages
ln --symbolic /usr/lib/python2.7/dist-packages/cv2.so
ln --symbolic /usr/lib/python2.7/dist-packages/cv.py
ln --symbolic /usr/lib/python2.7/dist-packages/cv.pyc
popd
sudo ln /dev/null /dev/raw1394 # http://stackoverflow.com/a/34820475/786810
pushd /var/praisee/pz-server/src/photos/photo-server/
pip install -r requirements.txt
popd

printf '-'
printf 'Provisioning complete'
printf '-'

set +e
