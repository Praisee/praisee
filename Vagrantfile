# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure(2) do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://atlas.hashicorp.com/search.
  config.vm.box = "ubuntu/trusty64"

  # Disable automatic box update checking. If you disable this, then
  # boxes will only be checked for updates when the user runs
  # `vagrant box outdated`. This is not recommended.
  # config.vm.box_check_update = false

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  config.vm.network "forwarded_port", guest: 3000, host: 3001 # Guest server
  config.vm.network "forwarded_port", guest: 5432, host: 5432 # PostgreSQL
  config.vm.network "forwarded_port", guest: 9200, host: 9200 # Elasticsearch
  config.vm.network "forwarded_port", guest: 9300, host: 9300 # Elasticsearch
  config.vm.network "forwarded_port", guest: 5601, host: 5601 # Kibana
  config.vm.network "forwarded_port", guest: 5858, host: 5859 # NodeJS Debugger
  config.vm.network "forwarded_port", guest: 6379, host: 6379 # Redis
  config.vm.network "forwarded_port", guest: 5672, host: 5672 # RabbitMQ
  config.vm.network "forwarded_port", guest: 15672, host: 15672 # RabbitMQ Management
  config.vm.network "forwarded_port", guest: 8888, host: 8888 # Thumbor

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  # config.vm.network "private_network", ip: "192.168.33.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  #
  config.vm.provider "virtualbox" do |vm|
    vm.memory = 2048
  end

  # View the documentation for the provider you are using for more
  # information on available options.

  # Define a Vagrant Push strategy for pushing to Atlas. Other push strategies
  # such as FTP and Heroku are also available. See the documentation at
  # https://docs.vagrantup.com/v2/push/atlas.html for more information.
  # config.push.define "atlas" do |push|
  #   push.app = "YOUR_ATLAS_USERNAME/YOUR_APPLICATION_NAME"
  # end

  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  config.vm.provision "shell", privileged: false, inline: <<-'SHELL'

    set -e

    printf '-'
    printf 'Provisioning started'
    printf '-'

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
    sudo sed -i -E "s/#?\s*?listen_addresses\s*?=\s*?'.*?'/listen_addresses = '*'/g" /etc/postgresql/9.5/main/postgresql.conf
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
    sudo update-rc.d elasticsearch defaults
    sudo sed -i -E 's/#?\s+?network.host.+?/network.host: 0/g' /etc/elasticsearch/elasticsearch.yml
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
    sudo sed -i -E "s/bind\s+[^\s]+/bind 0.0.0.0/g" /etc/redis/redis.conf
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
    echo 'export PATH="/home/vagrant/.pyenv/bin:$PATH"' >> ~/.bash_profile
    echo 'eval "$(pyenv init -)"' >> ~/.bash_profile
    echo 'export PYTHONPATH=/usr/lib/python2.7/dist-packages:$PYTHONPATH' >> ~/.bash_profile
    source ~/.bash_profile
    pyenv install 2.7
    pyenv global 2.7
    pyenv shell 2.7

    printf '-'
    printf 'Installing Thumbor at http://localhost:8888'
    printf '-'

    sudo DEBIAN_FRONTEND=noninteractive sudo apt-get install -y libpng12-dev libtiff5-dev libpng-dev libjasper-dev libwebp-dev libcurl4-openssl-dev python-pgmagick libmagick++-dev graphicsmagick libopencv-dev python-opencv
    sudo ln /dev/null /dev/raw1394 # http://stackoverflow.com/a/34820475/786810
    pip install -r /vagrant/pz-server/src/uploads/thumbor/requirements.txt

    printf '-'
    printf 'Provisioning complete'
    printf '-'

    set +e

  SHELL
end

# Unused Recipes:

# printf '-'
# printf 'Installing ZeroMQ 4.1.5'
# printf '-'
#
# # https://gist.github.com/cdjhlee/b8e3c927a01b0948b42d
# sudo DEBIAN_FRONTEND=noninteractive sudo apt-get install -y libtool pkg-config build-essential autoconf automake uuid-dev
# wget https://github.com/zeromq/zeromq4-1/releases/download/v4.1.5/zeromq-4.1.5.tar.gz
# tar -zxf zeromq-4.1.5.tar.gz
# cd zeromq-4.1.5
# ./configure
# sudo make install
# sudo ldconfig # Install ZeroMQ driver on Linux

